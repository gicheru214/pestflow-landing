import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  MapPinned,
  Radio,
  RefreshCcw,
  X,
} from "lucide-react";
import { analytics, EVENTS } from "@/lib/analytics";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

export const PESTFLOW_CALENDLY_URL = "https://calendly.com/tgicheru21/pestflow-set-up-call";

type WorkflowId = "routes" | "billing" | "field" | "switching";
type PopupStep = "question" | "recommendation";

const WORKFLOWS: Record<
  WorkflowId,
  {
    label: string;
    title: string;
    description: string;
    bullets: string[];
    icon: typeof MapPinned;
  }
> = {
  routes: {
    label: "Routes keep changing",
    title: "Start with the route board",
    description: "Keep recurring stops, service windows, technician assignments, and day-of changes in one operating view.",
    bullets: ["Move stops without losing the recurring series", "See route gaps before the trucks roll", "Keep the office and technicians on the same plan"],
    icon: MapPinned,
  },
  billing: {
    label: "Billing takes too much follow-up",
    title: "Start with job-to-payment",
    description: "Connect completed service, invoices, recurring cards, and failed-payment follow-up without rebuilding the work in another tool.",
    bullets: ["Create the invoice from completed work", "Keep recurring billing connected to service", "See what needs payment follow-up"],
    icon: CreditCard,
  },
  field: {
    label: "The office cannot see the field",
    title: "Start with field visibility",
    description: "Give the office a clear view of technician status, service notes, photos, and customer communication.",
    bullets: ["See job status without calling the truck", "Keep notes and service proof with the customer", "Send updates from the same history"],
    icon: Radio,
  },
  switching: {
    label: "Switching software feels risky",
    title: "Start with a safe switch plan",
    description: "Test one real workflow in PestFlow before changing the system your team relies on today.",
    bullets: ["Run a small parallel test first", "Move one workflow before the full operation", "Get human setup help when you need it"],
    icon: RefreshCcw,
  },
};

function workflowFromUrl(): WorkflowId | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("intent");
  return value && value in WORKFLOWS ? (value as WorkflowId) : null;
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
  const initialWorkflow = useMemo(workflowFromUrl, []);
  const forced = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("popup-check");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<PopupStep>("question");
  const [workflowId, setWorkflowId] = useState<WorkflowId | null>(initialWorkflow);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const workflow = workflowId ? WORKFLOWS[workflowId] : null;

  useEffect(() => {
    if (forced) {
      setOpen(true);
      analytics.track(EVENTS.LANDING.POPUP_SHOWN, { trigger: "forced" });
      return;
    }
    if (localStorage.getItem("pestflow_popup_submitted")) return;
    if (sessionStorage.getItem("pestflow_popup_seen")) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem("pestflow_popup_seen", "true");
      analytics.track(EVENTS.LANDING.POPUP_SHOWN, { trigger: "engaged_timer", delay_ms: 8000 });
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [forced]);

  const closePopup = () => {
    analytics.track(EVENTS.LANDING.POPUP_DISMISSED, { step });
    setOpen(false);
  };

  const selectWorkflow = (id: WorkflowId) => {
    setWorkflowId(id);
    analytics.track("Popup Workflow Selected", { workflow: id });
  };

  const showRecommendation = () => {
    if (!workflowId) return;
    setStep("recommendation");
    analytics.track("Popup Workflow Recommendation Viewed", { workflow: workflowId });
  };

  const submitEmail = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError("Enter a valid work email");
      return;
    }

    setSubmitting(true);
    setEmailError("");
    try {
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          email: normalizedEmail,
          companyName: `Workflow interest: ${workflowId || "general"}`,
        }),
      });
      analytics.identify(normalizedEmail, { workflow: workflowId });
      analytics.track(EVENTS.LANDING.POPUP_SUBMIT, { workflow: workflowId, fields: ["email"] });
      localStorage.setItem("pestflow_popup_submitted", "true");
      const params = new URLSearchParams({ source: "popup_workflow", email: normalizedEmail });
      if (workflowId) params.set("intent", workflowId);
      window.location.href = `/signup-success?${params.toString()}`;
    } catch {
      setEmailError("We could not save that yet. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={closePopup}>
      <DialogContent
        className="w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] p-0 shadow-2xl sm:max-w-[430px]"
        hideCloseButton
      >
        <button
          onClick={closePopup}
          className="absolute right-3 top-3 z-20 rounded-full bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/15 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="max-h-[min(88vh,calc(100dvh-2rem))] overflow-y-auto">
          {step === "question" ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-5 sm:p-7">
              <img src={logoImage} alt="PestFlow" className="mb-3 h-14 w-auto object-contain" />
              <div className="mb-4 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                One quick question
              </div>
              <h2 className="text-2xl font-extrabold leading-tight text-white">What would you fix first?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Choose one. We’ll show you the PestFlow workflow that fits before asking for your information.</p>

              <div className="mt-5 space-y-2.5">
                {(Object.entries(WORKFLOWS) as Array<[WorkflowId, (typeof WORKFLOWS)[WorkflowId]]>).map(([id, item]) => {
                  const Icon = item.icon;
                  const selected = workflowId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => selectWorkflow(id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${selected ? "border-emerald-500 bg-emerald-500/10 text-white" : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"}`}
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${selected ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-400"}`}><Icon className="h-4 w-4" /></span>
                      <span className="flex-1">{item.label}</span>
                      <span className={`h-4 w-4 rounded-full border ${selected ? "border-emerald-400 bg-emerald-400 shadow-[inset_0_0_0_3px_#0d1117]" : "border-white/20"}`} />
                    </button>
                  );
                })}
              </div>

              <Button
                disabled={!workflowId}
                onClick={showRecommendation}
                className="mt-5 h-12 w-full bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-40"
              >
                Show me the right workflow <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <a
                href={PESTFLOW_CALENDLY_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => analytics.track("Calendar Opened", { source: "popup_question" })}
                className="mt-3 flex items-center justify-center gap-2 py-1 text-xs font-semibold text-slate-400 transition-colors hover:text-white"
              >
                <CalendarDays className="h-4 w-4" /> Book a 15-minute setup call instead
              </a>
            </motion.div>
          ) : workflow ? (
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="p-5 sm:p-7">
              <img src={logoImage} alt="PestFlow" className="mb-3 h-14 w-auto object-contain" />
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-400">Your best first workflow</p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-white">{workflow.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{workflow.description}</p>

              <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4">
                <div className="space-y-2.5">
                  {workflow.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-start gap-2.5 text-sm text-slate-200">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="popup-work-email" className="mb-1.5 block text-xs font-semibold text-slate-300">Work email</label>
                <Input
                  id="popup-work-email"
                  type="email"
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); setEmailError(""); }}
                  placeholder="you@yourcompany.com"
                  className={`h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 ${emailError ? "border-red-500" : ""}`}
                />
                {emailError && <p className="mt-1 text-xs text-red-400">{emailError}</p>}
                <p className="mt-2 text-[11px] leading-4 text-slate-500">No phone number required. We’ll save your recommended setup and take you to the real $1 trial.</p>
              </div>

              <Button
                disabled={submitting}
                onClick={submitEmail}
                className="mt-4 h-12 w-full bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-500"
              >
                {submitting ? "Saving…" : "Save my setup + start for $1"} {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
              <a
                href={PESTFLOW_CALENDLY_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => analytics.track("Calendar Opened", { source: "popup_recommendation", workflow: workflowId })}
                className="mt-3 flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] text-xs font-semibold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
              >
                <CalendarDays className="h-4 w-4" /> Book setup instead
              </a>
              <button onClick={() => setStep("question")} className="mt-3 w-full text-center text-[11px] text-slate-500 hover:text-slate-300">Choose a different workflow</button>
            </motion.div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
