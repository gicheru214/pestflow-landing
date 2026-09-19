type TikTokPixelInstance = {
  page?: (...args: unknown[]) => void;
  track?: (...args: unknown[]) => void;
};

type TikTokPixelQueue = TikTokPixelInstance & {
  _i?: Record<string, unknown[]>;
  _o?: Record<string, Record<string, unknown>>;
  _t?: Record<string, number>;
  instance?: (pixelId: string) => TikTokPixelInstance;
  load?: (pixelId: string, options?: Record<string, unknown>) => void;
  methods?: string[];
  push: (value: unknown) => number;
  setAndDefer?: (target: TikTokPixelQueue | unknown[], method: string) => void;
};

declare global {
  interface Window {
    TiktokAnalyticsObject?: string;
    ttq?: TikTokPixelQueue;
  }
}

const PIXEL_ID_PATTERN = /^[A-Z0-9]{10,40}$/i;
const EVENT_ID_PATTERN = /^[A-Za-z0-9._:-]{8,100}$/;
const FIRED_KEY_PREFIX = "pestflow_tiktok_registration_fired:";

export function normalizeTikTokPixelId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return PIXEL_ID_PATTERN.test(normalized) ? normalized : null;
}

export function initTikTokPixel(value: unknown): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  const pixelId = normalizeTikTokPixelId(value);
  if (!pixelId) return false;

  window.TiktokAnalyticsObject = "ttq";
  const ttq = window.ttq ?? ([] as unknown as TikTokPixelQueue);
  window.ttq = ttq;

  if (!ttq.methods) {
    ttq.methods = [
      "page", "track", "identify", "instances", "debug", "on", "off",
      "once", "ready", "alias", "group", "enableCookie", "disableCookie",
      "holdConsent", "revokeConsent", "grantConsent",
    ];
    ttq.setAndDefer = (target, method) => {
      (target as Record<string, unknown>)[method] = (...args: unknown[]) => {
        (target as unknown[]).push([method, ...args]);
      };
    };
    for (const method of ttq.methods) ttq.setAndDefer(ttq, method);
    ttq.instance = (id: string) => {
      const instance = ttq._i?.[id] ?? [];
      for (const method of ttq.methods ?? []) ttq.setAndDefer?.(instance, method);
      return instance as TikTokPixelInstance;
    };
    ttq.load = (id: string, options: Record<string, unknown> = {}) => {
      if (ttq._i?.[id]) return;
      const source = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i ||= {};
      ttq._i[id] = [];
      (ttq._i[id] as unknown[] & { _u?: string })._u = source;
      ttq._t ||= {};
      ttq._t[id] = Date.now();
      ttq._o ||= {};
      ttq._o[id] = options;
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = `${source}?sdkid=${encodeURIComponent(id)}&lib=ttq`;
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript?.parentNode?.insertBefore(script, firstScript);
    };
  }

  ttq.load?.(pixelId);
  ttq.instance?.(pixelId).page?.();
  return true;
}

/** Fire the browser copy with the same event ID as the server copy. */
export function fireTikTokCompleteRegistrationOnce(
  value: unknown,
  pixelValue: unknown,
): boolean {
  if (typeof window === "undefined") return false;
  const eventId = typeof value === "string" && EVENT_ID_PATTERN.test(value.trim())
    ? value.trim()
    : null;
  const pixelId = normalizeTikTokPixelId(pixelValue);
  if (!eventId || !pixelId) return false;

  const firedKey = `${FIRED_KEY_PREFIX}${eventId}`;
  try {
    if (sessionStorage.getItem(firedKey) === "1") return true;
  } catch {
    // TikTok also deduplicates repeated copies by event name and event_id.
  }

  const target = window.ttq?.instance?.(pixelId) ?? window.ttq;
  if (typeof target?.track !== "function") return false;
  target.track("CompleteRegistration", {}, { event_id: eventId });
  try {
    sessionStorage.setItem(firedKey, "1");
  } catch {
    // Storage restrictions must not block the conversion event.
  }
  return true;
}
