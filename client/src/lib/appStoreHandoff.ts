import type { MarketingAttribution } from "@/lib/marketingAttribution";

export const APP_STORE_URL = "https://apps.apple.com/us/app/pestflow/id6773204838";
export const APP_STORE_HANDOFF_EVENT = "AppStoreHandoff";

const EVENT_ID_PATTERN = /^[A-Za-z0-9._:-]{8,100}$/;
const FIRED_KEY_PREFIX = "pestflow_app_store_handoff_fired:";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function normalizeAppStoreHandoffEventId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return EVENT_ID_PATTERN.test(normalized) ? normalized : null;
}

export function createAppStoreHandoffEventId(): string {
  const randomPart = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
  return `pestflow-appstore-${randomPart}`;
}

export function buildAppStoreSuccessPath(
  attribution: MarketingAttribution,
  eventId: string,
  source = "home_mobile_top",
): string {
  const params = new URLSearchParams({
    source,
    app_store_event_id: eventId,
  });
  Object.entries(attribution).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return `/app-store-success?${params.toString()}`;
}

/**
 * Record the App Store handoff as its own Meta funnel milestone. This is
 * intentionally not a Lead or Signup: opening the store proves intent, but it
 * does not prove that an account or install was completed.
 */
export function fireMetaAppStoreHandoffOnce(eventId: string): boolean {
  const normalized = normalizeAppStoreHandoffEventId(eventId);
  if (!normalized) return false;

  const firedKey = `${FIRED_KEY_PREFIX}${normalized}`;
  try {
    if (sessionStorage.getItem(firedKey) === "1") return true;
  } catch {
    // A storage restriction should not block the Meta event.
  }

  if (typeof window.fbq !== "function") return false;
  window.fbq(
    "trackCustom",
    APP_STORE_HANDOFF_EVENT,
    {
      content_name: "PestFlow iOS App",
      content_category: "mobile_app",
      destination: "apple_app_store",
    },
    { eventID: normalized },
  );
  try {
    sessionStorage.setItem(firedKey, "1");
  } catch {
    // Meta still deduplicates a repeated browser call by event ID.
  }
  return true;
}
