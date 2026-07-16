import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  MapPinned,
  Radio,
  RefreshCcw,
  X,
} from "lucide-react";
import { analytics } from "@/lib/analytics";
import { PESTFLOW_CALENDLY_URL } from "@/lib/intent-funnel";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

export type WorkflowId = "routes" | "billing" | "field" | "switching";
type Step = "question" | "recommendation";

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
    bullets: [
      "Move stops without losing the recurring series",
      "See route gaps before the trucks roll",
      "Keep the office and technicians on the same plan",
    ],
    icon: MapPinned,
  },
  billing: {
    label: "Billing takes too much follow-up",
    title: "Start with job-to-payment",
    description: "Connect completed service, invoices, recurring cards, and failed-payment follow-up without rebuilding work in another tool.",
    bullets: [
      "Create the invoice from completed work",
      "Keep recurring billing connected to service",
      "See what needs payment follow-up",
    ],
    icon: CreditCard,
  },
  field: {
    label: "The office cannot see the field",
    title: "Start with field visibility",
    description: "Give the office a clear view of technician status, service notes, photos, and customer communication.",
    bullets: [
      "See job status without calling the truck",
      "Keep notes and service proof with the customer",
      "Send updates from the same history",
    ],
    icon: Radio,
  },
  switching: {
    label: "Switching software feels risky",
    title: "Start with a safe switch plan",
    description: "Test one real workflow in PestFlow before changing the system your team relies on today.",
    bullets: [
      "Run a small parallel test first",
      "Move one workflow before the full operation",
      "Get human setup help when you need it",
    ],
    icon: RefreshCcw,
  },
};

function workflowFromUrl(): WorkflowId | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("intent");
  return value && value in WORKFLOWS ? (value as WorkflowId) : null;
}

export function JtbdPopup() {
  const initialWorkflow = useMemo(workflowFromUrl, []);
  const forced =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("popup-check");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("question");
  const [workflowId, setWorkflowId] = useState<WorkflowId | null>(initialWorkflow);
  const workflow = workflowId ? WORKFLOWS[workflowId] : null;

  useEffect(() => {
    if (forced) {
      setOpen(true);
      analytics.track("JTBD Prompt Viewed", {
        trigger: "forced",
        experiment: "activation-entry-v1",
      });
      return;
    }

    const seenKey = "pestflow_jtbd_prompt_seen";
    if (sessionStorage.getItem(seenKey)) return;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(seenKey, "true");
      setOpen(true);
      analytics.track("JTBD Prompt Viewed", {
        trigger: "engaged_timer",
        delay_ms: 8000,
        experiment: "activation-entry-v1",
      });
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [forced]);

  const close = () => {
    analytics.track("JTBD Prompt Dismissed", { step, workflow: workflowId });
    setOpen(false);
  };

  const selectWorkflow = (id: WorkflowId) => {
    setWorkflowId(id);
    analytics.track("JTBD Selected", {
      workflow: id,
      experiment: "activation-entry-v1",
    });
  };

  const showRecommendation = () => {
    if (!workflowId) return;
    setStep("recommendation");
    analytics.track("JTBD Recommendation Viewed", { workflow: workflowId });
  };

  const startUrl = workflowId
    ? `/experiments/intent-first/success?intent=${workflowId}`
    : "/experiments/intent-first/success";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && open) close();
        else setOpen(nextOpen);
      }}
    >
      <DialogContent
        className="max-h-[min(90vh,calc(100dvh-1rem))] w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] overflow-y-auto rounded-[26px] border border-white/10 bg-[#0d1117] p-0 text-white shadow-2xl sm:max-w-[510px]"
        hideCloseButton
      >
        <DialogTitle className="sr-only">Choose the PestFlow workflow to start with</DialogTitle>
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 z-20 rounded-full bg-white/5 p-2 text-slate-400 transition hover:bg-white/15 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {step === "question" ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-5 sm:p-7">
            <img src={logoImage} alt="PestFlow" className="mb-3 h-14 w-auto object-contain" />
            <div className="mb-4 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300">
              One quick question
            </div>
            <h2 className="text-2xl font-extrabold leading-tight text-white">What would you fix first?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Choose one. We’ll show you the PestFlow workflow that fits before asking for your information.
            </p>

            <div className="mt-5 space-y-2.5">
              {(Object.entries(WORKFLOWS) as Array<[WorkflowId, (typeof WORKFLOWS)[WorkflowId]]>).map(([id, item]) => {
                const Icon = item.icon;
                const selected = workflowId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectWorkflow(id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${selected ? "border-emerald-500 bg-emerald-500/10 text-white" : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"}`}
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${selected ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-400"}`}>
                      <Icon className="h-4 w-4" />
                    </span>
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
              Show me where to start <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <a
              href={PESTFLOW_CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => analytics.track("Calendar Opened", { source: "jtbd_question" })}
              className="mt-3 flex items-center justify-center gap-2 py-1 text-xs font-semibold text-slate-400 transition hover:text-white"
            >
              <CalendarDays className="h-4 w-4" /> Book a setup call instead
            </a>
          </motion.div>
        ) : workflow ? (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="p-5 sm:p-7">
            <button
              type="button"
              onClick={() => setStep("question")}
              className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Choose a different problem
            </button>
            <img src={logoImage} alt="PestFlow" className="mb-3 h-14 w-auto object-contain" />
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-400">Best first workflow</p>
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

            <Button asChild className="mt-5 h-12 w-full bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-500">
              <a
                href={startUrl}
                onClick={() => analytics.track("JTBD Start Clicked", { workflow: workflowId })}
              >
                Start with this workflow <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <p className="mt-3 text-center text-[11px] leading-4 text-slate-500">
              You’ll enter PestFlow first, then save your contact information inside.
            </p>
          </motion.div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
