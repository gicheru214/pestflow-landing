export const MARKETING_ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "ttclid",
] as const;

const MARKETING_ATTRIBUTION_COOKIE = "pestflow_marketing_attribution";
const ATTRIBUTION_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

export type MarketingAttribution = Partial<
  Record<(typeof MARKETING_ATTRIBUTION_KEYS)[number], string>
> & {
  ttp?: string;
  landing_path?: string;
  captured_at?: string;
};

type StorageLike = Pick<Storage, "getItem" | "setItem">;
type CaptureOptions = {
  cookie?: string;
  storage?: StorageLike;
  hostname?: string;
  pathname?: string;
  now?: Date;
  setCookie?: (cookie: string) => void;
};

function clean(value: unknown, max = 500): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().replace(/[\u0000-\u001f\u007f]/g, "");
  return normalized ? normalized.slice(0, max) : undefined;
}

function readCookie(cookieHeader: string, name: string, max = 4_096): string | undefined {
  const prefix = `${name}=`;
  const raw = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
  if (!raw) return undefined;
  try {
    return clean(decodeURIComponent(raw), max);
  } catch {
    return clean(raw, max);
  }
}

function parseSharedCookie(cookieHeader: string): MarketingAttribution {
  const value = readCookie(cookieHeader, MARKETING_ATTRIBUTION_COOKIE);
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return {
      ...Object.fromEntries(MARKETING_ATTRIBUTION_KEYS.flatMap((key) => {
        const normalized = clean(parsed[key]);
        return normalized ? [[key, normalized]] : [];
      })),
      ...(clean(parsed.ttp) ? { ttp: clean(parsed.ttp) } : {}),
      ...(clean(parsed.landing_path) ? { landing_path: clean(parsed.landing_path) } : {}),
      ...(clean(parsed.captured_at) ? { captured_at: clean(parsed.captured_at) } : {}),
    };
  } catch {
    return {};
  }
}

export function captureMarketingAttribution(
  urlParams: URLSearchParams,
  hashParams: URLSearchParams = new URLSearchParams(),
  options: CaptureOptions = {},
): MarketingAttribution {
  const storage = options.storage ?? sessionStorage;
  const cookie = options.cookie ?? document.cookie;
  const now = options.now ?? new Date();
  const shared = parseSharedCookie(cookie);
  const attribution: MarketingAttribution = { ...shared };

  for (const key of MARKETING_ATTRIBUTION_KEYS) {
    const value = clean(urlParams.get(key) || hashParams.get(key) || storage.getItem(key));
    if (!value) continue;
    attribution[key] ||= value;
    try {
      storage.setItem(key, attribution[key] as string);
    } catch {
      // Storage restrictions should never block the lead funnel.
    }
  }

  attribution.ttp ||= readCookie(cookie, "_ttp", 500);
  attribution.landing_path ||= clean(options.pathname ?? window.location.pathname);
  attribution.captured_at ||= now.toISOString();

  const hostname = options.hostname ?? window.location.hostname;
  const sharedDomain = hostname === "pestflow.org" || hostname.endsWith(".pestflow.org")
    ? "; Domain=.pestflow.org; Secure"
    : "";
  const serialized = `${MARKETING_ATTRIBUTION_COOKIE}=${encodeURIComponent(JSON.stringify(attribution))}; Path=/; Max-Age=${ATTRIBUTION_MAX_AGE_SECONDS}; SameSite=Lax${sharedDomain}`;
  if (options.setCookie) options.setCookie(serialized);
  else document.cookie = serialized;

  return attribution;
}
