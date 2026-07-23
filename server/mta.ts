import type { Submission } from "@shared/schema";

export type MtaSyncResult =
  | { ok: true; subscriberId: number; e164Number?: string; groupIds: number[] }
  | {
      ok: false;
      skipped?: boolean;
      retryable?: boolean;
      statusCode?: number;
      error: string;
      groupIds: number[];
    };

const MTA_REQUEST_TIMEOUT_MS = 8_000;

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function toMtaSubscriberNumber(raw: string | null | undefined): number | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const withCountry = digits.length === 10
    ? `1${digits}`
    : digits.length === 11 && digits.startsWith("1")
      ? digits
      : "";
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

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

export async function syncSubmissionToMta(
  submission: Pick<
    Submission,
    "type" | "firstName" | "lastName" | "email" | "phone" | "companyName" | "technicians"
  >,
): Promise<MtaSyncResult> {
  const apiKey = cleanText(process.env.MTA_MARKETING_API_KEY ?? process.env.MTA_API_KEY);
  if (!apiKey) {
    return {
      ok: false,
      retryable: false,
      error: "MTA marketing API key not configured",
      groupIds: [],
    };
  }

  const number = toMtaSubscriberNumber(submission.phone);
  if (!number) {
    return {
      ok: false,
      skipped: true,
      retryable: false,
      error: "Submission has no valid US phone number",
      groupIds: [],
    };
  }

  const groupIds = parseMtaGroupIds(process.env.MTA_MARKETING_GROUP_IDS);
  if (!groupIds.length) {
    return {
      ok: false,
      retryable: false,
      error: "MTA_MARKETING_GROUP_IDS is not configured",
      groupIds,
    };
  }

  const firstName = cleanText(submission.firstName) ?? "there";
  const lastName = fallbackLastName(firstName, cleanText(submission.lastName));
  const body: Record<string, unknown> = {
    number,
    firstName,
    lastName,
    email: cleanText(submission.email) ?? undefined,
  };

  let postResult;
  try {
    postResult = await sendMtaSubscriberRequest(
      apiKey,
      "POST",
      "https://api.mobile-text-alerts.com/v3/subscribers",
      body,
    );
  } catch (error) {
    return {
      ok: false,
      retryable: true,
      error: error instanceof Error ? error.message : "MTA subscriber sync request failed",
      groupIds,
    };
  }
  let response = postResult.response;
  let data = postResult.data;

  // Existing subscribers must still be updated and explicitly re-enrolled in
  // the marketing group. Including groupIds in a subscriber upsert alone does
  // not reliably start an MTA drip campaign.
  if (!response.ok && (response.status === 409 || response.status === 422 || response.status >= 500)) {
    const lookup = toMtaSubscriberLookup(submission.phone);
    if (lookup) {
      try {
        const patchResult = await sendMtaSubscriberRequest(
          apiKey,
          "PATCH",
          `https://api.mobile-text-alerts.com/v3/subscribers/${encodeURIComponent(lookup)}`,
          { ...body, number: Number.parseInt(lookup, 10) },
        );
        response = patchResult.response;
        data = patchResult.data;
      } catch (error) {
        return {
          ok: false,
          retryable: true,
          error: error instanceof Error ? error.message : "MTA subscriber update request failed",
          groupIds,
        };
      }
    }
  }

  if (!response.ok || !data.data?.id) {
    return {
      ok: false,
      retryable: isRetryableStatus(response.status),
      statusCode: response.status,
      error: data.message || `MTA subscriber sync failed: HTTP ${response.status}`,
      groupIds,
    };
  }

  const subscriberId = data.data.id;
  for (const groupId of groupIds) {
    const enrollment = await addSubscriberToMtaGroup(apiKey, groupId, subscriberId);
    if (!enrollment.ok) {
      return {
        ok: false,
        retryable: isRetryableStatus(enrollment.statusCode),
        statusCode: enrollment.statusCode,
        error: enrollment.error,
        groupIds,
      };
    }
  }

  return {
    ok: true,
    subscriberId,
    e164Number: data.data.e164Number,
    groupIds,
  };
}

async function addSubscriberToMtaGroup(
  apiKey: string,
  groupId: number,
  subscriberId: number,
): Promise<{ ok: true } | { ok: false; statusCode: number; error: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MTA_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://api.mobile-text-alerts.com/v3/groups/${groupId}/subscribers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriberId,
          addToDripCampaigns: true,
        }),
        signal: controller.signal,
      },
    );
    const data = (await response.json().catch(() => ({}))) as { message?: string };
    if (response.status === 409 || (response.status === 422 && /already/i.test(data.message ?? ""))) {
      return { ok: true };
    }
    if (!response.ok) {
      return {
        ok: false,
        statusCode: response.status,
        error: data.message || `MTA group enrollment failed: HTTP ${response.status}`,
      };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      statusCode: 503,
      error: error instanceof Error && error.name === "AbortError"
        ? `MTA group enrollment timed out after ${MTA_REQUEST_TIMEOUT_MS}ms`
        : error instanceof Error
          ? error.message
          : "MTA group enrollment request failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function sendMtaSubscriberRequest(
  apiKey: string,
  method: "POST" | "PATCH",
  url: string,
  body: Record<string, unknown>,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MTA_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = (await response.json().catch(() => ({}))) as {
      data?: { id?: number; e164Number?: string };
      message?: string;
    };
    return { response, data };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`MTA request timed out after ${MTA_REQUEST_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
