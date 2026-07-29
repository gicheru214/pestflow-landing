import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Home,
  Menu,
  RefreshCw,
  Route as RouteIcon,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";
import { PESTFLOW_APP_STORE_URL } from "@/lib/intent-funnel";
import type { WorkflowId } from "@/components/home/playbook-activation-popup";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

type Device = "ios" | "android" | "desktop";
type SavedLead = {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

const APP_ENTRY_URL = "https://app.pestflow.org/mobile/onboard/feature";

const WORKFLOW_COPY: Record<
  WorkflowId,
  {
    eyebrow: string;
    title: string;
    subhead: string;
    action: string;
    completedAction: string;
    gateTitle: string;
  }
> = {
  recurring: {
    eyebrow: "Recurring service",
    title: "Garcia Residence",
    subhead: "Bi-monthly general pest service",
    action: "Build the next 6 visits",
    completedAction: "Use this with my customers",
    gateTitle: "Build recurring revenue in your workspace",
  },
  invoice: {
    eyebrow: "Completed service",
    title: "Invoice #1048",
    subhead: "Garcia Residence · General pest service",
    action: "Create the invoice",
    completedAction: "Send this from my account",
    gateTitle: "Send real invoices from your workspace",
  },
  schedule: {
    eyebrow: "Tuesday route",
    title: "Northside Route",
    subhead: "7 stops · One timing conflict",
    action: "Tighten today’s route",
    completedAction: "Use this on my schedule",
    gateTitle: "Organize your real schedule in PestFlow",
  },
};

function workflowFromUrl(): WorkflowId {
  if (typeof window === "undefined") return "recurring";
  const requested = new URLSearchParams(window.location.search).get("workflow");
  if (
    requested === "recurring" ||
    requested === "invoice" ||
    requested === "schedule"
  ) {
    return requested;
  }
  return "recurring";
}

function deviceFromUrl(): Device {
  if (typeof window === "undefined") return "desktop";
  const requested = new URLSearchParams(window.location.search).get("device");
  if (
    requested === "ios" ||
    requested === "android" ||
    requested === "desktop"
  ) {
    return requested;
  }
  const userAgent = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (/android/.test(userAgent)) return "android";
  return "desktop";
}

function savedLead(): SavedLead {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}");
  } catch {
    return {};
  }
}

function initialSuccessView() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("preview") === "success";
}

function successSource() {
  if (typeof window === "undefined") return "workflow";
  return new URLSearchParams(window.location.search).get("source") || "workflow";
}

function appEntryUrl(workflow: WorkflowId, lead: SavedLead) {
  const url = new URL(APP_ENTRY_URL);
  const firstName = lead.firstName || lead.name?.trim().split(/\s+/)[0];
  const lastName =
    lead.lastName || lead.name?.trim().split(/\s+/).slice(1).join(" ");
  if (firstName) url.searchParams.set("firstName", firstName);
  if (lastName) url.searchParams.set("lastName", lastName);
  if (lead.email) url.searchParams.set("email", lead.email);
  if (lead.phone) url.searchParams.set("phone", lead.phone);
  url.searchParams.set("intent", workflow);
  url.searchParams.set("source", "workflow_preview_v2");
  return url.toString();
}

function workflowChoiceUrl() {
  const current = new URLSearchParams(window.location.search);
  const next = new URLSearchParams({
    funnel: "playbook-workflow-v2",
    "popup-check": "1",
    preview_step: "workflow",
  });
  ["internal", "device", "revision"].forEach((key) => {
    const value = current.get(key);
    if (value) next.set(key, value);
  });
  return `/?${next.toString()}`;
}

function PreviewHeader({
  lead,
  onEngage,
}: {
  lead: SavedLead;
  onEngage: (control: string) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-white">
            <img
              src={logoImage}
              alt=""
              className="h-full w-full object-contain"
            />
          </span>
          <div>
            <p className="text-xs font-black leading-none text-slate-950">
              PestFlow
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[.13em] text-emerald-700">
              Interactive preview
            </p>
          </div>
        </div>
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500"
          aria-label="Preview menu"
          onClick={() => onEngage("menu")}
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/70 px-4 py-2">
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-900">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Sample workspace
        </div>
        <p className="max-w-[190px] truncate text-[10px] font-semibold text-emerald-800/70">
          {lead.firstName ? `${lead.firstName}’s preview` : "No login required"}
        </p>
      </div>
    </>
  );
}

function RecurringPreview({ activated }: { activated: boolean }) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {[
          ["$129", "per visit"],
          ["60 days", "frequency"],
          [activated ? "6" : "1", activated ? "visits ready" : "visit ready"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-2.5">
            <p className="text-sm font-black text-slate-950">{value}</p>
            <p className="mt-0.5 text-[9px] font-semibold text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.12em] text-emerald-700">
              Service agreement
            </p>
            <h2 className="mt-1 text-base font-black text-slate-950">
              Bi-monthly pest protection
            </h2>
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-black text-emerald-800">
            ACTIVE
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
          <div className="rounded-lg bg-slate-50 p-2.5">
            <p className="text-slate-500">Customer</p>
            <p className="mt-1 font-bold text-slate-900">Maria Garcia</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2.5">
            <p className="text-slate-500">Annual value</p>
            <p className="mt-1 font-bold text-slate-900">$774</p>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activated && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5"
          >
            <div className="flex items-center gap-2 text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-black">Six future visits are ready</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              {["Aug", "Oct", "Dec", "Feb", "Apr", "Jun"].map((month, index) => (
                <div key={month} className="text-center">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-[9px] font-black text-emerald-800 shadow-sm">
                    {index + 1}
                  </span>
                  <p className="mt-1 text-[8px] font-bold text-emerald-800/70">{month}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function InvoicePreview({ activated }: { activated: boolean }) {
  return (
    <div>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.12em] text-emerald-700">
              PestFlow invoice
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Invoice #1048</h2>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${
            activated
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}>
            {activated ? "READY TO SEND" : "DRAFT"}
          </span>
        </div>
        <div className="my-4 h-px bg-slate-100" />
        <div className="flex items-start justify-between text-xs">
          <div>
            <p className="font-black text-slate-900">Garcia Residence</p>
            <p className="mt-1 text-[10px] text-slate-500">General pest service</p>
          </div>
          <p className="font-black text-slate-950">$189.00</p>
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Subtotal</span><span>$189.00</span>
          </div>
          <div className="mt-2 flex justify-between text-sm font-black text-slate-950">
            <span>Total due</span><span>$189.00</span>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
              <Check className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-black text-emerald-950">Invoice built</p>
              <p className="mt-0.5 text-[10px] text-emerald-800">
                Email, text, and card-payment link are ready.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SchedulePreview({ activated }: { activated: boolean }) {
  const stops = activated
    ? [
        ["8:00", "Cooper Dental", "12 min"],
        ["9:05", "Garcia Residence", "8 min"],
        ["10:10", "Oak Terrace", "10 min"],
      ]
    : [
        ["8:00", "Cooper Dental", "12 min"],
        ["9:40", "Oak Terrace", "28 min"],
        ["10:15", "Garcia Residence", "18 min"],
      ];

  return (
    <div>
      <div className={`mb-3 flex items-center justify-between rounded-xl border p-3 ${
        activated
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50"
      }`}>
        <div className="flex items-center gap-2">
          {activated ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <Clock3 className="h-4 w-4 text-amber-600" />
          )}
          <p className={`text-xs font-black ${
            activated ? "text-emerald-900" : "text-amber-900"
          }`}>
            {activated ? "37 minutes saved" : "Route running 42 minutes late"}
          </p>
        </div>
        <span className={`text-[9px] font-black ${
          activated ? "text-emerald-700" : "text-amber-700"
        }`}>
          {activated ? "BALANCED" : "1 CONFLICT"}
        </span>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-black text-slate-950">Northside · Alex</p>
          <p className="text-[10px] font-semibold text-slate-500">7 stops</p>
        </div>
        <div className="space-y-2">
          {stops.map(([time, customer, drive], index) => (
            <motion.div
              layout
              key={customer}
              className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-950 text-[10px] font-black text-white">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-black text-slate-900">{customer}</p>
                <p className="mt-0.5 text-[9px] text-slate-500">{time} appointment</p>
              </div>
              <span className="text-[9px] font-bold text-slate-500">{drive}</span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SuccessScreen({
  workflow,
  device,
  lead,
  onBack,
}: {
  workflow: WorkflowId;
  device: Device;
  lead: SavedLead;
  onBack: () => void;
}) {
  const source = successSource();
  const bookedCall = source === "calendly";
  const continueToApp = () => {
    analytics.track("Workflow Success Account Handoff Clicked", {
      funnel: "playbook-workflow-v2",
      workflow,
      device,
      source,
      has_saved_contact: Boolean(lead.email || lead.phone),
      destination: "pestflow_web_onboarding",
    });
  };
  const openAppStore = () => {
    analytics.track("Workflow Success App Store Clicked", {
      funnel: "playbook-workflow-v2",
      workflow,
      device,
      source,
    });
  };

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#07101c] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] max-w-[430px] flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:justify-center sm:py-10">
        <header className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white p-1.5">
            <img
              src={logoImage}
              alt="PestFlow"
              className="h-full w-full object-contain"
            />
          </span>
          <div>
            <p className="text-sm font-black text-white">PestFlow</p>
            <p className="text-[9px] font-bold uppercase tracking-[.14em] text-emerald-300">
              Success
            </p>
          </div>
        </header>

        <section className="mt-10">
          <span className="grid h-16 w-16 place-items-center rounded-[22px] bg-emerald-400 text-emerald-950 shadow-[0_18px_50px_rgba(66,168,36,.25)]">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[.15em] text-emerald-300">
            {bookedCall ? "Setup call booked" : "Workflow ready"}
          </p>
          <h1 className="mt-2 text-4xl font-black leading-[1.03] tracking-[-.045em] text-white">
            {bookedCall
              ? "You’re booked. Keep PestFlow on your iPhone."
              : "You’re ready for the real PestFlow app."}
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            {bookedCall
              ? "Your playbook request and setup call are saved. Download PestFlow now so the app is ready before the conversation."
              : "Your starting workflow is selected. Download PestFlow to continue with your own customers, invoices, and schedule."}
          </p>

          {(lead.email || lead.phone) && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-400/[.07] p-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                <UserRound className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-white">
                  {lead.name ||
                    [lead.firstName, lead.lastName].filter(Boolean).join(" ")}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                  {[lead.email, lead.phone].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          )}

          <div className="mt-7 grid gap-3">
            {device === "ios" ? (
              <>
                <Button
                  asChild
                  className="h-14 w-full rounded-xl bg-emerald-400 text-sm font-black text-emerald-950 hover:bg-emerald-300"
                >
                  <a
                    href={PESTFLOW_APP_STORE_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={openAppStore}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download PestFlow for iPhone
                  </a>
                </Button>
                <a
                  href={appEntryUrl(workflow, lead)}
                  onClick={continueToApp}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.04] text-xs font-semibold text-slate-300"
                >
                  Finish setup in the browser
                  <ExternalLink className="h-4 w-4" />
                </a>
              </>
            ) : (
              <>
                <Button
                  asChild
                  className="h-14 w-full rounded-xl bg-emerald-400 text-sm font-black text-emerald-950 hover:bg-emerald-300"
                >
                  <a href={appEntryUrl(workflow, lead)} onClick={continueToApp}>
                    Continue into PestFlow
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <a
                  href={PESTFLOW_APP_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={openAppStore}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.04] text-xs font-semibold text-slate-300"
                >
                  <Smartphone className="h-4 w-4" />
                  Send me to the iPhone app
                </a>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-5 w-full text-center text-[11px] font-semibold text-slate-500"
          >
            Back to the interactive preview
          </button>
        </section>
      </div>
    </main>
  );
}

export default function PestFlowWorkflowPreview() {
  const workflow = useMemo(workflowFromUrl, []);
  const device = useMemo(deviceFromUrl, []);
  const lead = useMemo(savedLead, []);
  const copy = WORKFLOW_COPY[workflow];
  const [activated, setActivated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(initialSuccessView);

  useEffect(() => {
    analytics.track("Workflow Preview Viewed", {
      funnel: "playbook-workflow-v2",
      workflow,
      device,
      has_saved_contact: Boolean(lead.email || lead.phone),
    });
  }, [device, lead.email, lead.phone, workflow]);

  useEffect(() => {
    if (!showSuccess) return;
    analytics.track("Workflow Success Viewed", {
      funnel: "playbook-workflow-v2",
      workflow,
      device,
      source: successSource(),
      has_saved_contact: Boolean(lead.email || lead.phone),
    });
  }, [device, lead.email, lead.phone, showSuccess, workflow]);

  const openSuccess = (trigger: string) => {
    analytics.track("Workflow Success Opened", {
      funnel: "playbook-workflow-v2",
      workflow,
      device,
      trigger,
    });
    const params = new URLSearchParams(window.location.search);
    params.set("preview", "success");
    window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
    setShowSuccess(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const runPreviewAction = () => {
    if (activated) {
      openSuccess("completed_workflow");
      return;
    }
    analytics.track("Workflow Preview Action Completed", {
      funnel: "playbook-workflow-v2",
      workflow,
      device,
    });
    setActivated(true);
  };

  const openSignupFromControl = (control: string) => {
    analytics.track("Workflow Preview Secondary Interaction", {
      funnel: "playbook-workflow-v2",
      workflow,
      device,
      control,
      result: "success_page",
    });
    openSuccess(`preview_${control}`);
  };

  if (showSuccess) {
    return (
      <SuccessScreen
        workflow={workflow}
        device={device}
        lead={lead}
        onBack={() => {
          const params = new URLSearchParams(window.location.search);
          params.delete("preview");
          window.history.replaceState(
            {},
            "",
            `${window.location.pathname}?${params}`,
          );
          setShowSuccess(false);
        }}
      />
    );
  }

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#07101c] text-slate-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] max-w-[430px] flex-col bg-slate-100 shadow-[0_0_80px_rgba(0,0,0,.45)] sm:my-5 sm:min-h-[calc(100dvh-2.5rem)] sm:overflow-hidden sm:rounded-[34px] sm:border-[7px] sm:border-slate-950">
        <PreviewHeader
          lead={lead}
          onEngage={openSignupFromControl}
        />

        <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4">
          <a
            href={workflowChoiceUrl()}
            className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Change workflow
          </a>

          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-emerald-700">
                {copy.eyebrow}
              </p>
              <h1 className="mt-1 text-xl font-black leading-tight text-slate-950">
                {copy.title}
              </h1>
              <p className="mt-1 text-[11px] text-slate-500">{copy.subhead}</p>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white">
              {workflow === "recurring" && <RefreshCw className="h-5 w-5" />}
              {workflow === "invoice" && <FileText className="h-5 w-5" />}
              {workflow === "schedule" && <RouteIcon className="h-5 w-5" />}
            </span>
          </div>

          {workflow === "recurring" && <RecurringPreview activated={activated} />}
          {workflow === "invoice" && <InvoicePreview activated={activated} />}
          {workflow === "schedule" && <SchedulePreview activated={activated} />}

          <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              <p className="text-[9px] font-bold text-slate-600">
                Preview data only—nothing is sent to a customer.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-[59px] border-t border-slate-200 bg-white/95 p-3 backdrop-blur">
          <Button
            type="button"
            onClick={runPreviewAction}
            className={`h-12 w-full rounded-xl text-sm font-black ${
              activated
                ? "bg-slate-950 text-white hover:bg-slate-800"
                : "bg-emerald-600 text-white hover:bg-emerald-500"
            }`}
          >
            {activated ? copy.completedAction : copy.action}
            {activated ? (
              <ArrowRight className="ml-2 h-4 w-4" />
            ) : (
              <Sparkles className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="absolute inset-x-0 bottom-0 grid h-[60px] grid-cols-4 border-t border-slate-200 bg-white px-3">
          {[
            [Home, "Home"],
            [CalendarDays, "Schedule"],
            [Users, "Customers"],
            [CircleDollarSign, "Billing"],
          ].map(([Icon, label], index) => {
            const NavIcon = Icon as typeof Home;
            return (
              <button
                key={String(label)}
                type="button"
                onClick={() => openSignupFromControl(String(label).toLowerCase())}
                className={`flex flex-col items-center justify-center gap-1 text-[9px] font-bold ${
                  index === 0 ? "text-emerald-700" : "text-slate-400"
                }`}
              >
                <NavIcon className="h-4 w-4" />
                {String(label)}
              </button>
            );
          })}
        </nav>
      </div>
    </main>
  );
}
