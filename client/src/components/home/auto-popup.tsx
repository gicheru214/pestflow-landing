import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { analytics, EVENTS } from "@/lib/analytics";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

const GOOGLE_CLIENT_ID = "65383864801-kd754q4cjeep88638fus0e48kib9s4ts.apps.googleusercontent.com";

function initGoogle(callback: (r: { credential: string }) => void) {
  const w = window as any;
  if (w.google?.accounts?.id) {
    w.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback, context: "signin" });
    return;
  }
  if (!document.getElementById("pf-gsi2")) {
    const s = document.createElement("script");
    s.id = "pf-gsi2";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => {
      (window as any).google?.accounts?.id?.initialize({ client_id: GOOGLE_CLIENT_ID, callback, context: "signin" });
    };
    document.head.appendChild(s);
  }
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// Push whatever we've collected so far to the server, no-blocking.
// Uses sendBeacon when available so it survives page unload.
function pushPartial(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify({ type: "popup_partial", ...payload });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/submissions", blob);
      return;
    }
    fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

export function DemoVideoModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black border-slate-800">
        <div className="relative aspect-video w-full bg-black">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/TB4__rmaNpE?autoplay=1&mute=1"
            title="PestFlow Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          ></iframe>
        </div>
        <div className="p-6 bg-slate-900 text-center">
          <Button
            size="lg"
            className="w-full md:w-auto px-8 py-6 text-xl font-bold bg-[#635BFF] hover:bg-[#5851E1] text-white shadow-lg shadow-indigo-500/20"
            onClick={() => (window.location.href = "/onboarding")}
          >
            Start Trial <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-4 text-sm text-slate-400">
            No credit card required for demo. Start your 7-day free trial today.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type Step = "guide" | "offer";

const popupScrollStyle = {
  maxHeight: "min(88vh, calc(100dvh - 5.5rem))",
} satisfies React.CSSProperties;

export function AutoPopup() {
  const [open, setOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleErr, setGoogleErr] = useState("");
  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const initialStep = urlParams.get("popup_step") as Step | null;
  const validInitial: Step[] = ["offer"];
  const [step, setStep] = useState<Step>(validInitial.includes(initialStep as Step) ? (initialStep as Step) : "guide");

  // Hydrate fields from URL params and the localStorage snapshot saved on guide submit.
  const cachedPopup = (() => {
    if (typeof window === "undefined") return {} as any;
    try { return JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}"); }
    catch { return {} as any; }
  })();
  const [showClose, setShowClose] = useState(false);

  const seedName = (() => {
    const f = urlParams.get("firstName");
    const l = urlParams.get("lastName");
    if (f || l) return `${f || ""} ${l || ""}`.trim();
    return cachedPopup.name || "";
  })();
  const [name, setName] = useState(seedName);
  const [phone, setPhone] = useState(urlParams.get("phone") || cachedPopup.phone || "");
  const [email, setEmail] = useState(urlParams.get("email") || cachedPopup.email || "");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Snapshot every collected field so beforeunload / step transitions can ship it
  const snapshotRef = useRef<Record<string, unknown>>({});
  useEffect(() => {
    const parts = name.trim().split(" ");
    snapshotRef.current = {
      name,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      phone,
      email,
      step,
    };
  }, [name, phone, email, step]);

  // Fire-and-forget partial send if user closes/refreshes mid-funnel
  useEffect(() => {
    const onLeave = () => {
      const data = snapshotRef.current;
      const hasAny = data && (data.email || data.phone || data.name || data.companyName);
      if (hasAny) pushPartial({ ...data, reason: "unload" });
    };
    window.addEventListener("beforeunload", onLeave);
    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener("beforeunload", onLeave);
      window.removeEventListener("pagehide", onLeave);
    };
  }, []);

  useEffect(() => {
    if (urlParams.has("popup-check")) {
      setStep("guide");
      setShowClose(true);
      setOpen(true);
      analytics.track(EVENTS.LANDING.POPUP_SHOWN);
      return;
    }
    // Old quiz links may still return with ?popup_step=offer. Show the offer
    // immediately so those links keep working without reviving the long quiz.
    const forcedStep = new URLSearchParams(window.location.search).get("popup_step");
    if (forcedStep === "offer") {
      setShowClose(true);
      setOpen(true);
      analytics.track(EVENTS.LANDING.POPUP_SHOWN);
      return;
    }
    const submitted = localStorage.getItem("pestflow_popup_submitted");
    if (submitted) return;
    const seenBefore = localStorage.getItem("pestflow_popup_seen");
    if (seenBefore) setShowClose(true);
    const timer = setTimeout(() => {
      setOpen(true);
      analytics.track(EVENTS.LANDING.POPUP_SHOWN);
      localStorage.setItem("pestflow_popup_seen", "true");
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const submitted = localStorage.getItem("pestflow_popup_submitted");
      if (submitted || open) return;
      const nearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 300;
      if (nearBottom) {
        setStep("guide");
        setShowClose(true);
        setOpen(true);
        analytics.track(EVENTS.LANDING.POPUP_SHOWN);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [open]);

  const handleClose = () => {
    analytics.track(EVENTS.LANDING.POPUP_DISMISSED);
    const data = snapshotRef.current;
    if (data && (data.email || data.phone || data.companyName)) {
      pushPartial({ ...data, reason: "dismissed" });
    }
    setOpen(false);
  };

  const handleGuideSubmit = async () => {
    let valid = true;
    if (!name.trim() || name.trim().length < 2) {
      setNameError("Please enter your full name");
      valid = false;
    } else {
      setNameError("");
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setPhoneError("Please enter a valid phone number");
      valid = false;
    } else {
      setPhoneError("");
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }
    if (!valid) return;

    const parts = name.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

    localStorage.setItem(
      "pestflow_popup_data",
      JSON.stringify({ name, firstName, lastName, phone, email })
    );

    try {
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          firstName,
          lastName,
          email,
          phone,
          companyName: "Guide Request",
          technicians: "N/A",
        }),
      });
      analytics.identify(email.trim(), {
        $email: email.trim(),
        $name: name.trim(),
        $phone: phone.trim(),
      });
      analytics.track(EVENTS.LANDING.POPUP_SUBMIT);
      localStorage.setItem("pestflow_popup_submitted", "true");
    } catch (e) {
      console.error("Failed to save guide request", e);
    }

    pushPartial({ ...snapshotRef.current, reason: "guide_submit_signup_success" });
    localStorage.setItem("pestflow_popup_submitted", "true");
    setOpen(false);
    window.location.href = `/playbook?download=1&${buildForwardParams().toString()}`;
  };

  // Build the params bundle (name/email/phone) we forward into the success
  // page and then into the app onboarding handoff.
  const buildForwardParams = () => {
    const parts = name.trim().split(" ");
    const params = new URLSearchParams();
    params.set("source", "popup_playbook");
    if (parts[0]) params.set("firstName", parts[0]);
    const lastName = parts.slice(1).join(" ");
    if (lastName) params.set("lastName", lastName);
    if (email) params.set("email", email);
    if (phone) params.set("phone", phone);
    return params;
  };

  const handleAcceptOffer = () => {
    analytics.track(EVENTS.LANDING.POPUP_SUBMIT);
    pushPartial({ ...snapshotRef.current, reason: "accept_offer_signup_success" });
    localStorage.setItem("pestflow_popup_submitted", "true");
    setOpen(false);
    // Route through signup-success so the handoff screen appears before the
    // visitor lands in PestFlow onboarding. Lead tracking happens at account creation.
    window.location.href = `/signup-success?${buildForwardParams().toString()}`;
  };

  const slideVariants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <Dialog open={open} onOpenChange={showClose ? handleClose : () => {}}>
      <DialogContent
        className="w-[calc(100vw-1.5rem)] sm:max-w-[400px] p-0 overflow-hidden bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl top-[calc(50%+2.25rem)] xl:top-[50%]"
        hideCloseButton
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={showClose ? handleClose : (e) => e.preventDefault()}
      >
        {showClose && (
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="overflow-y-auto" style={popupScrollStyle}>
          <AnimatePresence mode="wait">
            {/* ── STEP 1: Guide offer + contact info ── */}
            {step === "guide" && (
              <motion.div
                key="guide"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-4 sm:p-6 flex flex-col items-center"
              >
                <img
                  src={logoImage}
                  alt="PestFlow"
                  className="h-12 sm:h-14 w-auto object-contain mb-2"
                />

                <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-full px-3 py-0.5 mb-3">
                  <span className="text-emerald-400 text-xs font-semibold tracking-wide uppercase">Free Download — $97 Value</span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-white text-center mb-1 leading-tight">
                  The $1M Pest Control Playbook
                </h2>
                <p className="text-slate-400 text-xs text-center mb-3">
                  The exact blueprint top operators use to scale past 7 figures — and finally get off the truck for good.
                </p>

                <ul className="w-full space-y-1 mb-4">
                  {[
                    "The route-stacking system that 3x revenue without adding a single truck",
                    "The Google formula that puts you #1 in your city and keeps you there",
                    "How to collect faster, follow up automatically & stop chasing deadbeats",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="w-full space-y-2">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => { setName(e.target.value); setNameError(""); }}
                      placeholder="John Smith"
                      className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 h-9 text-sm ${nameError ? "border-red-500" : ""}`}
                    />
                    {nameError && <p className="text-red-400 text-xs mt-0.5">{nameError}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">
                      Phone <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
                      placeholder="(555) 123-4567"
                      type="tel"
                      className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 h-9 text-sm ${phoneError ? "border-red-500" : ""}`}
                    />
                    {phoneError && <p className="text-red-400 text-xs mt-0.5">{phoneError}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                      placeholder="john@example.com"
                      type="email"
                      className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 h-9 text-sm ${emailError ? "border-red-500" : ""}`}
                    />
                    {emailError && <p className="text-red-400 text-xs mt-0.5">{emailError}</p>}
                  </div>

                  <Button
                    onClick={handleGuideSubmit}
                    className="w-full h-11 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg mt-1"
                  >
                    Send Me the Free Playbook <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-center text-xs text-slate-500 pt-0.5">
                    No spam — we don't do that.
                  </p>
                </div>

                {/* ── Returning user sign-in ── */}
                <div className="w-full mt-4 pt-4 border-t border-white/8">
                  <p className="text-center text-[11px] text-slate-500 mb-2 font-medium uppercase tracking-wide">Returning user?</p>
                  <button
                    disabled={googleLoading}
                    onClick={() => {
                      const w = window as any;
                      if (!w.google?.accounts?.oauth2) {
                        window.location.href = "https://app.pestflow.org/login";
                        return;
                      }
                      setGoogleLoading(true);
                      setGoogleErr("");
                      const tokenClient = w.google.accounts.oauth2.initTokenClient({
                        client_id: GOOGLE_CLIENT_ID,
                        scope: "openid email profile",
                        callback: async (tokenResponse: any) => {
                          if (tokenResponse.error) {
                            setGoogleLoading(false);
                            setGoogleErr("Sign-in cancelled.");
                            return;
                          }
                          try {
                            const res = await fetch("/api/auth/google-token", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ access_token: tokenResponse.access_token }),
                            });
                            if (res.ok) {
                              window.location.href = "/onboarding";
                            } else {
                              const d = await res.json().catch(() => ({}));
                              setGoogleErr(d.message ?? "Sign-in failed. Please try again.");
                              setGoogleLoading(false);
                            }
                          } catch {
                            setGoogleErr("Network error. Please try again.");
                            setGoogleLoading(false);
                          }
                        },
                      });
                      tokenClient.requestAccessToken({ prompt: "select_account" });
                    }}
                    className="w-full flex items-center justify-center gap-2.5 h-9 rounded-lg bg-white hover:bg-gray-100 transition-colors text-[13px] font-medium text-gray-800 mb-2 disabled:opacity-60"
                  >
                    {googleLoading ? <span className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <GoogleIcon />}
                    Sign in with Google
                  </button>
                  {googleErr && <p className="text-[11px] text-red-400 text-center mb-1">{googleErr}</p>}
                  <a
                    href="https://app.pestflow.org/login"
                    className="block text-center text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Or sign in with email →
                  </a>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Offer / CTA ── */}
            {step === "offer" && (
              <motion.div
                key="offer"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-6 sm:p-8 flex flex-col items-center"
              >
                <img
                  src={logoImage}
                  alt="PestFlow"
                  className="h-24 w-auto object-contain mb-5"
                />
                <div className="text-3xl mb-3 animate-bounce">🎁</div>
                <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
                  Your Free Trial Is Ready
                </h2>
                <p className="text-slate-400 text-sm text-center mb-6">
                  Plus 98% off your first month — you save $48.
                </p>

                <div className="w-full bg-emerald-900/40 border border-emerald-700/50 rounded-xl p-5 mb-6 space-y-2">
                  {[
                    "Free Growth Guide (unlocks now)",
                    "7-day full access trial",
                    "98% off first month — only $1",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleAcceptOffer}
                  className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                >
                  Claim My Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-xs text-slate-500 text-center mt-3">
                  No credit card required to start.
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
