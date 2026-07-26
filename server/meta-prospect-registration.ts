import {
  and,
  eq,
  inArray,
  isNotNull,
  isNull,
  lt,
  lte,
  or,
  sql,
} from "drizzle-orm";
import {
  metaProspectRegistrations,
  submissions,
  type MetaProspectRegistration,
  type Submission,
} from "@shared/schema";
import { db } from "./db";
import {
  adminProspectCanonicalKey,
  buildProspectGroups,
  deterministicProspectEventId,
  hashProspectKey,
  isTestProspect,
  latestNonEmpty,
  type ProspectGroup,
} from "./prospect-identity";
import {
  sendLeadEventDetailed,
  type MetaEventResult,
} from "./meta-capi";
import { captureProspectLifecycleEvent } from "./posthog-server";

const MAX_ATTEMPTS = 8;
const WORKER_INTERVAL_MS = 30_000;
const META_MAX_EVENT_AGE_MS = 7 * 24 * 60 * 60_000 - 10 * 60_000;
const EVENT_ID_PATTERN = /^[A-Za-z0-9._:-]{8,100}$/;
const RETRY_DELAYS_MS = [
  60_000,
  5 * 60_000,
  30 * 60_000,
  2 * 60 * 60_000,
  6 * 60 * 60_000,
  12 * 60 * 60_000,
  24 * 60 * 60_000,
  24 * 60 * 60_000,
];

function seededReceiptEventId(prospectKeyHash: string): string | undefined {
  const encoded = process.env.META_PROSPECT_SEED_RECEIPTS;
  if (!encoded) return undefined;
  for (const entry of encoded.split(",")) {
    const [hash, eventId] = entry.trim().split("=");
    if (
      hash === prospectKeyHash
      && /^[a-f0-9]{64}$/.test(hash)
      && validPreferredEventId(eventId)
    ) {
      return eventId;
    }
  }
  return undefined;
}

export type MetaProspectStatus =
  | "queued"
  | "sending"
  | "sent"
  | "failed"
  | "expired";

export interface ProspectRequestContext {
  preferredEventId?: string;
  eventSourceUrl?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}

export interface ProspectRegistrationResult {
  tracked: boolean;
  prospectKeyHash?: string;
  eventId?: string;
  status?: MetaProspectStatus;
  shouldFireBrowser?: boolean;
}

export interface ProspectTrackingSummary {
  total: number;
  sent: number;
  queued: number;
  sending: number;
  failed: number;
  expired: number;
}

function validPreferredEventId(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized && EVENT_ID_PATTERN.test(normalized)
    ? normalized
    : undefined;
}

function asDate(value: Date | string | null | undefined): Date {
  const parsed = value ? new Date(value) : new Date();
  return Number.isFinite(parsed.getTime()) ? parsed : new Date();
}

function isRecentEnoughForMeta(eventTime: Date, now = new Date()): boolean {
  const age = now.getTime() - eventTime.getTime();
  return age >= -5 * 60_000 && age <= META_MAX_EVENT_AGE_MS;
}

function retryAt(attempt: number): Date {
  const delay = RETRY_DELAYS_MS[
    Math.min(Math.max(attempt - 1, 0), RETRY_DELAYS_MS.length - 1)
  ];
  return new Date(Date.now() + delay);
}

function defaultSourceUrl(type: string): string {
  if (type === "newsletter") return "https://pestflow.org/playbook";
  if (type === "demo") return "https://pestflow.org/demo";
  if (type === "audit") return "https://pestflow.org/audit";
  return "https://pestflow.org/";
}

function lifecycleProperties(row: MetaProspectRegistration) {
  return {
    meta_status: row.status,
    source_type: row.sourceType,
    attempts: row.attempts,
    has_email: Boolean(row.email),
    has_phone: Boolean(row.phone),
    has_fbc: Boolean(row.fbc),
    has_fbp: Boolean(row.fbp),
  };
}

export async function ensureMetaProspectSchema(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS meta_prospect_registrations (
      prospect_key_hash varchar(64) PRIMARY KEY,
      event_id varchar(100) NOT NULL,
      first_submission_id varchar NOT NULL,
      latest_submission_id varchar NOT NULL,
      first_submitted_at timestamp NOT NULL,
      latest_submitted_at timestamp NOT NULL,
      event_time timestamp NOT NULL,
      source_type text NOT NULL,
      first_name text,
      last_name text,
      email text,
      phone text,
      event_source_url text,
      client_ip_address text,
      client_user_agent text,
      fbc text,
      fbp text,
      status text NOT NULL DEFAULT 'queued',
      attempts integer NOT NULL DEFAULT 0,
      error text,
      events_received integer,
      fbtrace_id text,
      last_attempt_at timestamp,
      next_retry_at timestamp,
      sent_at timestamp,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS meta_prospect_due_idx
    ON meta_prospect_registrations (status, next_retry_at)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS meta_prospect_latest_idx
    ON meta_prospect_registrations (latest_submitted_at DESC)
  `);
}

async function getRegistration(
  prospectKeyHash: string,
): Promise<MetaProspectRegistration | undefined> {
  const [row] = await db.select()
    .from(metaProspectRegistrations)
    .where(eq(metaProspectRegistrations.prospectKeyHash, prospectKeyHash));
  return row;
}

async function insertRegistration(
  submission: Submission,
  prospectKeyHash: string,
  context: ProspectRequestContext,
  status: MetaProspectStatus,
): Promise<{ row: MetaProspectRegistration; created: boolean }> {
  const submittedAt = asDate(submission.submittedAt);
  const eventId =
    validPreferredEventId(context.preferredEventId)
    || deterministicProspectEventId(prospectKeyHash);
  const [inserted] = await db.insert(metaProspectRegistrations).values({
    prospectKeyHash,
    eventId,
    firstSubmissionId: submission.id,
    latestSubmissionId: submission.id,
    firstSubmittedAt: submittedAt,
    latestSubmittedAt: submittedAt,
    eventTime: submittedAt,
    sourceType: submission.type,
    firstName: submission.firstName || null,
    lastName: submission.lastName || null,
    email: submission.email || null,
    phone: submission.phone || null,
    eventSourceUrl: context.eventSourceUrl || defaultSourceUrl(submission.type),
    clientIpAddress: context.clientIpAddress || null,
    clientUserAgent: context.clientUserAgent || null,
    fbc: context.fbc || null,
    fbp: context.fbp || null,
    status,
    nextRetryAt: status === "queued" ? new Date() : null,
  }).onConflictDoNothing().returning();

  if (inserted) {
    void captureProspectLifecycleEvent(
      "Prospect Registered",
      prospectKeyHash,
      lifecycleProperties(inserted),
      submittedAt,
    );
    return { row: inserted, created: true };
  }
  const existing = await getRegistration(prospectKeyHash);
  if (!existing) throw new Error("Prospect registration conflict could not be resolved");
  return { row: existing, created: false };
}

async function updateExistingRegistration(
  existing: MetaProspectRegistration,
  submission: Submission,
  context: ProspectRequestContext,
): Promise<MetaProspectRegistration> {
  const submittedAt = asDate(submission.submittedAt);
  const isLatest = submittedAt >= existing.latestSubmittedAt;
  const canRequeue =
    isLatest
    && isRecentEnoughForMeta(submittedAt)
    && (
      existing.status === "expired"
      || (existing.status === "failed" && !existing.nextRetryAt)
    );
  const [updated] = await db.update(metaProspectRegistrations).set({
    latestSubmissionId: isLatest ? submission.id : existing.latestSubmissionId,
    latestSubmittedAt: isLatest ? submittedAt : existing.latestSubmittedAt,
    sourceType: isLatest ? submission.type : existing.sourceType,
    firstName: submission.firstName || existing.firstName,
    lastName: submission.lastName || existing.lastName,
    email: submission.email || existing.email,
    phone: submission.phone || existing.phone,
    eventSourceUrl: context.eventSourceUrl || existing.eventSourceUrl,
    clientIpAddress: context.clientIpAddress || existing.clientIpAddress,
    clientUserAgent: context.clientUserAgent || existing.clientUserAgent,
    fbc: context.fbc || existing.fbc,
    fbp: context.fbp || existing.fbp,
    eventId: canRequeue
      ? (
        validPreferredEventId(context.preferredEventId)
        || deterministicProspectEventId(existing.prospectKeyHash)
      )
      : existing.eventId,
    eventTime: canRequeue ? submittedAt : existing.eventTime,
    status: canRequeue ? "queued" : existing.status,
    attempts: canRequeue ? 0 : existing.attempts,
    error: canRequeue ? null : existing.error,
    nextRetryAt: canRequeue ? new Date() : existing.nextRetryAt,
    updatedAt: new Date(),
  }).where(eq(
    metaProspectRegistrations.prospectKeyHash,
    existing.prospectKeyHash,
  )).returning();
  return updated;
}

export async function registerSubmissionProspect(
  submission: Submission,
  context: ProspectRequestContext = {},
): Promise<ProspectRegistrationResult> {
  if (isTestProspect(submission)) return { tracked: false };

  const canonicalKey = adminProspectCanonicalKey(submission);
  const prospectKeyHash = hashProspectKey(canonicalKey);
  const existing = await getRegistration(prospectKeyHash);
  const initialStatus: MetaProspectStatus = isRecentEnoughForMeta(
    asDate(submission.submittedAt),
  ) ? "queued" : "expired";
  const result = existing
    ? {
      row: await updateExistingRegistration(existing, submission, context),
      created: false,
    }
    : await insertRegistration(
      submission,
      prospectKeyHash,
      context,
      initialStatus,
    );

  return {
    tracked: true,
    prospectKeyHash,
    eventId: result.row.eventId,
    status: result.row.status as MetaProspectStatus,
    shouldFireBrowser: result.created || result.row.status !== "sent",
  };
}

function groupIdentity(group: ProspectGroup<Submission>) {
  return {
    firstName: latestNonEmpty(group.rows, "firstName"),
    lastName: latestNonEmpty(group.rows, "lastName"),
    email: latestNonEmpty(group.rows, "email"),
    phone: latestNonEmpty(group.rows, "phone"),
  };
}

async function reconcileGroup(
  group: ProspectGroup<Submission>,
): Promise<MetaProspectRegistration> {
  const existing = await getRegistration(group.prospectKeyHash);
  const latestAt = asDate(group.latest.submittedAt);
  const firstAt = asDate(group.first.submittedAt);
  const identity = groupIdentity(group);
  if (!existing) {
    const seededEventId = seededReceiptEventId(group.prospectKeyHash);
    const status: MetaProspectStatus = seededEventId
      ? "sent"
      : isRecentEnoughForMeta(latestAt)
        ? "queued"
        : "expired";
    const { row } = await insertRegistration(
      {
        ...group.latest,
        firstName: identity.firstName || "",
        lastName: identity.lastName || "",
        email: identity.email || "",
        phone: identity.phone,
        submittedAt: latestAt,
      },
      group.prospectKeyHash,
      { preferredEventId: seededEventId },
      status,
    );
    if (seededEventId || firstAt.getTime() !== latestAt.getTime()) {
      const [updated] = await db.update(metaProspectRegistrations).set({
        firstSubmissionId: group.first.id,
        firstSubmittedAt: firstAt,
        attempts: seededEventId ? 1 : row.attempts,
        eventsReceived: seededEventId ? 1 : row.eventsReceived,
        sentAt: seededEventId ? latestAt : row.sentAt,
        updatedAt: new Date(),
      }).where(eq(
        metaProspectRegistrations.prospectKeyHash,
        group.prospectKeyHash,
      )).returning();
      return updated;
    }
    return row;
  }

  const shouldRequeue =
    existing.status !== "sent"
    && existing.status !== "sending"
    && isRecentEnoughForMeta(latestAt)
    && latestAt > existing.eventTime;
  const [updated] = await db.update(metaProspectRegistrations).set({
    firstSubmissionId: group.first.id,
    latestSubmissionId: group.latest.id,
    firstSubmittedAt: firstAt,
    latestSubmittedAt: latestAt,
    eventTime: shouldRequeue ? latestAt : existing.eventTime,
    sourceType: group.latest.type,
    firstName: identity.firstName || existing.firstName,
    lastName: identity.lastName || existing.lastName,
    email: identity.email || existing.email,
    phone: identity.phone || existing.phone,
    status: shouldRequeue ? "queued" : existing.status,
    attempts: shouldRequeue ? 0 : existing.attempts,
    error: shouldRequeue ? null : existing.error,
    nextRetryAt: shouldRequeue ? new Date() : existing.nextRetryAt,
    updatedAt: new Date(),
  }).where(eq(
    metaProspectRegistrations.prospectKeyHash,
    group.prospectKeyHash,
  )).returning();
  return updated;
}

export async function reconcileAllProspectRegistrations(): Promise<ProspectTrackingSummary> {
  const allSubmissions = await db.select().from(submissions);
  const groups = buildProspectGroups(allSubmissions);
  for (const group of groups) await reconcileGroup(group);
  return getProspectTrackingSummary();
}

async function persistMetaResult(
  claimed: MetaProspectRegistration,
  attempt: number,
  result: MetaEventResult,
): Promise<void> {
  if (result.ok) {
    const [sent] = await db.update(metaProspectRegistrations).set({
      status: "sent",
      attempts: attempt,
      error: null,
      eventsReceived: result.eventsReceived ?? 1,
      fbtraceId: result.fbtraceId || null,
      nextRetryAt: null,
      sentAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(
      metaProspectRegistrations.prospectKeyHash,
      claimed.prospectKeyHash,
    )).returning();
    void captureProspectLifecycleEvent(
      "Prospect Meta Sent",
      sent.prospectKeyHash,
      lifecycleProperties(sent),
    );
    return;
  }

  const shouldRetry = result.retryable && attempt < MAX_ATTEMPTS;
  const [failed] = await db.update(metaProspectRegistrations).set({
    status: "failed",
    attempts: attempt,
    error: result.error || "Meta did not accept the prospect event",
    eventsReceived: result.eventsReceived ?? null,
    fbtraceId: result.fbtraceId || null,
    nextRetryAt: shouldRetry ? retryAt(attempt) : null,
    updatedAt: new Date(),
  }).where(eq(
    metaProspectRegistrations.prospectKeyHash,
    claimed.prospectKeyHash,
  )).returning();
  void captureProspectLifecycleEvent(
    "Prospect Meta Failed",
    failed.prospectKeyHash,
    {
      ...lifecycleProperties(failed),
      retryable: shouldRetry,
      configured: result.configured,
      http_status: result.status ?? null,
    },
  );
}

export async function processProspectRegistration(
  prospectKeyHash: string,
): Promise<MetaEventResult | null> {
  const now = new Date();
  const [claimed] = await db.update(metaProspectRegistrations).set({
    status: "sending",
    lastAttemptAt: now,
    nextRetryAt: null,
    updatedAt: now,
  }).where(and(
    eq(metaProspectRegistrations.prospectKeyHash, prospectKeyHash),
    inArray(metaProspectRegistrations.status, ["queued", "failed"]),
    lt(metaProspectRegistrations.attempts, MAX_ATTEMPTS),
  )).returning();
  if (!claimed) return null;

  if (!isRecentEnoughForMeta(claimed.eventTime, now)) {
    const [expired] = await db.update(metaProspectRegistrations).set({
      status: "expired",
      error: "Outside Meta's seven-day website-event delivery window",
      nextRetryAt: null,
      updatedAt: now,
    }).where(eq(
      metaProspectRegistrations.prospectKeyHash,
      prospectKeyHash,
    )).returning();
    void captureProspectLifecycleEvent(
      "Prospect Meta Expired",
      expired.prospectKeyHash,
      lifecycleProperties(expired),
    );
    return null;
  }

  const attempt = claimed.attempts + 1;
  const result = await sendLeadEventDetailed({
    eventId: claimed.eventId,
    eventSourceUrl:
      claimed.eventSourceUrl || defaultSourceUrl(claimed.sourceType),
    eventTime: claimed.eventTime,
    leadSource: claimed.createdAt.getTime() + 60_000 < now.getTime()
      ? "prospect-backfill"
      : "prospect-ledger",
    prospectKeyHash: claimed.prospectKeyHash,
    userData: {
      email: claimed.email || undefined,
      phone: claimed.phone || undefined,
      firstName: claimed.firstName || undefined,
      lastName: claimed.lastName || undefined,
      clientIpAddress: claimed.clientIpAddress || undefined,
      clientUserAgent: claimed.clientUserAgent || undefined,
      fbc: claimed.fbc || undefined,
      fbp: claimed.fbp || undefined,
    },
  });
  await persistMetaResult(claimed, attempt, result);
  return result;
}

export async function processDueProspectRegistrations(
  limit = 25,
): Promise<number> {
  const now = new Date();
  const staleCutoff = new Date(now.getTime() - 5 * 60_000);
  await db.update(metaProspectRegistrations).set({
    status: "failed",
    error: "Recovered an interrupted Meta delivery attempt",
    nextRetryAt: now,
    updatedAt: now,
  }).where(and(
    eq(metaProspectRegistrations.status, "sending"),
    or(
      isNull(metaProspectRegistrations.lastAttemptAt),
      lte(metaProspectRegistrations.lastAttemptAt, staleCutoff),
    ),
  ));

  const due = await db.select({
    prospectKeyHash: metaProspectRegistrations.prospectKeyHash,
  }).from(metaProspectRegistrations).where(and(
    lt(metaProspectRegistrations.attempts, MAX_ATTEMPTS),
    or(
      eq(metaProspectRegistrations.status, "queued"),
      and(
        eq(metaProspectRegistrations.status, "failed"),
        isNotNull(metaProspectRegistrations.nextRetryAt),
        lte(metaProspectRegistrations.nextRetryAt, now),
      ),
    ),
  )).limit(limit);

  let processed = 0;
  for (const row of due) {
    const result = await processProspectRegistration(row.prospectKeyHash);
    if (result) processed += 1;
  }
  return processed;
}

export function startMetaProspectWorker(): () => void {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const processed = await processDueProspectRegistrations();
      if (processed) {
        console.log(`[meta-prospect] processed ${processed} registration(s)`);
      }
    } catch (error) {
      console.warn(
        "[meta-prospect] worker failed:",
        error instanceof Error ? error.message : error,
      );
    } finally {
      running = false;
    }
  };
  const initial = setTimeout(() => void tick(), 1_000);
  const interval = setInterval(() => void tick(), WORKER_INTERVAL_MS);
  initial.unref?.();
  interval.unref?.();
  return () => {
    clearTimeout(initial);
    clearInterval(interval);
  };
}

export async function getProspectTrackingSummary(): Promise<ProspectTrackingSummary> {
  const rows = await db.select({
    status: metaProspectRegistrations.status,
    count: sql<number>`count(*)::int`,
  }).from(metaProspectRegistrations).groupBy(metaProspectRegistrations.status);
  const summary: ProspectTrackingSummary = {
    total: 0,
    sent: 0,
    queued: 0,
    sending: 0,
    failed: 0,
    expired: 0,
  };
  for (const row of rows) {
    const count = Number(row.count) || 0;
    summary.total += count;
    if (row.status in summary && row.status !== "total") {
      summary[row.status as MetaProspectStatus] = count;
    }
  }
  return summary;
}

export async function getAuditSubmissionsWithMetaStatus() {
  const [allSubmissions, registrations] = await Promise.all([
    db.select().from(submissions),
    db.select().from(metaProspectRegistrations),
  ]);
  const byHash = new Map(
    registrations.map((registration) => [
      registration.prospectKeyHash,
      registration,
    ]),
  );
  return allSubmissions.map((submission) => {
    if (isTestProspect(submission)) return submission;
    const prospectKeyHash = hashProspectKey(
      adminProspectCanonicalKey(submission),
    );
    const registration = byHash.get(prospectKeyHash);
    return {
      ...submission,
      metaProspectKeyHash: prospectKeyHash,
      metaEventId: registration?.eventId ?? null,
      metaStatus: registration?.status ?? "missing",
      metaAttempts: registration?.attempts ?? 0,
      metaError: registration?.error ?? null,
      metaEventTime: registration?.eventTime ?? null,
      metaSentAt: registration?.sentAt ?? null,
    };
  });
}
