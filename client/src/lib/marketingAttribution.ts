export const MARKETING_ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
] as const;

export type MarketingAttribution = Partial<
  Record<(typeof MARKETING_ATTRIBUTION_KEYS)[number], string>
>;

export function captureMarketingAttribution(
  urlParams: URLSearchParams,
  hashParams: URLSearchParams = new URLSearchParams(),
): MarketingAttribution {
  return Object.fromEntries(MARKETING_ATTRIBUTION_KEYS.flatMap((key) => {
    const value = urlParams.get(key) || hashParams.get(key) || sessionStorage.getItem(key);
    if (!value) return [];
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Storage restrictions should never block the lead funnel.
    }
    return [[key, value]];
  }));
}
