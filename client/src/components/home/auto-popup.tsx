import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  X,
} from "lucide-react";
import { analytics, EVENTS } from "@/lib/analytics";
import {
  getLeadMagnet,
  LEAD_MAGNETS,
  type LeadMagnetConfig,
  type LeadMagnetId,
} from "@/lead-magnets/config";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";
import { PESTFLOW_CALENDLY_URL } from "@/lib/intent-funnel";

export { PESTFLOW_CALENDLY_URL } from "@/lib/intent-funnel";

type PopupStep = "offer" | "contact" | "result";

type QuickQuestion = {
  question: string;
  helper: string;
  options: Array<{ value: string; label: string }>;
};

const QUICK_QUESTIONS: Record<LeadMagnetId, QuickQuestion> = {
  "local-growth-map": {
    question: "What kind of local growth matters most right now?",
    helper: "One click gives the result useful context.",
    options: [
      { value: "fill-current-routes", label: "Fill gaps in current routes" },
      { value: "expand-nearby", label: "Expand into a nearby market" },
      { value: "close-review-gap", label: "Close the local review gap" },
    ],
  },
  "ai-receptionist": {
    question: "Which calls are most likely to get missed?",
    helper: "We’ll tailor the sample call around the real problem.",
    options: [
      { value: "after-hours", label: "After-hours leads" },
      { value: "office-overflow", label: "Office overflow" },
      { value: "weekend-urgent", label: "Weekend or urgent calls" },
    ],
  },
  "competitor-exit": {
    question: "What are you operating on today?",
    helper: "This determines the export and pilot checklist.",
    options: [
      { value: "fieldroutes-pestpac", label: "FieldRoutes or PestPac" },
      { value: "gorilladesk", label: "GorillaDesk — watch the migration video" },
      { value: "briostack", label: "Briostack" },
      { value: "spreadsheets-other", label: "Spreadsheets or another system" },
    ],
  },
  "bid-radar": {
    question: "Which contracts are worth surfacing first?",
    helper: "This filters the sample opportunity feed.",
    options: [
      { value: "government-schools", label: "Government and schools" },
      { value: "multifamily-commercial", label: "Multifamily and commercial" },
      { value: "food-healthcare", label: "Food service and healthcare" },
    ],
  },
};

const ROUTE_OPTIONS = [
  { value: "under-100", label: "Under 100 active routes" },
  { value: "100-249", label: "100–249 active routes" },
  { value: "250-499", label: "250–499 active routes" },
  { value: "500-999", label: "500–999 active routes" },
  { value: "1000+", label: "1,000+ active routes" },
];

const TECH_OPTIONS = [
  { value: "owner-only", label: "Owner only" },
  { value: "1-4", label: "1–4 field technicians" },
  { value: "5-9", label: "5–9 field technicians" },
  { value: "10-24", label: "10–24 field technicians" },
  { value: "25+", label: "25+ field technicians" },
];

function variantFromUrl(): LeadMagnetConfig {
  if (typeof window === "undefined") return LEAD_MAGNETS[0];
  const params = new URLSearchParams(window.location.search);
  const value = params.get("popup") || params.get("lead_magnet") || params.get("lm_assignment") || "";
  return getLeadMagnet(value) || LEAD_MAGNETS[0];
}

function campaignFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || sessionStorage.getItem("utm_source"),
    utmCampaign: params.get("utm_campaign") || sessionStorage.getItem("utm_campaign"),
    utmContent: params.get("utm_content") || sessionStorage.getItem("utm_content"),
    experiment: params.get("experiment"),
    assignment: params.get("lm_assignment"),
  };
}

export function DemoVideoModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black border-slate-800">
        <DialogTitle className="sr-only">PestFlow product demo</DialogTitle>
        <div className="relative aspect-video w-full bg-black">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/TB4__rmaNpE?autoplay=1&mute=1"
            title="PestFlow Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
        <div className="bg-slate-900 p-6 text-center">
          <Button
            size="lg"
            className="w-full bg-emerald-600 px-8 py-6 text-xl font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 md:w-auto"
            onClick={() => (window.location.href = "/onboarding")}
          >
            Start for $1 <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-4 text-sm text-slate-400">$1 today · 7-day full-product trial · Cancel anytime</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AutoPopup() {
  const config = useMemo(variantFromUrl, []);
  const question = QUICK_QUESTIONS[config.id];
  const forced = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("popup-check");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<PopupStep>("offer");
  const [quickAnswer, setQuickAnswer] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [routes, setRoutes] = useState("");
  const [technicians, setTechnicians] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const Icon = config.icon;

  useEffect(() => {
    const seenKey = `pestflow_popup_seen_${config.id}`;
    const submittedKey = `pestflow_popup_submitted_${config.id}`;
    if (forced) {
      setOpen(true);
      analytics.track(EVENTS.LANDING.POPUP_SHOWN, { trigger: "forced", variant: config.id });
      return;
    }
    if (localStorage.getItem(submittedKey)) return;
    if (sessionStorage.getItem(seenKey)) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(seenKey, "true");
      analytics.track(EVENTS.LANDING.POPUP_SHOWN, { trigger: "engaged_timer", delay_ms: 8000, variant: config.id });
      analytics.track(EVENTS.LANDING.LEAD_MAGNET_VIEWED, { variant: config.id, surface: "homepage_popup" });
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [config.id, forced]);

  const closePopup = () => {
    analytics.track(EVENTS.LANDING.POPUP_DISMISSED, { step, variant: config.id });
    setOpen(false);
  };

  const continueToContact = () => {
    if (!quickAnswer) {
      setFormError("Choose one option to tailor the result.");
      return;
    }
    setFormError("");
    setStep("contact");
    analytics.track(EVENTS.LANDING.LEAD_MAGNET_QUALIFIED, { variant: config.id, quick_answer: quickAnswer });
  };

  const selectQuickAnswer = (value: string) => {
    setFormError("");
    if (config.id === "competitor-exit" && value === "gorilladesk") {
      analytics.track("Competitor Migration Video Selected", {
        competitor: "gorilladesk",
        surface: "homepage_popup",
      });
      window.location.href = "/competitors/gorilladesk?video=1#gorilladesk-migration-video";
      return;
    }
    setQuickAnswer(value);
  };

  const submitLead = async () => {
    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
    const normalizedEmail = email.trim().toLowerCase();
    const phoneDigits = phone.replace(/\D/g, "");
    if (nameParts.length < 2 || nameParts.some((part) => part.length < 2) || /^(we|you)$/i.test(nameParts[0])) {
      setFormError("Enter a real first and last name.");
      return;
    }
    if (companyName.trim().length < 2) {
      setFormError("Enter your pest-control company name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setFormError("Enter a valid work email.");
      return;
    }
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setFormError("Enter a valid phone number.");
      return;
    }
    if (!routes || !technicians) {
      setFormError("Choose your active routes and field-team size.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    const [firstName, ...lastNameParts] = nameParts;
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "lead_magnet",
          firstName,
          lastName: lastNameParts.join(" "),
          email: normalizedEmail,
          phone: phone.trim(),
          companyName: companyName.trim(),
          technicians,
          routes,
          routeAnswers: {
            leadMagnet: config.id,
            answers: { quickAnswer },
            campaign: campaignFromUrl(),
            referrer: document.referrer || null,
            surface: "homepage_popup",
            stagingPrototype: true,
          },
        }),
      });
      if (!response.ok) throw new Error("capture_failed");

      const popupData = { fullName: fullName.trim(), firstName, lastName: lastNameParts.join(" "), email: normalizedEmail, phone: phone.trim(), companyName: companyName.trim(), routeSize: routes, technicians, leadMagnet: config.id };
      localStorage.setItem("pestflow_popup_data", JSON.stringify(popupData));
      localStorage.setItem(`pestflow_popup_submitted_${config.id}`, "true");
      analytics.identify(normalizedEmail, { lead_magnet: config.id, routes, technicians });
      analytics.track(EVENTS.LANDING.POPUP_SUBMIT, { variant: config.id, fields: ["full_name", "company", "email", "phone", "routes", "technicians"] });
      analytics.track(EVENTS.LANDING.LEAD_MAGNET_SUBMITTED, { variant: config.id, surface: "homepage_popup", routes, technicians });
      setStep("result");
    } catch {
      setFormError("We could not save that yet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={closePopup}>
      <DialogContent
        className="w-[calc(100vw-1.25rem)] overflow-hidden rounded-[26px] border border-white/10 bg-[#0d1117] p-0 shadow-2xl sm:max-w-[510px]"
        hideCloseButton
      >
        <DialogTitle className="sr-only">{config.shortName}</DialogTitle>
        <button
          onClick={closePopup}
          className="absolute right-3 top-3 z-20 rounded-full bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/15 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="max-h-[min(90vh,calc(100dvh-1rem))] overflow-y-auto">
          <div className="h-1.5 w-full" style={{ background: config.accent }} />
          {step === "offer" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-5 sm:p-7">
              <div className="pr-8">
                <img src={logoImage} alt="PestFlow" className="h-12 w-auto object-contain" />
              </div>
              <div className="mt-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em]" style={{ color: config.accent }}><Icon className="h-4 w-4" />{config.eyebrow}</div>
              <h2 className="mt-3 text-3xl font-black leading-[1.02] tracking-[-.04em] text-white">{config.headline} <span style={{ color: config.accent }}>{config.highlight}</span></h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{config.body}</p>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.035] p-4">
                <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-[.15em] text-white/45">Your fast starting point</p><span className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><Clock3 className="h-3.5 w-3.5" />30 seconds</span></div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">{config.benefits.slice(0, 2).map((benefit) => <div key={benefit.title} className="flex items-center gap-2 rounded-xl border border-white/[.07] bg-black/15 p-3 text-xs font-bold text-slate-200"><CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: config.accent }} />{benefit.title}</div>)}</div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-bold text-white">{question.question}</p>
                <p className="mt-1 text-[11px] text-slate-500">{question.helper}</p>
                <div className="mt-3 grid gap-2">{question.options.map((option) => <button key={option.value} onClick={() => selectQuickAnswer(option.value)} className={`flex min-h-11 items-center justify-between rounded-xl border px-3.5 py-3 text-left text-xs font-bold transition ${quickAnswer === option.value ? "text-white" : "border-white/10 bg-white/[.035] text-slate-300 hover:border-white/20"}`} style={quickAnswer === option.value ? { borderColor: config.accent, background: `${config.accent}20` } : undefined}>{option.label}<ChevronRight className="h-4 w-4 shrink-0 opacity-45" /></button>)}</div>
              </div>
              {formError && <p className="mt-3 text-xs font-semibold text-red-400">{formError}</p>}
              <Button onClick={continueToContact} className="mt-4 h-12 w-full text-sm font-black text-white" style={{ background: config.accent }}>{config.primaryCta}<ArrowRight className="ml-2 h-4 w-4" /></Button>
              <p className="mt-3 text-center text-[10px] leading-4 text-slate-500">Built for operating pest-control companies. The next step asks for route and team size so the result is relevant.</p>
            </motion.div>
          )}

          {step === "contact" && (
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="p-5 sm:p-7">
              <button onClick={() => { setStep("offer"); setFormError(""); }} className="mb-4 flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" />Back to the offer</button>
              <div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl" style={{ background: `${config.accent}22`, color: config.accent }}><Icon className="h-5 w-5" /></span><div><p className="text-[10px] font-black uppercase tracking-[.15em]" style={{ color: config.accent }}>Last step · {config.shortName}</p><h2 className="mt-1 text-2xl font-black tracking-[-.035em] text-white">Where should we build your result?</h2></div></div>
              <p className="mt-3 text-xs leading-5 text-slate-400">Full contact and operating size keep the offer useful and filter out companies that are not ready for PestFlow.</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Input value={fullName} onChange={(event) => { setFullName(event.target.value); setFormError(""); }} placeholder="First and last name" className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500" />
                <Input value={companyName} onChange={(event) => { setCompanyName(event.target.value); setFormError(""); }} placeholder="Pest-control company" className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500" />
                <Input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setFormError(""); }} placeholder="Work email" className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500" />
                <Input type="tel" value={phone} onChange={(event) => { setPhone(event.target.value); setFormError(""); }} placeholder="Phone number" className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500" />
                <select value={routes} onChange={(event) => { setRoutes(event.target.value); setFormError(""); }} className="h-11 rounded-md border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white outline-none" aria-label="Active routes"><option value="" className="text-slate-900">Active routes</option>{ROUTE_OPTIONS.map((option) => <option key={option.value} value={option.value} className="text-slate-900">{option.label}</option>)}</select>
                <select value={technicians} onChange={(event) => { setTechnicians(event.target.value); setFormError(""); }} className="h-11 rounded-md border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white outline-none" aria-label="Field technicians"><option value="" className="text-slate-900">Field technicians</option>{TECH_OPTIONS.map((option) => <option key={option.value} value={option.value} className="text-slate-900">{option.label}</option>)}</select>
              </div>
              {formError && <p className="mt-3 text-xs font-semibold text-red-400">{formError}</p>}
              <Button disabled={submitting} onClick={submitLead} className="mt-5 h-12 w-full text-sm font-black text-white" style={{ background: config.accent }}>{submitting ? "Saving your result…" : "Show my tailored result"}{!submitting && <ArrowRight className="ml-2 h-4 w-4" />}</Button>
              <p className="mt-3 text-center text-[10px] leading-4 text-slate-500">No calculator. No long audit. We use these details to save the result and connect it to the right PestFlow setup.</p>
            </motion.div>
          )}

          {step === "result" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-5 sm:p-7">
              <span className="grid h-12 w-12 place-items-center rounded-2xl text-white" style={{ background: config.accent }}><CheckCircle2 className="h-6 w-6" /></span>
              <p className="mt-5 text-[10px] font-black uppercase tracking-[.15em]" style={{ color: config.accent }}>Saved · your fast result</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-.035em] text-white">{config.resultTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{config.resultBody}</p>
              <div className="mt-5 space-y-2">{config.benefits.map((benefit) => <div key={benefit.title} className="rounded-xl border border-white/10 bg-white/[.035] p-3.5"><p className="text-xs font-black text-white">{benefit.title}</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{benefit.body}</p></div>)}</div>
              <a href={`/signup-success?source=lead_magnet_popup_${config.id}`} onClick={() => analytics.track("Lead Magnet Product CTA Clicked", { variant: config.id, surface: "homepage_popup" })} className="mt-5 flex h-12 items-center justify-center rounded-xl text-sm font-black text-white" style={{ background: config.accent }}>Continue into PestFlow<ArrowRight className="ml-2 h-4 w-4" /></a>
              <a href={PESTFLOW_CALENDLY_URL} target="_blank" rel="noreferrer" onClick={() => analytics.track("Calendar Opened", { source: "lead_magnet_popup", variant: config.id })} className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.035] text-xs font-semibold text-slate-300 hover:bg-white/[.07]"><CalendarDays className="h-4 w-4" />Book setup instead</a>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
