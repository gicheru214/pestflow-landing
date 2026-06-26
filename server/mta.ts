import type { Submission } from "@shared/schema";

type MtaSyncResult =
  | { ok: true; subscriberId?: number; e164Number?: string }
  | { ok: false; skipped?: boolean; error: string };

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function toMtaSubscriberNumber(raw: string | null | undefined): number | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const withCountry = digits.length === 10 ? `1${digits}` : digits.length === 11 && digits.startsWith("1") ? digits : "";
  if (!withCountry) return null;
  const n = Number.parseInt(withCountry, 10);
  if (!Number.isFinite(n) || n < 10_000_000_000) return null;
  return n;
}

function toMtaSubscriberLookup(raw: string | null | undefined): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return null;
}

export function parseMtaGroupIds(value: string | undefined): number[] {
  return (value ?? "")
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function fallbackLastName(firstName: string, lastName: string | null): string {
  if (lastName) return lastName;
  return "Lead";
}

export async function syncSubmissionToMta(
  submission: Pick<
    Submission,
    "type" | "firstName" | "lastName" | "email" | "phone" | "companyName" | "technicians"
  >,
): Promise<MtaSyncResult> {
  const apiKey = cleanText(process.env.MTA_MARKETING_API_KEY ?? process.env.MTA_API_KEY);
  if (!apiKey) {
    return { ok: false, skipped: true, error: "MTA API key not configured" };
  }

  const number = toMtaSubscriberNumber(submission.phone);
  if (!number) {
    return { ok: false, skipped: true, error: "Submission has no valid phone number" };
  }

  const firstName = cleanText(submission.firstName) ?? "there";
  const lastName = fallbackLastName(firstName, cleanText(submission.lastName));
  const groupIds = parseMtaGroupIds(process.env.MTA_MARKETING_GROUP_IDS ?? process.env.MTA_GROUP_IDS);

  const body: Record<string, unknown> = {
    number,
    firstName,
    lastName,
    email: cleanText(submission.email) ?? undefined,
  };
  if (groupIds.length) body.groupIds = groupIds;

  const postResult = await sendMtaSubscriberRequest(apiKey, "POST", "https://api.mobile-text-alerts.com/v3/subscribers", body);
  let response = postResult.response;
  let data = postResult.data;

  if (!response.ok && response.status >= 500) {
    const lookup = toMtaSubscriberLookup(submission.phone);
    if (lookup) {
      const patchResult = await sendMtaSubscriberRequest(
        apiKey,
        "PATCH",
        `https://api.mobile-text-alerts.com/v3/subscribers/${encodeURIComponent(lookup)}`,
        { ...body, number: Number.parseInt(lookup, 10) },
      );
      response = patchResult.response;
      data = patchResult.data;
    }
  }

  if (!response.ok || !data.data?.id) {
    return {
      ok: false,
      error: data.message || `MTA subscriber sync failed: HTTP ${response.status}`,
    };
  }

  return {
    ok: true,
    subscriberId: data.data.id,
    e164Number: data.data.e164Number,
  };
}

async function sendMtaSubscriberRequest(
  apiKey: string,
  method: "POST" | "PATCH",
  url: string,
  body: Record<string, unknown>,
) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as {
    data?: { id?: number; e164Number?: string };
    message?: string;
  };
  return { response, data };
}

export function syncSubmissionToMtaInBackground(submission: Submission): void {
  syncSubmissionToMta(submission)
    .then((result) => {
      if (!result.ok && !result.skipped) {
        console.warn("[mta] submission sync failed:", result.error);
      }
    })
    .catch((error) => {
      console.warn("[mta] submission sync threw:", error instanceof Error ? error.message : error);
    });
}
