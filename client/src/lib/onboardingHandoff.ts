export const MOBILE_ONBOARDING_URL = "https://app.pestflow.org/mobile/onboard/feature";
export const DESKTOP_SIGNUP_URL = "https://app.pestflow.org/signup";

export interface OnboardingDeviceSignals {
  userAgent: string;
  userAgentDataMobile?: boolean;
  maxTouchPoints?: number;
  platform?: string;
}

export function isMobileOnboardingClient({
  userAgent,
  userAgentDataMobile,
  maxTouchPoints = 0,
  platform = "",
}: OnboardingDeviceSignals): boolean {
  if (userAgentDataMobile === true) return true;
  if (/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(userAgent)) {
    return true;
  }
  return maxTouchPoints > 1
    && (/Macintosh/i.test(userAgent) || /^MacIntel$/i.test(platform));
}

export function isMobileOnboardingBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    userAgentData?: { mobile?: boolean };
    maxTouchPoints?: number;
  };
  return isMobileOnboardingClient({
    userAgent: nav.userAgent || "",
    userAgentDataMobile: nav.userAgentData?.mobile,
    maxTouchPoints: nav.maxTouchPoints,
    platform: nav.platform,
  });
}

export function buildOnboardingHandoffUrl(
  isMobile: boolean,
  carry: Record<string, string>,
): string {
  const url = new URL(isMobile ? MOBILE_ONBOARDING_URL : DESKTOP_SIGNUP_URL);
  Object.entries(carry).forEach(([key, value]) => {
    // Route count belongs to the mobile activation flow and must never leak
    // into the desktop signup experience.
    if (value && (isMobile || key !== "routes")) url.searchParams.set(key, value);
  });

  if (!isMobile) {
    url.searchParams.set("desktop", "true");
    url.searchParams.set("authfresh", "true");
    if (!url.searchParams.has("source")) {
      url.searchParams.set("source", "landing_onboarding");
    }
  }
  return url.toString();
}

const DESKTOP_SAFE_QUERY_KEYS = new Set([
  "email", "firstName", "lastName", "name", "phone", "source", "meta_event_id",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid",
]);

export function replaceMobileAppUrlForDesktop(url: URL): URL {
  if (!url.pathname.startsWith("/mobile/") && url.pathname !== "/mobile-v2-field.html") {
    return url;
  }

  const desktop = new URL(DESKTOP_SIGNUP_URL);
  url.searchParams.forEach((value, key) => {
    if (DESKTOP_SAFE_QUERY_KEYS.has(key) && value) desktop.searchParams.set(key, value);
  });
  desktop.searchParams.set("desktop", "true");
  desktop.searchParams.set("authfresh", "true");
  if (!desktop.searchParams.has("source")) {
    desktop.searchParams.set("source", "landing_onboarding");
  }
  return desktop;
}
