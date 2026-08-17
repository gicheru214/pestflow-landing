import type { InsertSubmission } from "@shared/schema";

type JsonRecord = Record<string, unknown>;

export interface CalendlyBookingResources {
  inviteeUri: string;
  invitee: JsonRecord;
  scheduledEvent: JsonRecord;
}

export interface CalendlyProspectLike {
  submittedAt?: Date | string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
  technicians?: string | null;
}

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function calendlyApiUri(value: unknown, resource: "event" | "invitee"): string {
  const candidate = text(value);
  if (!candidate) return "";
  try {
    const url = new URL(candidate);
    const eventPath = /^\/scheduled_events\/[A-Za-z0-9_-]+$/;
    const inviteePath = /^\/scheduled_events\/[A-Za-z0-9_-]+\/invitees\/[A-Za-z0-9_-]+$/;
    if (
      url.protocol !== "https:"
      || url.hostname !== "api.calendly.com"
      || !(resource === "event" ? eventPath : inviteePath).test(url.pathname)
    ) {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

function phoneDigits(value: unknown): string {
  const digits = text(value).replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits.length === 10 ? digits : "";
}

function questionAnswer(invitee: JsonRecord, matcher: RegExp): string {
  const answers = invitee.questions_and_answers;
  if (!Array.isArray(answers)) return "";
  for (const entry of answers) {
    const answer = record(entry);
    if (matcher.test(text(answer.question))) return text(answer.answer);
  }
  return "";
}

function calendlyPhone(invitee: JsonRecord, scheduledEvent: JsonRecord): string {
  const location = record(scheduledEvent.location);
  return phoneDigits(invitee.text_reminder_number)
    || phoneDigits(questionAnswer(invitee, /phone|mobile|text/i))
    || phoneDigits(location.location);
}

export function findMatchingCalendlyProspect<T extends CalendlyProspectLike>(
  invitee: JsonRecord,
  scheduledEvent: JsonRecord,
  prospects: T[],
): T | undefined {
  const inviteeEmail = text(invitee.email).toLowerCase();
  const inviteePhone = calendlyPhone(invitee, scheduledEvent);
  return [...prospects]
    .sort((left, right) => {
      const rightTime = right.submittedAt
        ? new Date(right.submittedAt).getTime()
        : 0;
      const leftTime = left.submittedAt
        ? new Date(left.submittedAt).getTime()
        : 0;
      return rightTime - leftTime;
    })
    .find((prospect) =>
      (inviteeEmail
        && text(prospect.email).toLowerCase() === inviteeEmail)
      || (inviteePhone
        && phoneDigits(prospect.phone) === inviteePhone),
    );
}

function inviteeName(invitee: JsonRecord): {
  firstName: string;
  lastName: string;
} {
  const explicitFirst = text(invitee.first_name);
  const explicitLast = text(invitee.last_name);
  if (explicitFirst || explicitLast) {
    return {
      firstName: explicitFirst || explicitLast,
      lastName: explicitLast,
    };
  }

  const parts = text(invitee.name).split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Calendly",
    lastName: parts.slice(1).join(" "),
  };
}

export function isPestFlowSetupEvent(
  scheduledEvent: JsonRecord,
  expectedEventTypeUri = "",
): boolean {
  const eventTypeUri = text(scheduledEvent.event_type);
  if (expectedEventTypeUri.trim()) {
    return eventTypeUri === expectedEventTypeUri.trim();
  }
  const name = text(scheduledEvent.name).toLowerCase();
  return name.includes("pestflow") && /\bset\s*up\b/.test(name);
}

export function calendlyBookingSubmission(
  inviteeUri: string,
  invitee: JsonRecord,
  scheduledEvent: JsonRecord = {},
  existingProspect?: CalendlyProspectLike,
): InsertSubmission | null {
  const email = text(invitee.email).toLowerCase();
  if (!email || !email.includes("@")) return null;

  const inviteeContact = inviteeName(invitee);
  const firstName = text(existingProspect?.firstName)
    || inviteeContact.firstName;
  const lastName = text(existingProspect?.lastName)
    || inviteeContact.lastName;
  const phone = calendlyPhone(invitee, scheduledEvent)
    || phoneDigits(existingProspect?.phone);

  return {
    type: "calendly_booking",
    firstName,
    lastName,
    email,
    phone: phone || null,
    companyName: text(existingProspect?.companyName)
      || "Calendly — PestFlow Set Up Call",
    // The invitee URI is Calendly's stable booking identity. Keeping it in an
    // existing text column lets the webhook remain idempotent without a schema
    // migration, and it is not shown as a website in the admin lead table.
    website: inviteeUri,
    technicians: text(existingProspect?.technicians)
      || "Booking captured without prospect outreach",
  };
}

async function fetchCalendlyResource(
  uri: string,
  accessToken: string,
  fetchImpl: typeof fetch,
): Promise<JsonRecord> {
  const response = await fetchImpl(uri, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Calendly resource request failed (${response.status})`);
  }
  return record(record(await response.json()).resource);
}

export async function resolveCalendlyBooking(
  webhookBody: unknown,
  accessToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<CalendlyBookingResources> {
  const body = record(webhookBody);
  const payload = record(body.payload);
  const inviteeUri = calendlyApiUri(payload.uri, "invitee");
  const eventUri = calendlyApiUri(payload.event, "event");
  if (!inviteeUri || !eventUri) {
    throw new Error("Calendly webhook did not include valid resource URIs");
  }

  const [invitee, scheduledEvent] = await Promise.all([
    fetchCalendlyResource(inviteeUri, accessToken, fetchImpl),
    fetchCalendlyResource(eventUri, accessToken, fetchImpl),
  ]);
  return { inviteeUri, invitee, scheduledEvent };
}
