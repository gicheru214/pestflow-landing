import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { analytics, EVENTS } from "@/lib/analytics";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

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

type Step = "guide" | "details" | "offer";

export function AutoPopup() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("guide");
  const [routeCount, setRouteCount] = useState(5);
  const [showClose, setShowClose] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const submitted = localStorage.getItem("pestflow_popup_submitted");
    if (submitted) return;
    const showCount = parseInt(localStorage.getItem("pestflow_popup_show_count") || "0", 10);
    if (showCount >= 2) return;
    const seenBefore = localStorage.getItem("pestflow_popup_seen");
    if (seenBefore) setShowClose(true);
    const timer = setTimeout(() => {
      setOpen(true);
      analytics.track(EVENTS.LANDING.POPUP_SHOWN);
      localStorage.setItem("pestflow_popup_seen", "true");
      localStorage.setItem("pestflow_popup_show_count", String(showCount + 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      const submitted = localStorage.getItem("pestflow_popup_submitted");
      if (submitted || open) return;
      const showCount = parseInt(localStorage.getItem("pestflow_popup_show_count") || "0", 10);
      if (showCount >= 2) return;
      const nearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 300;
      if (nearBottom) {
        if (scrollTimer) return;
        scrollTimer = setTimeout(() => {
          setStep("guide");
          setShowClose(true);
          setOpen(true);
          analytics.track(EVENTS.LANDING.POPUP_SHOWN);
          const count = parseInt(localStorage.getItem("pestflow_popup_show_count") || "0", 10);
          localStorage.setItem("pestflow_popup_show_count", String(count + 1));
          scrollTimer = null;
        }, 1500);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [open]);

  const handleClose = () => {
    analytics.track(EVENTS.LANDING.POPUP_DISMISSED);
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

  const handleQualification = (isOwner: boolean) => {
    const currentData = JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}");
    localStorage.setItem("pestflow_popup_data", JSON.stringify({ ...currentData, isOwner }));
    setStep("offer");
  };

  const handleAcceptOffer = () => {
    analytics.track(EVENTS.LANDING.POPUP_SUBMIT);
    localStorage.setItem("pestflow_popup_submitted", "true");
    setOpen(false);
    window.location.href = "/onboarding";
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

            {/* ── STEP 2: Owner / manager + route size ── */}
            {step === "details" && (
              <motion.div
                key="details"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-6 sm:p-8 flex flex-col items-center"
              >
                <img
                  src={logoImage}
                  alt="PestFlow"
                  className="h-28 w-auto object-contain mb-6"
                />
                <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
                  One Quick Question
                </h2>
                <p className="text-slate-400 text-sm text-center mb-8">
                  Are you a pest control business owner or manager?
                </p>
                <div className="w-full grid grid-cols-2 gap-3 mb-8">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 text-base border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => handleQualification(false)}
                  >
                    No
                  </Button>
                  <Button
                    size="lg"
                    className="h-14 text-base bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => handleQualification(true)}
                  >
                    Yes
                  </Button>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white text-center mb-4">
                  How many routes do you run?
                </h3>
                <p className="text-slate-400 text-sm text-center mb-6">
                  We'll tailor your experience to your team size.
                </p>
                <div className="w-full space-y-6 mb-8">
                  <div className="text-center">
                    <span className="text-5xl font-bold text-emerald-400">{routeCount}</span>
                    <span className="text-xl text-slate-400 ml-2">routes</span>
                  </div>
                  <div className="px-2">
                    <Slider
                      value={[routeCount]}
                      onValueChange={(v) => setRouteCount(v[0])}
                      min={1}
                      max={50}
                      step={1}
                      className="w-full [&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-400"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>1</span>
                      <span>25</span>
                      <span>50+</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    const currentData = JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}");
                    localStorage.setItem(
                      "pestflow_popup_data",
                      JSON.stringify({ ...currentData, routeSize: `${routeCount}` })
                    );
                    setStep("offer");
                  }}
                  className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

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
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
