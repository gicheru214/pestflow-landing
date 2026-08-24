import type { MarketingAttribution } from "@/lib/marketingAttribution";
import type { OnboardingDeviceSignals } from "@/lib/onboardingHandoff";

export const APP_STORE_URL = "https://apps.apple.com/us/app/pestflow/id6773204838";
export const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=org.pestflow.app";
export const DESKTOP_LOGIN_URL = "https://app.pestflow.org/login";
export const APP_STORE_HANDOFF_EVENT = "AppStoreHandoff";

export type AppHandoffPlatform = "ios_ipados" | "android" | "desktop";
export type AppHandoffTelemetryDestination =
  | "apple_app_store"
  | "google_play_store"
  | "desktop_login";

export interface AppHandoffDestination {
  platform: AppHandoffPlatform;
  telemetryDestination: AppHandoffTelemetryDestination;
  url: string;
  label: string;
  ctaLabel: string;
}

export function resolveAppHandoffDestination({
  userAgent,
  userAgentDataMobile,
  maxTouchPoints = 0,
  platform = "",
}: OnboardingDeviceSignals): AppHandoffDestination {
  if (/Android/i.test(userAgent)) {
    return {
      platform: "android",
      telemetryDestination: "google_play_store",
      url: GOOGLE_PLAY_URL,
      label: "Google Play",
      ctaLabel: "Open PestFlow in Google Play",
    };
  }

  const isIosOrIpadOs = /iPhone|iPad|iPod/i.test(userAgent)
    || (
      maxTouchPoints > 1
      && (/Macintosh/i.test(userAgent) || /^MacIntel$/i.test(platform))
    );
  if (isIosOrIpadOs || (userAgentDataMobile === true && /AppleWebKit/i.test(userAgent))) {
    return {
      platform: "ios_ipados",
      telemetryDestination: "apple_app_store",
      url: APP_STORE_URL,
      label: "the App Store",
      ctaLabel: "Open PestFlow in the App Store",
    };
  }

  return {
    platform: "desktop",
    telemetryDestination: "desktop_login",
    url: DESKTOP_LOGIN_URL,
    label: "PestFlow login",
    ctaLabel: "Continue to PestFlow login",
  };
}

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
  params.set("handoff", "app_store");
  return `/signup-success?${params.toString()}`;
}

/**
 * Record the App Store handoff as its own Meta funnel milestone. This is
 * intentionally not a Lead or Signup: opening the store proves intent, but it
 * does not prove that an account or install was completed.
 */
export function fireMetaAppStoreHandoffOnce(
  eventId: string,
  destination: Pick<AppHandoffDestination, "platform" | "telemetryDestination"> = {
    platform: "ios_ipados",
    telemetryDestination: "apple_app_store",
  },
): boolean {
  const normalized = normalizeAppStoreHandoffEventId(eventId);
  if (!normalized) return false;
  if (destination.platform === "desktop") return false;

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
      content_name: destination.platform === "android"
        ? "PestFlow Android App"
        : "PestFlow iOS App",
      content_category: "mobile_app",
      destination: destination.telemetryDestination,
      platform: destination.platform,
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
