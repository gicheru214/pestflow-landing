import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, Route, Calendar, Receipt, ArrowRight, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analytics, EVENTS } from "@/lib/analytics";

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 767;
}

declare global {
  interface Window {
    fbq: any;
  }
}

const FEATURES = [
  {
    id: "routes",
    icon: Route,
    label: "Route Optimization",
    desc: "Cut driving time, hit more jobs per day",
    color: "emerald",
  },
  {
    id: "scheduling",
    icon: Calendar,
    label: "Scheduling",
    desc: "Book jobs and manage technicians easily",
    color: "blue",
  },
  {
    id: "invoicing",
    icon: Receipt,
    label: "Invoicing & Billing",
    desc: "Get paid faster with automated invoices",
    color: "purple",
  },
];

function goToPricing(featureId?: string) {
  const popupData = (() => {
    try { return JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}"); } catch { return {}; }
  })();
  const routes = parseInt(popupData.routeSize || "1", 10);
  const validRoutes = isNaN(routes) || routes < 1 ? 1 : Math.min(routes, 74);
  const featureParam = featureId ? `&feature=${featureId}` : "";
  window.location.href = `https://testflow.org?routes=${validRoutes}${featureParam}`;
}

export default function SignupSuccess() {
  const [, setLocation] = useLocation();
  const [uiStep, setUiStep] = useState<"confirmed" | "feature-pick" | "loss-aversion" | "tech-ready">("confirmed");
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isTech, setIsTech] = useState(false);
  const [techEmail, setTechEmail] = useState("");
  const [techName, setTechName] = useState("");
  const [techEmployer, setTechEmployer] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const sessionId = urlParams.get('session_id') || hashParams.get('session_id') || 'unknown_session';
    const utmSource = urlParams.get('utm_source') || hashParams.get('utm_source') || sessionStorage.getItem('utm_source') || undefined;
    const utmCampaign = urlParams.get('utm_campaign') || hashParams.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || undefined;
    const utmContent = urlParams.get('utm_content') || hashParams.get('utm_content') || sessionStorage.getItem('utm_content') || undefined;
    const type = urlParams.get('type') || hashParams.get('type');

    analytics.track(EVENTS.SIGNUP.COMPLETE, { utm_source: utmSource, utm_campaign: utmCampaign, utm_content: utmContent, role: type === 'tech' ? 'technician' : 'owner' });
    analytics.track(EVENTS.CHECKOUT.SUCCESS, { sessionId, value: type === 'tech' ? 0 : 1.00, currency: 'USD' });
    analytics.track(EVENTS.ACCOUNT.SIGNUP_COMPLETE);

    const anonId = sessionStorage.getItem('pestflow_user_id') || `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('pestflow_user_id', anonId);
    analytics.identify(anonId, { signupDate: new Date().toISOString(), plan: type === 'tech' ? 'tech-free' : 'trial', utm_source: utmSource, utm_campaign: utmCampaign, utm_content: utmContent });

    if (window.fbq) {
      window.fbq('track', 'Lead', { value: type === 'tech' ? 0 : 10.00, currency: 'USD' });
    }

    if (type === 'tech') {
      setIsTech(true);
      setTechEmail(urlParams.get('email') || '');
      setTechName(urlParams.get('name') || '');
      setTechEmployer(urlParams.get('employer') || '');
      const timer = setTimeout(() => setUiStep("tech-ready"), 1500);
      return () => clearTimeout(timer);
    }

    // Auto-advance to feature picker after 1.5s
    const timer = setTimeout(() => setUiStep("feature-pick"), 1500);
    return () => clearTimeout(timer);
  }, [setLocation]);

  const handleTechGoToApp = () => {
    const params = new URLSearchParams();
    if (techEmail) params.set('email', techEmail);
    if (techName) params.set('name', techName);
    if (techEmployer) params.set('employer', techEmployer);
    const qs = params.toString() ? `?${params.toString()}` : '';
    if (isMobileDevice()) {
      window.location.href = `https://app.pestflow.org/mobile/tech-signup${qs}`;
    } else {
      window.location.href = `https://app.pestflow.org/mobile/tech-signup${qs}`;
    }
  };

  const handleFeatureSelect = (featureId: string) => {
    setSelectedFeature(featureId);
    localStorage.setItem("pestflow_feature_choice", featureId);
    analytics.track("feature_intent_selected", { feature: featureId });
    setUiStep("loss-aversion");
  };

  const selectedFeatureLabel = FEATURES.find(f => f.id === selectedFeature)?.label;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] bg-emerald-400/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">

        {/* Tech: Account ready */}
        {uiStep === "tech-ready" && (
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

        {/* Step 1: Confirmation flash */}
        {!isTech && uiStep === "confirmed" && (
          <motion.div
            key="confirmed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center text-center space-y-6"
          >
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">You're In!</h1>
              <p className="text-lg text-slate-500 max-w-sm mx-auto">Setting up your personalized experience…</p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Feature picker — "what do you want to try first?" */}
        {!isTech && uiStep === "feature-pick" && (
          <motion.div
            key="feature-pick"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 w-full max-w-lg"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">What do you want to try first?</h1>
              <p className="text-slate-500 text-sm mb-6">We'll set up your plan around your top priority.</p>

              <div className="space-y-3">
                {FEATURES.map((f) => {
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.id}
                      onClick={() => handleFeatureSelect(f.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                        <Icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 text-sm">{f.label}</div>
                        <div className="text-xs text-slate-500">{f.desc}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Loss aversion + CTA to pricing */}
        {!isTech && uiStep === "loss-aversion" && (
          <motion.div
            key="loss-aversion"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-5">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  Your {selectedFeatureLabel} setup is ready
                </h1>
                <p className="text-slate-500 text-sm">
                  We've personalized your PestFlow account around {selectedFeatureLabel?.toLowerCase()}.
                </p>
              </div>

              {/* Loss aversion */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                <p className="text-sm font-semibold text-amber-800">⚠️ Your account data expires in 48 hours</p>
                <p className="text-xs text-amber-700 mt-1">
                  Your profile, routes, and {selectedFeatureLabel?.toLowerCase()} settings will be permanently deleted unless you confirm a plan.
                </p>
              </div>

              <button
                onClick={() => goToPricing(selectedFeature ?? undefined)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/25"
              >
                Lock in my {selectedFeatureLabel} plan
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-slate-400">
                Free 7-day trial · No credit card required to start
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
