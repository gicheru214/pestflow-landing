import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
            No credit card required for demo. Start your 14-day free trial today.
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

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const visited = localStorage.getItem("pestflow_popup_visited");
    if (visited) return;
    const timer = setTimeout(() => {
      setOpen(true);
      analytics.track(EVENTS.LANDING.POPUP_SHOWN);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    analytics.track(EVENTS.LANDING.POPUP_DISMISSED);
    setOpen(false);
    localStorage.setItem("pestflow_popup_visited", "true");
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
    localStorage.setItem("pestflow_popup_visited", "true");
    setOpen(false);
    window.location.href = "/onboarding";
  };

  const slideVariants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="w-[calc(100vw-2rem)] sm:max-w-[420px] p-0 overflow-hidden bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl"
        hideCloseButton
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="max-h-[85vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: Guide offer + contact info ── */}
            {step === "guide" && (
              <motion.div
                key="guide"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-5 sm:p-7 flex flex-col items-center"
              >
                <img
                  src={logoImage}
                  alt="PestFlow"
                  className="h-16 w-auto object-contain mb-4"
                />

                <h2 className="text-lg sm:text-xl font-bold text-white text-center mb-1">
                  Get the Free Pest Control Growth Guide
                </h2>
                <p className="text-slate-400 text-xs text-center mb-4">
                  Drop your info and we'll unlock the guide with your free trial.
                </p>

                <ul className="w-full space-y-1.5 mb-5">
                  {[
                    "How to scale routes without hiring more staff",
                    "Rank higher on Google Maps & local search",
                    "Automate invoicing & collect faster",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="w-full space-y-2.5">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => { setName(e.target.value); setNameError(""); }}
                      placeholder="John Smith"
                      className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 h-10 ${nameError ? "border-red-500" : ""}`}
                    />
                    {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
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
                      className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 h-10 ${phoneError ? "border-red-500" : ""}`}
                    />
                    {phoneError && <p className="text-red-400 text-xs mt-1">{phoneError}</p>}
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
                      className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 h-10 ${emailError ? "border-red-500" : ""}`}
                    />
                    {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
                  </div>

                  <Button
                    onClick={handleGuideSubmit}
                    className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg mt-1"
                  >
                    Continue to Step 2 <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-center text-xs text-slate-500 pt-1">
                    Guide unlocks in step 2 when you start your free trial.
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
                    "14-day full access trial",
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
