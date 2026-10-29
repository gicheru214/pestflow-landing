import { timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { isRetryableNoAnswer, usPhone, validZone, withinCallHours } from "./ai-lead-caller-policy";

const CONSENT_VERSION = "pestflow-ai-call-v1";
const CONSENT_TEXT = "I agree that PestFlow may call me using an AI voice to answer questions and help book a setup call, with no more than two calls about this request. I can ask to stop calls at any time. This is not required to get the playbook.";
const WORKER_INTERVAL_MS = 15_000;
const SECOND_ATTEMPT_DELAY_MS = 4 * 60 * 60_000;

type LeadCall = {
  submission_id: string;
  name: string;
  email: string;
  phone: string;
  time_zone: string;
  status: string;
  attempts: number;
  call_id: string | null;
  booked_event_uri: string | null;
};

function configured(): boolean {
  return process.env.AI_LEAD_CALL_ENABLED === "true"
    && Boolean(process.env.VAPI_API_KEY && process.env.VAPI_ASSISTANT_ID
      && process.env.VAPI_PHONE_NUMBER_ID && process.env.VAPI_WEBHOOK_SECRET
      && process.env.CALENDLY_API_TOKEN && process.env.CALENDLY_PESTFLOW_EVENT_TYPE_URI);
}

export async function ensureAiLeadCallerSchema(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ai_lead_calls (
      submission_id text PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL,
      phone text NOT NULL,
      time_zone text NOT NULL,
      status text NOT NULL DEFAULT 'disabled',
      attempts integer NOT NULL DEFAULT 0,
      call_id text UNIQUE,
      ended_reason text,
      next_attempt_at timestamptz,
      consent_version text NOT NULL,
      consent_text text NOT NULL,
      consent_at timestamptz NOT NULL DEFAULT now(),
      consent_ip text,
      consent_user_agent text,
      booked_event_uri text,
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT ai_lead_calls_attempts CHECK (attempts BETWEEN 0 AND 2)
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS ai_lead_calls_due_idx ON ai_lead_calls (next_attempt_at) WHERE status = 'queued'`);
}

export async function captureAiCallConsent(input: {
  submissionId: string; name: string; email: string; phone: string;
  timeZone: unknown; consent: unknown; consentVersion: unknown;
  ip: string | undefined; userAgent: string | undefined;
}): Promise<void> {
  if (input.consent !== true || input.consentVersion !== CONSENT_VERSION) return;
  const phone = usPhone(input.phone);
  const zone = validZone(input.timeZone);
  if (!phone || !zone) return;
  const status = configured() ? "queued" : "disabled";
  const nextAttemptAt = status === "queued" ? new Date() : null;
  await db.execute(sql`
    INSERT INTO ai_lead_calls (
      submission_id, name, email, phone, time_zone, status, next_attempt_at,
      consent_version, consent_text, consent_ip, consent_user_agent
    ) SELECT
      ${input.submissionId}, ${input.name}, ${input.email}, ${phone}, ${zone},
      ${status}, ${nextAttemptAt}, ${CONSENT_VERSION}, ${CONSENT_TEXT},
      ${input.ip?.slice(0, 100) ?? null}, ${input.userAgent?.slice(0, 500) ?? null}
    WHERE NOT EXISTS (
      SELECT 1 FROM ai_lead_calls previous
      WHERE previous.phone = ${phone}
        AND (previous.status = 'opted_out'
          OR (previous.status <> 'disabled' AND previous.consent_at > now() - interval '30 days'))
    )
    ON CONFLICT (submission_id) DO NOTHING
  `);
  if (status === "queued") void dispatchDueAiLeadCalls().catch((error) => {
    console.warn("[ai-lead-caller] immediate dispatch failed:", error instanceof Error ? error.message : error);
  });
}

function rows<T>(result: unknown): T[] {
  return (result as { rows: T[] }).rows;
}

async function dispatchDueAiLeadCalls(): Promise<void> {
  if (!configured()) return;
  const due = rows<LeadCall>(await db.execute(sql`
    SELECT submission_id, name, email, phone, time_zone, status, attempts, call_id, booked_event_uri
    FROM ai_lead_calls WHERE status = 'queued' AND next_attempt_at <= now()
    ORDER BY next_attempt_at LIMIT 20
  `));
  for (const lead of due) {
    if (!withinCallHours(lead.time_zone, new Date())) continue;
    const claimed = rows<{ submission_id: string }>(await db.execute(sql`
      UPDATE ai_lead_calls SET status = 'dispatching', attempts = attempts + 1,
        next_attempt_at = NULL, updated_at = now()
      WHERE submission_id = ${lead.submission_id} AND status = 'queued'
        AND attempts < 2 AND next_attempt_at <= now()
      RETURNING submission_id
    `));
    if (!claimed.length) continue;
    try {
      const response = await fetch("https://api.vapi.ai/call", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistantId: process.env.VAPI_ASSISTANT_ID,
          phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
          customer: { number: lead.phone, name: lead.name },
          name: `PestFlow lead ${lead.submission_id.slice(0, 8)}`,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`Vapi create call returned ${response.status}`);
      const data = await response.json() as { id?: string };
      if (!data.id) throw new Error("Vapi returned no call ID");
      await db.execute(sql`
        UPDATE ai_lead_calls SET call_id = ${data.id}, status = 'calling', updated_at = now()
        WHERE submission_id = ${lead.submission_id} AND status = 'dispatching'
      `);
    } catch (error) {
      // A timeout may mean Vapi accepted the call. Do not auto retry an unknown outcome.
      console.warn("[ai-lead-caller] dispatch uncertain:", error instanceof Error ? error.message : error);
      await db.execute(sql`
        UPDATE ai_lead_calls SET status = 'needs_review', updated_at = now()
        WHERE submission_id = ${lead.submission_id} AND status = 'dispatching'
      `);
    }
  }
}

export function startAiLeadCallerWorker(): void {
  setInterval(() => void dispatchDueAiLeadCalls().catch((error) => {
    console.warn("[ai-lead-caller] worker failed:", error instanceof Error ? error.message : error);
  }), WORKER_INTERVAL_MS).unref();
}

export async function markAiLeadBookedByCalendly(submissionId: string | undefined, email: string, eventUri: string): Promise<void> {
  if (!email || !eventUri) return;
  await db.execute(sql`
    UPDATE ai_lead_calls SET status = 'booked', booked_event_uri = ${eventUri},
      next_attempt_at = NULL, updated_at = now()
    WHERE (submission_id = ${submissionId ?? ""} OR lower(email) = ${email.trim().toLowerCase()})
      AND status IN ('queued', 'calling', 'connected')
  `);
}

function authorized(req: Request): boolean {
  const expected = process.env.VAPI_WEBHOOK_SECRET;
  const supplied = req.header("authorization")?.replace(/^Bearer /i, "");
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function calendly(path: string, options?: RequestInit): Promise<any> {
  const response = await fetch(`https://api.calendly.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.CALENDLY_API_TOKEN}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Calendly returned ${response.status}`);
  return response.json();
}

async function availableTimes(lead: LeadCall, localDate?: string): Promise<Array<{ start_time: string; local_time: string; local_date: string }>> {
  const start = new Date(Date.now() + 60_000);
  const end = new Date(Date.now() + 7 * 24 * 60 * 60_000);
  const query = new URLSearchParams({
    event_type: process.env.CALENDLY_PESTFLOW_EVENT_TYPE_URI!,
    start_time: start.toISOString(), end_time: end.toISOString(),
  });
  const data = await calendly(`/event_type_available_times?${query}`);
  return (Array.isArray(data.collection) ? data.collection : [])
    .filter((slot: any) => slot.status === "available" && typeof slot.start_time === "string")
    .map((slot: any) => {
      const date = new Date(slot.start_time);
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: lead.time_zone, year: "numeric", month: "2-digit", day: "2-digit",
      }).formatToParts(date);
      const part = (type: string) => parts.find((item) => item.type === type)?.value;
      return {
        start_time: slot.start_time,
        local_time: new Intl.DateTimeFormat("en-US", {
          timeZone: lead.time_zone, weekday: "long", month: "short", day: "numeric",
          hour: "numeric", minute: "2-digit", timeZoneName: "short",
        }).format(date),
        local_date: `${part("year")}-${part("month")}-${part("day")}`,
      };
    })
    .filter((slot: { local_date: string }) => !localDate || slot.local_date === localDate);
}

async function handleTool(callId: string, name: string, args: Record<string, unknown>): Promise<unknown> {
  const [lead] = rows<LeadCall>(await db.execute(sql`
    SELECT submission_id, name, email, phone, time_zone, status, attempts, call_id, booked_event_uri
    FROM ai_lead_calls WHERE call_id = ${callId}
  `));
  if (!lead || lead.status === "opted_out") return { error: "Lead unavailable" };
  if (name === "stop_pestflow_calls") {
    await db.execute(sql`UPDATE ai_lead_calls SET status = 'opted_out', next_attempt_at = NULL, updated_at = now() WHERE call_id = ${callId}`);
    return { stopped: true };
  }
  if (name === "pestflow_available_times") {
    if (!process.env.CALENDLY_API_TOKEN || !process.env.CALENDLY_PESTFLOW_EVENT_TYPE_URI) return { error: "Scheduling unavailable" };
    const localDate = typeof args.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(args.date) ? args.date : undefined;
    return { time_zone: lead.time_zone, slots: (await availableTimes(lead, localDate)).slice(0, 15) };
  }
  if (name === "book_pestflow_setup_call") {
    if (lead.booked_event_uri) return { booked: true, event: lead.booked_event_uri };
    if (typeof args.start_time !== "string" || Number.isNaN(Date.parse(args.start_time))) return { error: "Choose an available start_time" };
    const available = await availableTimes(lead);
    const selected = available.find((slot) => slot.start_time === args.start_time);
    if (!selected) return { error: "That time is no longer available. Check availability again." };
    const claimed = rows<{ submission_id: string }>(await db.execute(sql`
      UPDATE ai_lead_calls SET status = 'booking', updated_at = now()
      WHERE call_id = ${callId} AND status IN ('calling', 'connected') AND booked_event_uri IS NULL
      RETURNING submission_id
    `));
    if (!claimed.length) return { error: "Booking already in progress or call ended" };
    try {
      const data = await calendly("/invitees", {
        method: "POST",
        body: JSON.stringify({
          event_type: process.env.CALENDLY_PESTFLOW_EVENT_TYPE_URI,
          start_time: selected.start_time,
          invitee: { name: lead.name, email: lead.email, timezone: lead.time_zone },
          location: { kind: "outbound_call", location: lead.phone },
          tracking: { utm_source: "pestflow_ai_lead_call", utm_content: lead.submission_id },
        }),
      });
      const event = data.resource?.event;
      if (!event) throw new Error("Calendly returned no event URI");
      await db.execute(sql`
        UPDATE ai_lead_calls SET status = 'booked', booked_event_uri = ${event},
          next_attempt_at = NULL, updated_at = now() WHERE call_id = ${callId}
      `);
      return { booked: true, local_time: selected.local_time, event };
    } catch (error) {
      // Calendly may have booked on a timeout. Stop further automated booking attempts.
      await db.execute(sql`UPDATE ai_lead_calls SET status = 'needs_review', updated_at = now() WHERE call_id = ${callId} AND status = 'booking'`);
      console.warn("[ai-lead-caller] booking uncertain:", error instanceof Error ? error.message : error);
      return { error: "Booking could not be confirmed. Please use the PestFlow Calendly link on our website." };
    }
  }
  return { error: "Unknown tool" };
}

export async function vapiLeadCallerWebhook(req: Request, res: Response): Promise<void> {
  if (!authorized(req)) { res.sendStatus(401); return; }
  const message = req.body?.message;
  const callId = message?.call?.id;
  if (typeof callId !== "string") { res.sendStatus(400); return; }
  if (message.type === "tool-calls") {
    const toolCalls = Array.isArray(message.toolCallList) ? message.toolCallList : [];
    const results = [];
    for (const item of toolCalls.slice(0, 5)) {
      const name = item?.function?.name;
      let args = item?.function?.arguments ?? {};
      if (typeof args === "string") {
        try { args = JSON.parse(args); } catch { args = {}; }
      }
      const result = typeof name === "string"
        ? await handleTool(callId, name, typeof args === "object" && args !== null ? args : {})
        : { error: "Invalid tool" };
      results.push({ name, toolCallId: item.id, result: JSON.stringify(result) });
    }
    res.json({ results });
    return;
  }
  if (message.type === "status-update" && message.status === "in-progress") {
    await db.execute(sql`UPDATE ai_lead_calls SET status = 'connected', updated_at = now() WHERE call_id = ${callId} AND status = 'calling'`);
  }
  if (message.type === "end-of-call-report") {
    const reason = String(message.endedReason ?? message.call?.endedReason ?? "unknown").slice(0, 120);
    const retry = isRetryableNoAnswer(reason);
    const retryAt = new Date(Date.now() + SECOND_ATTEMPT_DELAY_MS);
    await db.execute(sql`
      UPDATE ai_lead_calls SET ended_reason = ${reason},
        status = CASE WHEN ${retry} AND attempts = 1 AND status = 'calling' THEN 'queued' ELSE 'finished' END,
        next_attempt_at = CASE WHEN ${retry} AND attempts = 1 AND status = 'calling' THEN ${retryAt} ELSE NULL END,
        updated_at = now()
      WHERE call_id = ${callId} AND status IN ('calling', 'connected')
    `);
  }
  res.json({ ok: true });
}
