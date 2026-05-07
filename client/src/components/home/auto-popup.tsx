import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { analytics, EVENTS } from "@/lib/analytics";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

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

type Step = "guide" | "details" | "offer" | "business";

const ROUTE_QUESTIONS = [
  {
    key: "routeCount",
    label: "How many routes do you run each week?",
    options: ["1–2", "3–5", "6–10", "11–20", "20+"],
  },
  {
    key: "routeMix",
    label: "What's the mix of work on those routes?",
    options: ["Mostly residential", "Mostly commercial", "Even split", "One-off / on-demand"],
  },
  {
    key: "routeDensity",
    label: "How tight are your routes today?",
    options: ["Dense — back-to-back stops", "Spread out — lots of windshield time", "All over the map"],
  },
  {
    key: "routeBottleneck",
    label: "What's hurting route revenue the most?",
    options: ["Cancellations & no-shows", "Slow / missed payments", "Not enough new leads", "Techs running behind"],
  },
] as const;

export function AutoPopup() {
  const [open, setOpen] = useState(false);
  const initialStep = (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("popup_step")) as Step | null;
  const validInitial: Step[] = ["details", "offer", "business"];
  const [step, setStep] = useState<Step>(validInitial.includes(initialStep as Step) ? (initialStep as Step) : "guide");
  const [routeAnswers, setRouteAnswers] = useState<Record<string, string>>({});
  const [questionIdx, setQuestionIdx] = useState(0);
  const [showClose, setShowClose] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Business step fields
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [technicians, setTechnicians] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateField, setStateField] = useState("");
  const [zip, setZip] = useState("");
  const [companyError, setCompanyError] = useState("");
  const [techError, setTechError] = useState("");

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
      ...routeAnswers,
      companyName,
      website,
      technicians,
      address,
      city,
      state: stateField,
      zip,
      step,
    };
  }, [name, phone, email, routeAnswers, companyName, website, technicians, address, city, stateField, zip, step]);

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
      analytics.track(EVENTS.LANDING.POPUP_SUBMIT);
      localStorage.setItem("pestflow_popup_submitted", "true");
    } catch (e) {
      console.error("Failed to save guide request", e);
    }

    setStep("details");
  };

  const handleAcceptOffer = () => {
    analytics.track(EVENTS.LANDING.POPUP_SUBMIT);
    pushPartial({ ...snapshotRef.current, reason: "accept_offer" });
    setStep("business");
  };

  const handleBusinessSubmit = async () => {
    let valid = true;
    if (!companyName.trim()) {
      setCompanyError("Please enter your company name");
      valid = false;
    } else {
      setCompanyError("");
    }
    if (!technicians.trim() || isNaN(Number(technicians))) {
      setTechError("Enter a number");
      valid = false;
    } else {
      setTechError("");
    }
    if (!valid) return;

    const parts = name.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    const fullPayload = {
      type: "newsletter",
      firstName,
      lastName,
      email,
      phone,
      companyName,
      website,
      technicians,
      address,
      city,
      state: stateField,
      zip,
      ...routeAnswers,
    };

    try {
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullPayload),
      });
    } catch (e) {
      console.error("Failed to save business details", e);
    }
    localStorage.setItem("pestflow_popup_submitted", "true");
    analytics.track(EVENTS.LANDING.POPUP_SUBMIT);
    setOpen(false);
    window.location.href = "/signup-success";
  };

  const slideVariants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <Dialog open={open} onOpenChange={showClose ? handleClose : () => {}}>
      <DialogContent
        className="w-[calc(100vw-1.5rem)] sm:max-w-[400px] p-0 overflow-hidden bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl"
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
        <div className="max-h-[88vh] overflow-y-auto">
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
                    500+ owners already scaling with this. No spam — we don't do that.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Route quiz to customize Growth Guide ── */}
            {step === "details" && (() => {
              const q = ROUTE_QUESTIONS[questionIdx];
              const total = ROUTE_QUESTIONS.length;
              const progressPct = ((questionIdx + (routeAnswers[q.key] ? 1 : 0)) / total) * 100;
              const handleAnswer = (answer: string) => {
                const next = { ...routeAnswers, [q.key]: answer };
                setRouteAnswers(next);
                const currentData = JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}");
                localStorage.setItem(
                  "pestflow_popup_data",
                  JSON.stringify({ ...currentData, ...next })
                );
                pushPartial({ ...snapshotRef.current, ...next, reason: `q_${q.key}` });
                if (questionIdx < total - 1) {
                  setTimeout(() => setQuestionIdx(questionIdx + 1), 180);
                } else {
                  setTimeout(() => setStep("offer"), 220);
                }
              };
              return (
                <motion.div
                  key="details"
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex flex-col"
                >
                  {/* Sticky funnel header */}
                  <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 border-b border-emerald-400/40">
                    <p className="text-[11px] font-semibold tracking-wider uppercase text-emerald-100/90">
                      Customize your Growth Guide
                    </p>
                    <p className="text-sm font-bold text-white leading-tight mt-0.5">
                      Answer 4 quick questions for max-impact results
                    </p>
                    <div className="mt-2 h-1.5 w-full bg-emerald-900/40 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-white rounded-full"
                        initial={false}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.35 }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-emerald-100/80 mt-1 font-medium">
                      <span>Step {questionIdx + 1} of {total}</span>
                      <span>Next: your free trial</span>
                    </div>
                  </div>

                  {/* Question body */}
                  <div className="p-5 sm:p-6 flex flex-col">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={q.key}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-base sm:text-lg font-bold text-white mb-1 leading-snug">
                          {q.label}
                        </h3>
                        <p className="text-slate-400 text-xs mb-4">
                          We use this to tune the Growth Guide to your routes.
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt) => {
                            const selected = routeAnswers[q.key] === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => handleAnswer(opt)}
                                className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm font-medium ${
                                  selected
                                    ? "bg-emerald-600 border-emerald-400 text-white"
                                    : "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-emerald-500/50"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {questionIdx > 0 && (
                      <button
                        onClick={() => setQuestionIdx(questionIdx - 1)}
                        className="mt-4 text-xs text-slate-500 hover:text-slate-300 self-start"
                      >
                        ← Back
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })()}

            {/* ── STEP 4: Offer / CTA ── */}
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

            {/* ── STEP 5: Business details (formerly /onboarding) ── */}
            {step === "business" && (
              <motion.div
                key="business"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col"
              >
                {/* Sticky funnel header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 border-b border-emerald-400/40">
                  <p className="text-[11px] font-semibold tracking-wider uppercase text-emerald-100/90">
                    Last step — set up your account
                  </p>
                  <p className="text-sm font-bold text-white leading-tight mt-0.5">
                    Tell us about your business so we can personalize PestFlow
                  </p>
                  <div className="mt-2 h-1.5 w-full bg-emerald-900/40 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: "90%" }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-emerald-100/80 mt-1 font-medium">
                    <span>Final step</span>
                    <span>Next: your dashboard</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">
                      Company name <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={companyName}
                      onChange={(e) => { setCompanyName(e.target.value); setCompanyError(""); }}
                      onBlur={() => pushPartial({ ...snapshotRef.current, reason: "blur_company" })}
                      placeholder="Acme Pest Control"
                      className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 h-9 text-sm ${companyError ? "border-red-500" : ""}`}
                    />
                    {companyError && <p className="text-red-400 text-xs mt-0.5">{companyError}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-slate-400 mb-1 block">
                        Technicians <span className="text-red-400">*</span>
                      </label>
                      <Input
                        value={technicians}
                        onChange={(e) => { setTechnicians(e.target.value); setTechError(""); }}
                        onBlur={() => pushPartial({ ...snapshotRef.current, reason: "blur_techs" })}
                        type="number"
                        placeholder="e.g. 3"
                        className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 h-9 text-sm ${techError ? "border-red-500" : ""}`}
                      />
                      {techError && <p className="text-red-400 text-xs mt-0.5">{techError}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-400 mb-1 block">
                        Website <span className="text-slate-600">(optional)</span>
                      </label>
                      <Input
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        onBlur={() => pushPartial({ ...snapshotRef.current, reason: "blur_website" })}
                        placeholder="acmepest.com"
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">
                      Business address <span className="text-slate-600">(optional)</span>
                    </label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onBlur={() => pushPartial({ ...snapshotRef.current, reason: "blur_addr" })}
                      placeholder="123 Main St"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 h-9 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      onBlur={() => pushPartial({ ...snapshotRef.current, reason: "blur_city" })}
                      placeholder="City"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 h-9 text-sm"
                    />
                    <Input
                      value={stateField}
                      onChange={(e) => setStateField(e.target.value)}
                      onBlur={() => pushPartial({ ...snapshotRef.current, reason: "blur_state" })}
                      placeholder="State"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 h-9 text-sm"
                    />
                    <Input
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      onBlur={() => pushPartial({ ...snapshotRef.current, reason: "blur_zip" })}
                      placeholder="ZIP"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 h-9 text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleBusinessSubmit}
                    className="w-full h-11 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg mt-2"
                  >
                    Finish & Open My Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-center text-[11px] text-slate-500">
                    Your free trial unlocks the moment you finish.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
