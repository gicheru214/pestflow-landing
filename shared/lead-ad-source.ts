export type LeadAdSource = "google_ads" | "google" | "facebook" | "instagram" | "meta";

const GOOGLE_AD_CLICK_KEYS = ["gclid", "gbraid", "wbraid"] as const;
export const LEAD_AD_CLICK_KEYS = [...GOOGLE_AD_CLICK_KEYS, "fbclid"] as const;
export const MARKETING_ATTRIBUTION_COOKIE = "pestflow_marketing_attribution";

type LeadSourceKey = "utm_source" | "utm_medium" | (typeof LEAD_AD_CLICK_KEYS)[number];

function normalized(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/[ -]+/g, "_") : "";
}

export function leadAdSourceFromTracking(tracking: unknown): LeadAdSource | null {
  if (!tracking || typeof tracking !== "object") return null;

  const fields = tracking as Partial<Record<LeadSourceKey, unknown>>;
  const source = normalized(fields.utm_source);
  const medium = normalized(fields.utm_medium);
  const googleClick = GOOGLE_AD_CLICK_KEYS.some((key) => Boolean(normalized(fields[key])));
  const metaClick = Boolean(normalized(fields.fbclid));

  if (["fb", "facebook", "facebook_ads"].includes(source)) return "facebook";
  if (["ig", "instagram", "instagram_ads"].includes(source)) return "instagram";
  if (["meta", "meta_ads", "msg", "an", "messenger", "audience_network"].includes(source)) return "meta";
  if (["google_ads", "googleads", "adwords"].includes(source)) return "google_ads";
  if (source === "google") {
    return googleClick || ["cpc", "ppc", "paid", "paid_search", "paidsearch", "sem"].includes(medium)
      ? "google_ads"
      : "google";
  }

  // A Facebook click ID alone does not distinguish Instagram from Facebook.
  if (googleClick === metaClick) return null;
  return googleClick ? "google_ads" : "meta";
}

export function leadAdSourceFromRequest(referer: string | undefined, savedAttribution: string | undefined) {
  if (referer) {
    try {
      const url = new URL(referer);
      const tracking = Object.fromEntries(url.searchParams);
      const current = leadAdSourceFromTracking(tracking);
      // An explicitly tagged visit takes precedence over saved attribution.
      if (current || tracking.utm_source || LEAD_AD_CLICK_KEYS.some((key) => tracking[key])) return current;
    } catch { /* An invalid referrer can be ignored. */ }
  }

  if (!savedAttribution) return null;
  try {
    return leadAdSourceFromTracking(JSON.parse(savedAttribution));
  } catch {
    return null;
  }
}
