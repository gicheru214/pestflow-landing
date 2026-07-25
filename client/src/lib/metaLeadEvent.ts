export const META_LEAD_EVENT_COOKIE = "pestflow_meta_lead_event_id";

const EVENT_ID_PATTERN = /^[A-Za-z0-9._:-]{8,100}$/;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 48;
const FIRED_KEY_PREFIX = "pestflow_meta_lead_fired:";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function normalizeMetaLeadEventId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return EVENT_ID_PATTERN.test(normalized) ? normalized : null;
}

function readMetaLeadEventId(): string | null {
  for (const part of document.cookie.split(";")) {
    const [name, ...rawValue] = part.trim().split("=");
    if (name !== META_LEAD_EVENT_COOKIE) continue;
    try {
      return normalizeMetaLeadEventId(decodeURIComponent(rawValue.join("=")));
    } catch {
      return null;
    }
  }
  return null;
}

export function createMetaLeadEventId(): string {
  const randomPart = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
  return `pestflow-lead-${randomPart}`;
}

export function persistMetaLeadEventId(eventId: string): string {
  const sharedDomain = window.location.hostname === "pestflow.org"
    || window.location.hostname.endsWith(".pestflow.org")
    ? "; Domain=.pestflow.org; Secure"
    : "";
  document.cookie = `${META_LEAD_EVENT_COOKIE}=${encodeURIComponent(eventId)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${sharedDomain}`;
  return eventId;
}

export function beginMetaLeadEvent(): string {
  return persistMetaLeadEventId(createMetaLeadEventId());
}

export function getOrCreateMetaLeadEventId(preferred?: string | null): string {
  return persistMetaLeadEventId(
    normalizeMetaLeadEventId(preferred)
      ?? readMetaLeadEventId()
      ?? createMetaLeadEventId(),
  );
}

/**
 * Fire the browser copy of a qualified Lead exactly once per tab. The same
 * event ID is sent by CAPI so Meta can deduplicate the two copies.
 */
export function fireMetaLeadOnce(eventId: string): boolean {
  const normalized = normalizeMetaLeadEventId(eventId);
  if (!normalized) return false;

  const firedKey = `${FIRED_KEY_PREFIX}${normalized}`;
  try {
    if (sessionStorage.getItem(firedKey) === "1") return true;
  } catch {
    // Meta still deduplicates a repeated browser call by event ID.
  }

  if (typeof window.fbq !== "function") return false;
  window.fbq(
    "track",
    "Lead",
    { value: 10, currency: "USD" },
    { eventID: normalized },
  );
  try {
    sessionStorage.setItem(firedKey, "1");
  } catch {
    // A storage restriction should not block the conversion event.
  }
  return true;
}
