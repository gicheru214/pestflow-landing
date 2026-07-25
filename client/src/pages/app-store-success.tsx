import { useEffect } from "react";
import { ArrowRight, CheckCircle2, Smartphone } from "lucide-react";
import { analytics, EVENTS } from "@/lib/analytics";
import {
  APP_STORE_URL,
  createAppStoreHandoffEventId,
  fireMetaAppStoreHandoffOnce,
  normalizeAppStoreHandoffEventId,
} from "@/lib/appStoreHandoff";
import { captureMarketingAttribution } from "@/lib/marketingAttribution";

const AUTO_OPEN_DELAY_MS = 1100;

export default function AppStoreSuccess() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split("?")[1]);
    const attribution = captureMarketingAttribution(urlParams, hashParams);
    const source = urlParams.get("source") || hashParams.get("source") || "mobile_banner";
    const eventId = normalizeAppStoreHandoffEventId(
      urlParams.get("app_store_event_id") || hashParams.get("app_store_event_id"),
    ) ?? createAppStoreHandoffEventId();

    const eventProperties = {
      ...attribution,
      source,
      surface: "app_store_success",
      destination: "apple_app_store",
    };

    analytics.pageView("App Store Success", eventProperties);
    analytics.track(EVENTS.LANDING.APP_STORE_HANDOFF, eventProperties);
    void fetch("/api/meta/app-store-handoff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        source: "home_mobile_top",
      }),
      keepalive: true,
    }).catch(() => {
      // The browser Pixel still records the handoff when CAPI is unavailable.
    });

    let metaRetryTimer: number | undefined;
    let metaRetryAttempts = 0;
    if (!fireMetaAppStoreHandoffOnce(eventId)) {
      metaRetryTimer = window.setInterval(() => {
        metaRetryAttempts += 1;
        if (
          fireMetaAppStoreHandoffOnce(eventId)
          || metaRetryAttempts >= 8
        ) {
          if (metaRetryTimer !== undefined) window.clearInterval(metaRetryTimer);
          metaRetryTimer = undefined;
        }
      }, 100);
    }

    const openTimer = window.setTimeout(() => {
      analytics.track(EVENTS.LANDING.APP_STORE_OPEN_ATTEMPT, {
        ...eventProperties,
        method: "automatic",
      });
      window.location.replace(APP_STORE_URL);
    }, AUTO_OPEN_DELAY_MS);

    return () => {
      window.clearTimeout(openTimer);
      if (metaRetryTimer !== undefined) window.clearInterval(metaRetryTimer);
    };
  }, []);

  const handleManualOpen = () => {
    analytics.track(EVENTS.LANDING.APP_STORE_OPEN_ATTEMPT, {
      source: new URLSearchParams(window.location.search).get("source") || "mobile_banner",
      surface: "app_store_success",
      destination: "apple_app_store",
      method: "manual",
    });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7f6] px-5 py-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />

      <section className="relative w-full max-w-md rounded-[28px] border border-emerald-950/10 bg-white px-7 py-9 text-center shadow-[0_24px_70px_rgba(15,61,39,0.14)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#123b24] text-white shadow-lg shadow-emerald-950/20">
          <Smartphone className="h-9 w-9" aria-hidden="true" />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          App Store handoff confirmed
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Opening PestFlow
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-slate-600">
          We’re taking you to the PestFlow iPhone app. If the App Store does not open automatically, use the button below.
        </p>

        <a
          href={APP_STORE_URL}
          onClick={handleManualOpen}
          className="mt-7 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#0a84ff] px-5 text-base font-extrabold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#0878e5] focus:outline-none focus:ring-4 focus:ring-blue-200"
          aria-label="Open PestFlow in the App Store"
        >
          Open the App Store
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </a>
        <p className="mt-4 text-xs font-medium text-slate-400">
          Free to download · Built for pest control teams
        </p>
      </section>
    </main>
  );
}
