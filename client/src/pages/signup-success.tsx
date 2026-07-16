import { useEffect, useState } from "react";
import { CheckCircle2, Wrench, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analytics, EVENTS } from "@/lib/analytics";
import { getOrCreateMetaLeadEventId } from "@/lib/metaLeadEvent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const DEFAULT_APP_HANDOFF_URL = "https://app.pestflow.org/mobile/onboard/feature";
const ALLOWED_APP_RETURN_HOSTS = new Set(["app.pestflow.org", "new.pestflow.org"]);

export function resolveAppHandoffUrl(returnTo?: string | null): URL {
  if (!returnTo) return new URL(DEFAULT_APP_HANDOFF_URL);
  try {
    const candidate = new URL(returnTo, "https://app.pestflow.org");
    if (candidate.protocol === "https:" && ALLOWED_APP_RETURN_HOSTS.has(candidate.hostname)) {
      return candidate;
    }
  } catch {
    // Keep the established onboarding destination for malformed return URLs.
  }
  return new URL(DEFAULT_APP_HANDOFF_URL);
}

function buildAppHandoffUrl(extras: Record<string, string>, returnTo?: string | null) {
  const popupData = (() => {
    try { return JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}"); } catch { return {}; }
  })();
  const url = resolveAppHandoffUrl(returnTo);
  const params = url.searchParams;
  const routesRaw = parseInt(popupData.routeSize || "1", 10);
  const routes = isNaN(routesRaw) || routesRaw < 1 ? 1 : Math.min(routesRaw, 74);
  if (!params.has("routes")) params.set("routes", String(routes));
  ["email", "firstName", "lastName", "phone", "utm_source", "utm_campaign", "utm_content"].forEach((k) => {
    const v = popupData[k] || extras[k];
    if (v) params.set(k, v);
  });
  Object.entries(extras).forEach(([k, v]) => { if (v && !params.has(k)) params.set(k, v); });
  return url.toString();
}

export default function SignupSuccess() {
  const [isTech, setIsTech] = useState(false);
  const [techEmail, setTechEmail] = useState("");
  const [techName, setTechName] = useState("");
  const [techEmployer, setTechEmployer] = useState("");
  const [techMetaEventId, setTechMetaEventId] = useState("");
  const [showTechCta, setShowTechCta] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const sessionId = urlParams.get('session_id') || hashParams.get('session_id') || 'unknown_session';
    const utmSource = urlParams.get('utm_source') || hashParams.get('utm_source') || sessionStorage.getItem('utm_source') || undefined;
    const utmCampaign = urlParams.get('utm_campaign') || hashParams.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || undefined;
    const utmContent = urlParams.get('utm_content') || hashParams.get('utm_content') || sessionStorage.getItem('utm_content') || undefined;
    const type = urlParams.get('type') || hashParams.get('type');
    const email = urlParams.get('email') || '';
    const returnTo = urlParams.get('return_to') || hashParams.get('return_to');
    const metaEventId = getOrCreateMetaLeadEventId(
      urlParams.get('meta_event_id') || hashParams.get('meta_event_id'),
    );

    analytics.track(EVENTS.SIGNUP.COMPLETE, { utm_source: utmSource, utm_campaign: utmCampaign, utm_content: utmContent, role: type === 'tech' ? 'technician' : 'owner' });
    analytics.track(EVENTS.CHECKOUT.SUCCESS, { sessionId, value: type === 'tech' ? 0 : 1.00, currency: 'USD' });
    analytics.track(EVENTS.ACCOUNT.SIGNUP_COMPLETE);

    const anonId = sessionStorage.getItem('pestflow_user_id') || `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('pestflow_user_id', anonId);
    analytics.identify(anonId, { signupDate: new Date().toISOString(), plan: type === 'tech' ? 'tech-free' : 'trial', utm_source: utmSource, utm_campaign: utmCampaign, utm_content: utmContent });

    // Lead remains the qualified Meta conversion. Retry during the short
    // success flash if the Pixel is still initializing, and use the same ID
    // as CAPI so Meta keeps one conversion when both copies arrive.
    const firedKey = `pestflow_meta_lead_fired:${metaEventId}`;
    let leadRetryTimer: number | undefined;
    let leadRetryAttempts = 0;
    const fireMetaLead = () => {
      try {
        if (sessionStorage.getItem(firedKey) === '1') return true;
      } catch {
        // Meta's event ID still deduplicates a repeated browser call.
      }
      if (typeof window.fbq !== 'function') return false;
      window.fbq(
        'track',
        'Lead',
        { value: type === 'tech' ? 0 : 10.00, currency: 'USD' },
        { eventID: metaEventId },
      );
      try { sessionStorage.setItem(firedKey, '1'); } catch { /* ignore */ }
      return true;
    };
    if (!fireMetaLead()) {
      leadRetryTimer = window.setInterval(() => {
        leadRetryAttempts += 1;
        if (fireMetaLead() || leadRetryAttempts >= 10) {
          if (leadRetryTimer !== undefined) window.clearInterval(leadRetryTimer);
          leadRetryTimer = undefined;
        }
      }, 100);
    }
    const stopLeadRetry = () => {
      if (leadRetryTimer !== undefined) window.clearInterval(leadRetryTimer);
    };

    if (type === 'tech') {
      setIsTech(true);
      setTechEmail(email);
      setTechName(urlParams.get('name') || '');
      setTechEmployer(urlParams.get('employer') || '');
      setTechMetaEventId(metaEventId);
      const timer = setTimeout(() => setShowTechCta(true), 1500);
      return () => {
        stopLeadRetry();
        clearTimeout(timer);
      };
    }

    // Owner: brief confirmation flash, then hand off to the app.
    const handoff = buildAppHandoffUrl({
      email,
      utm_source: utmSource || '',
      utm_campaign: utmCampaign || '',
      utm_content: utmContent || '',
      meta_event_id: metaEventId,
    }, returnTo);
    const timer = setTimeout(() => { window.location.href = handoff; }, 1200);
    return () => {
      stopLeadRetry();
      clearTimeout(timer);
    };
  }, []);

  const handleTechGoToApp = () => {
    const params = new URLSearchParams();
    if (techEmail) params.set('email', techEmail);
    if (techName) params.set('name', techName);
    if (techEmployer) params.set('employer', techEmployer);
    if (techMetaEventId) params.set('meta_event_id', techMetaEventId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    window.location.href = `https://app.pestflow.org/mobile/tech-signup${qs}`;
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

        {!isTech && (
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
      </AnimatePresence>
    </div>
  );
}
