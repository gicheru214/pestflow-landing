import { useEffect, useState } from "react";
import { CheckCircle2, Wrench, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analytics, EVENTS } from "@/lib/analytics";
import {
  fireMetaLeadOnce,
  getOrCreateMetaLeadEventId,
} from "@/lib/metaLeadEvent";
import { capturedWorkflowLeadEventId } from "@/lib/workflowLeadHandoff";
import {
  captureMarketingAttribution,
  MARKETING_ATTRIBUTION_KEYS,
} from "@/lib/marketingAttribution";
import {
  createAppStoreHandoffEventId,
  fireMetaAppStoreHandoffOnce,
  normalizeAppStoreHandoffEventId,
  resolveAppHandoffDestination,
} from "@/lib/appStoreHandoff";
import {
  DESKTOP_SIGNUP_URL,
  isMobileOnboardingBrowser,
  MOBILE_ONBOARDING_URL,
  replaceMobileAppUrlForDesktop,
} from "@/lib/onboardingHandoff";

const ALLOWED_APP_RETURN_HOSTS = new Set(["app.pestflow.org", "new.pestflow.org"]);
const APP_STORE_OPEN_DELAY_MS = 1400;
const APP_STORE_FALLBACK_DELAY_MS = 5000;

export function resolveAppHandoffUrl(returnTo?: string | null, isMobile = true): URL {
  const fallback = new URL(MOBILE_ONBOARDING_URL);
  if (!returnTo) return isMobile ? fallback : replaceMobileAppUrlForDesktop(fallback);
  try {
    const candidate = new URL(returnTo, "https://app.pestflow.org");
    if (candidate.protocol === "https:" && ALLOWED_APP_RETURN_HOSTS.has(candidate.hostname)) {
      return isMobile ? candidate : replaceMobileAppUrlForDesktop(candidate);
    }
  } catch {
    // Keep the established onboarding destination for malformed return URLs.
  }
  return isMobile ? fallback : replaceMobileAppUrlForDesktop(fallback);
}

function buildAppHandoffUrl(
  extras: Record<string, string>,
  returnTo: string | null | undefined,
  isMobile: boolean,
) {
  const popupData = (() => {
    try { return JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}"); } catch { return {}; }
  })();
  const url = resolveAppHandoffUrl(returnTo, isMobile);
  const params = url.searchParams;
  const routesRaw = parseInt(popupData.routeSize || "1", 10);
  const routes = isNaN(routesRaw) || routesRaw < 1 ? 1 : Math.min(routesRaw, 74);
  if (isMobile && !params.has("routes")) params.set("routes", String(routes));
  if (!isMobile) params.delete("routes");
  ["email", "firstName", "lastName", "phone", ...MARKETING_ATTRIBUTION_KEYS].forEach((k) => {
    const v = popupData[k] || extras[k];
    if (v) params.set(k, v);
  });
  Object.entries(extras).forEach(([k, v]) => { if (v && !params.has(k)) params.set(k, v); });
  return url.toString();
}

export default function SignupSuccess() {
  const [isMobileClient] = useState(() => isMobileOnboardingBrowser());
  const [appHandoffDestination] = useState(() => {
    const nav = navigator as Navigator & {
      userAgentData?: { mobile?: boolean };
      maxTouchPoints?: number;
    };
    return resolveAppHandoffDestination({
      userAgent: nav.userAgent || "",
      userAgentDataMobile: nav.userAgentData?.mobile,
      maxTouchPoints: nav.maxTouchPoints,
      platform: nav.platform,
    });
  });
  const [isAppStoreHandoff] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split("?")[1]);
    return (urlParams.get("handoff") || hashParams.get("handoff")) === "app_store";
  });
  const [isTech, setIsTech] = useState(false);
  const [techEmail, setTechEmail] = useState("");
  const [techName, setTechName] = useState("");
  const [techEmployer, setTechEmployer] = useState("");
  const [showTechCta, setShowTechCta] = useState(false);
  const [showHandoffFallback, setShowHandoffFallback] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const attribution = captureMarketingAttribution(urlParams, hashParams);
    const type = urlParams.get('type') || hashParams.get('type');
    const email = urlParams.get('email') || '';
    const returnTo = urlParams.get('return_to') || hashParams.get('return_to');
    const source = urlParams.get('source') || hashParams.get('source');
    const completedAccountSignup = source === 'app_signup';
    const isInternalPreview = urlParams.get('internal') === '1';

    if (isAppStoreHandoff) {
      const appStoreSource = source || "mobile_banner";
      const appStoreEventId = normalizeAppStoreHandoffEventId(
        urlParams.get("app_store_event_id") || hashParams.get("app_store_event_id"),
      ) ?? createAppStoreHandoffEventId();
      const leadEventId = capturedWorkflowLeadEventId(
        source,
        urlParams.get("meta_event_id") || hashParams.get("meta_event_id"),
      );
      const eventProperties = {
        ...attribution,
        source: appStoreSource,
        surface: "signup_success",
        platform: appHandoffDestination.platform,
        destination: appHandoffDestination.telemetryDestination,
      };
      const isStoreDestination = appHandoffDestination.platform !== "desktop";

      analytics.pageView("Signup Success", eventProperties);
      analytics.track(
        isStoreDestination
          ? EVENTS.LANDING.APP_STORE_HANDOFF
          : EVENTS.LANDING.QUALIFIED_LEAD_HANDOFF,
        eventProperties,
      );

      if (!isInternalPreview && isStoreDestination) {
        void fetch("/api/meta/app-store-handoff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: appStoreEventId,
            source: appStoreSource,
            platform: appHandoffDestination.platform,
            destination: appHandoffDestination.telemetryDestination,
          }),
          keepalive: true,
        }).catch(() => {
          // The browser event still records the handoff when CAPI is unavailable.
        });
      }

      let appStoreRetryTimer: number | undefined;
      let appStoreRetryAttempts = 0;
      if (
        !isInternalPreview
        && isStoreDestination
        && !fireMetaAppStoreHandoffOnce(appStoreEventId, appHandoffDestination)
      ) {
        appStoreRetryTimer = window.setInterval(() => {
          appStoreRetryAttempts += 1;
          if (
            fireMetaAppStoreHandoffOnce(appStoreEventId, appHandoffDestination)
            || appStoreRetryAttempts >= 12
          ) {
            if (appStoreRetryTimer !== undefined) {
              window.clearInterval(appStoreRetryTimer);
            }
            appStoreRetryTimer = undefined;
          }
        }, 100);
      }

      // Only leads that already completed the playbook contact form receive a
      // Lead browser event here. The matching CAPI event uses the same ID, so
      // Meta deduplicates the browser and server copies. Bare App Store clicks
      // from banners remain AppStoreHandoff events, not false Leads.
      let leadRetryTimer: number | undefined;
      let leadRetryAttempts = 0;
      if (
        !isInternalPreview
        && leadEventId
        && !fireMetaLeadOnce(leadEventId)
      ) {
        leadRetryTimer = window.setInterval(() => {
          leadRetryAttempts += 1;
          if (
            fireMetaLeadOnce(leadEventId)
            || leadRetryAttempts >= 12
          ) {
            if (leadRetryTimer !== undefined) {
              window.clearInterval(leadRetryTimer);
            }
            leadRetryTimer = undefined;
          }
        }, 100);
      }

      const openTimer = window.setTimeout(() => {
        const openedWindow = isInternalPreview
          ? null
          : window.open(appHandoffDestination.url, "_blank");
        if (openedWindow) openedWindow.opener = null;
        analytics.track(EVENTS.LANDING.APP_STORE_OPEN_ATTEMPT, {
          ...eventProperties,
          method: "automatic",
          navigation_mode: "new_window",
          automatic_result: isInternalPreview
            ? "internal_preview"
            : openedWindow ? "window_created" : "popup_blocked",
        });
        if (!isInternalPreview && !openedWindow) setShowHandoffFallback(true);
      }, APP_STORE_OPEN_DELAY_MS);
      const fallbackTimer = window.setTimeout(() => {
        // Keep the original page usable when an in-app browser blocks or
        // aborts the external request after creating the destination window.
        setShowHandoffFallback(true);
      }, APP_STORE_FALLBACK_DELAY_MS);

      return () => {
        window.clearTimeout(openTimer);
        window.clearTimeout(fallbackTimer);
        if (appStoreRetryTimer !== undefined) {
          window.clearInterval(appStoreRetryTimer);
        }
        if (leadRetryTimer !== undefined) {
          window.clearInterval(leadRetryTimer);
        }
      };
    }

    if (completedAccountSignup) {
      analytics.track(EVENTS.SIGNUP.COMPLETE, {
        ...attribution,
        role: type === 'tech' ? 'technician' : 'owner',
      });
      analytics.track(EVENTS.ACCOUNT.SIGNUP_COMPLETE, attribution);
    } else {
      analytics.track(EVENTS.LANDING.QUALIFIED_LEAD_HANDOFF, {
        ...attribution,
        destination: 'app_onboarding',
      });
    }

    // The discontinued tech flow is not a qualified Meta conversion.
    if (type === 'tech') {
      setIsTech(true);
      setTechEmail(email);
      setTechName(urlParams.get('name') || '');
      setTechEmployer(urlParams.get('employer') || '');
      const timer = setTimeout(() => setShowTechCta(true), 1500);
      return () => clearTimeout(timer);
    }

    const metaEventId = getOrCreateMetaLeadEventId(
      urlParams.get('meta_event_id') || hashParams.get('meta_event_id'),
    );

    // Lead remains the qualified owner conversion. Retry during the short
    // success flash if the Pixel is still initializing, and use the same ID
    // as CAPI so Meta keeps one conversion when both copies arrive.
    let leadRetryTimer: number | undefined;
    let leadRetryAttempts = 0;
    if (!fireMetaLeadOnce(metaEventId)) {
      leadRetryTimer = window.setInterval(() => {
        leadRetryAttempts += 1;
        if (fireMetaLeadOnce(metaEventId) || leadRetryAttempts >= 10) {
          if (leadRetryTimer !== undefined) window.clearInterval(leadRetryTimer);
          leadRetryTimer = undefined;
        }
      }, 100);
    }
    const stopLeadRetry = () => {
      if (leadRetryTimer !== undefined) window.clearInterval(leadRetryTimer);
    };

    // Owner: brief confirmation flash, then hand off to the app.
    const handoff = buildAppHandoffUrl({
      email,
      ...attribution,
      meta_event_id: metaEventId,
    }, returnTo, isMobileClient);
    const timer = setTimeout(() => { window.location.href = handoff; }, 1200);
    return () => {
      stopLeadRetry();
      clearTimeout(timer);
    };
  }, [appHandoffDestination, isAppStoreHandoff, isMobileClient]);

  const handleTechGoToApp = () => {
    const params = new URLSearchParams();
    if (techEmail) params.set('email', techEmail);
    if (techName) params.set('name', techName);
    if (techEmployer) params.set('employer', techEmployer);
    const destination = isMobileClient
      ? new URL("https://app.pestflow.org/mobile/tech-signup")
      : new URL(DESKTOP_SIGNUP_URL);
    params.forEach((value, key) => destination.searchParams.set(key, value));
    if (!isMobileClient) {
      destination.searchParams.set("desktop", "true");
      destination.searchParams.set("type", "tech");
      destination.searchParams.set("source", "landing_tech_signup");
    }
    window.location.href = destination.toString();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] bg-emerald-400/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {isTech && showTechCta && (
          <motion.div
            key="tech-ready"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(30,207,200,0.12)" }}>
                <Wrench className="w-7 h-7" style={{ color: "#1ECFC8" }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Your free tech account is ready!</h1>
                <p className="text-slate-500 text-sm">
                  {techName ? `Welcome, ${techName.split(' ')[0]}! ` : ''}
                  Set a password and you're in — free, always.
                </p>
              </div>
              {techEmail && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 font-mono break-all">
                  {techEmail}
                </div>
              )}
              <button
                onClick={handleTechGoToApp}
                className="w-full font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg text-white"
                style={{ background: "#1ECFC8", boxShadow: "0 6px 20px rgba(30,207,200,0.3)" }}
              >
                Set Up My Account
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-slate-400">
                100% free for field technicians · No credit card ever
              </p>
            </div>
          </motion.div>
        )}

        {!isTech && !showHandoffFallback && (
          <motion.div
            key="owner-handoff"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center text-center space-y-6"
          >
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">You're In!</h1>
              <p className="text-lg text-slate-500 max-w-sm mx-auto">Taking you into PestFlow…</p>
            </div>
          </motion.div>
        )}

        {!isTech && isAppStoreHandoff && showHandoffFallback && (
          <motion.div
            key="app-store-fallback"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900">PestFlow didn’t open automatically</h1>
                <p className="text-slate-500 text-sm">
                  Select Continue to open {appHandoffDestination.label}.
                </p>
              </div>
              <a
                data-testid="handoff-fallback-link"
                href={appHandoffDestination.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analytics.track(EVENTS.LANDING.APP_STORE_OPEN_ATTEMPT, {
                  method: "manual_fallback",
                  navigation_mode: "new_window",
                  surface: "signup_success",
                  platform: appHandoffDestination.platform,
                  destination: appHandoffDestination.telemetryDestination,
                })}
                className="w-full font-bold py-3.5 px-5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg text-white bg-emerald-600 hover:bg-emerald-700"
              >
                {appHandoffDestination.ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
