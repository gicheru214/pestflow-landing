import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  FileText,
  LoaderCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { analytics, EVENTS } from "@/lib/analytics";
import {
  isLandingExperimentStagingHost,
  type LandingExperimentVariant,
} from "@/lib/landingExperiment";
import { beginMetaLeadEvent, fireMetaLeadOnce } from "@/lib/metaLeadEvent";

type WorkflowId = "recurring" | "invoice" | "schedule";

type CalendarDate = {
  value: string;
  weekday: string;
  day: string;
  fullLabel: string;
};

const FUNNEL_ID = "direct-intent-staging-v1";
const PESTFLOW_CALENDLY_URL =
  "https://calendly.com/tgicheru21/pestflow-set-up-call";
const POPUP_SEEN_KEY = "pestflow_popup_seen_workflow_v3";
const POPUP_SUBMITTED_KEY = "pestflow_popup_submitted_workflow_v3";

const WORKFLOWS: Array<{
  id: WorkflowId;
  label: string;
  description: string;
  icon: typeof RefreshCw;
}> = [
  {
    id: "recurring",
    label: "Set up recurring service agreements",
    description: "Build the agreement once, then create the future visits.",
    icon: RefreshCw,
  },
  {
    id: "invoice",
    label: "Send an invoice and collect payment",
    description: "Turn finished work into a professional invoice in seconds.",
    icon: FileText,
  },
  {
    id: "schedule",
    label: "Untangle my schedule and routes",
    description: "Organize recurring stops, assignments, and day-of changes.",
    icon: CalendarClock,
  },
];

function localDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function upcomingWeekdays(): CalendarDate[] {
  const dates: CalendarDate[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);
  while (dates.length < 5) {
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) {
      dates.push({
        value: localDateValue(cursor),
        weekday: cursor.toLocaleDateString(undefined, { weekday: "short" }),
        day: String(cursor.getDate()),
        fullLabel: cursor.toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        }),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function calendlyEmbedUrl(selectedDate: string) {
  const url = new URL(PESTFLOW_CALENDLY_URL);
  url.searchParams.set("hide_gdpr_banner", "1");
  url.searchParams.set("hide_event_type_details", "1");
  url.searchParams.set("background_color", "ffffff");
  url.searchParams.set("text_color", "0f172a");
  url.searchParams.set("primary_color", "42a824");
  url.searchParams.set("month", selectedDate.slice(0, 7));
  url.searchParams.set("date", selectedDate);
  return url.toString();
}

function workflowHandoffUrl(workflow: WorkflowId) {
  const current = new URLSearchParams(window.location.search);
  const next = new URLSearchParams({
    source: `direct_intent_workflow_${workflow}`,
    intent: workflow,
    handoff: "app_store",
    ab_variant: "no_playbook",
  });
  if (isLandingExperimentStagingHost()) next.set("internal", "1");
  [
    "device",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "fbclid",
  ].forEach((key) => {
    const value = current.get(key);
    if (value) next.set(key, value);
  });
  return `/signup-success?${next.toString()}`;
}

export function DirectIntentPopup({
  experimentKey,
  variant,
}: {
  experimentKey: string;
  variant: LandingExperimentVariant;
}) {
  const params = new URLSearchParams(window.location.search);
  const forced = params.has("popup-check");
  const resetPreview = params.get("reset_preview") === "1";
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarFrameLoaded, setCalendarFrameLoaded] = useState(false);
  const [calendarDates] = useState(upcomingWeekdays);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(
    calendarDates[0].value,
  );
  const scheduledTrackedRef = useRef(false);

  const experimentProperties = {
    experiment: experimentKey,
    variant,
    funnel: FUNNEL_ID,
    staging_only: true,
  };

  useEffect(() => {
    try {
      if (resetPreview) {
        localStorage.removeItem(POPUP_SEEN_KEY);
        localStorage.removeItem(POPUP_SUBMITTED_KEY);
      }
    } catch {
      // Storage restrictions should not block the staging preview.
    }
    const show = (trigger: string) => {
      setOpen(true);
      analytics.track(EVENTS.LANDING.POPUP_SHOWN, {
        ...experimentProperties,
        trigger,
      });
    };
    if (forced) {
      show(resetPreview ? "forced_reset_preview" : "forced_preview");
      return;
    }
    try {
      if (localStorage.getItem(POPUP_SUBMITTED_KEY)) return;
      if (localStorage.getItem(POPUP_SEEN_KEY)) return;
    } catch {
      // Continue with the normal timer when storage is unavailable.
    }
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(POPUP_SEEN_KEY, "true");
      } catch {
        // The popup can still open without persistence.
      }
      show("first_visit_timer");
    }, 350);
    return () => window.clearTimeout(timer);
  }, [forced, resetPreview]);

  useEffect(() => {
    if (!open) return;
    const handleCalendlyMessage = (event: MessageEvent) => {
      if (
        event.origin !== "https://calendly.com"
        || typeof event.data?.event !== "string"
        || !event.data.event.startsWith("calendly.")
      ) {
        return;
      }
      analytics.track("Calendly Embed Event", {
        ...experimentProperties,
        calendly_event: event.data.event,
        placement: "direct_intent_preload",
      });
      if (
        event.data.event === "calendly.event_scheduled"
        && !scheduledTrackedRef.current
      ) {
        scheduledTrackedRef.current = true;
        analytics.track("Calendar Booking Completed", {
          ...experimentProperties,
          selected_date: selectedCalendarDate,
        });
        analytics.track("Qualified Funnel Action", {
          ...experimentProperties,
          action: "calendar_booked",
        });
        fireMetaLeadOnce(beginMetaLeadEvent());
      }
    };
    window.addEventListener("message", handleCalendlyMessage);
    return () => window.removeEventListener("message", handleCalendlyMessage);
  }, [experimentKey, open, selectedCalendarDate, variant]);

  const selectedDate =
    calendarDates.find((date) => date.value === selectedCalendarDate)
    || calendarDates[0];

  const chooseWorkflow = (workflow: WorkflowId) => {
    analytics.track("Playbook Workflow Selected", {
      ...experimentProperties,
      workflow,
      destination: "staging_app_store_handoff",
    });
    analytics.track("Qualified Funnel Action", {
      ...experimentProperties,
      action: "workflow_selected",
      workflow,
    });
    fireMetaLeadOnce(beginMetaLeadEvent());
  };

  const closePopup = () => {
    analytics.track(EVENTS.LANDING.POPUP_DISMISSED, experimentProperties);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && open) closePopup();
        else setOpen(nextOpen);
      }}
    >
      <DialogContent
        className="top-[50%] max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] gap-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] p-0 shadow-2xl sm:max-w-[400px]"
        hideCloseButton
        aria-describedby="direct-intent-description"
      >
        <DialogTitle className="sr-only">
          Choose how to try PestFlow
        </DialogTitle>
        <button
          type="button"
          onClick={closePopup}
          className="absolute right-3 top-3 z-30 grid h-8 w-8 place-items-center rounded-full bg-white/5 text-slate-400 transition hover:bg-white/15 hover:text-white"
          aria-label="Close and keep browsing"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-4 sm:p-5">
          <div className="flex flex-col items-center pr-8 text-center">
            <img
              src="/assets/pestflow-app-store-icon.jpg"
              alt="PestFlow"
              className="mb-1 h-20 w-20 rounded-2xl border border-white/10 object-cover shadow-lg"
            />
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-emerald-300">
              Pick your next step
            </p>
            <h2 className="mt-1 text-xl font-black leading-tight text-white">
              How do you want to try PestFlow?
            </h2>
            <p
              id="direct-intent-description"
              className="mt-1 text-xs leading-5 text-slate-400"
            >
              Book a setup call or jump into the workflow you care about. No
              download form before you choose.
            </p>
          </div>

          <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_16px_50px_rgba(15,23,42,0.22)]">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-slate-950">
                  Book a setup call
                </h3>
                <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                  Pick a day, then choose a live Calendly time.
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {calendarDates.map((date) => {
                const selected = date.value === selectedCalendarDate;
                return (
                  <button
                    key={date.value}
                    type="button"
                    onClick={() => {
                      setSelectedCalendarDate(date.value);
                      setCalendarFrameLoaded(false);
                      analytics.track("Calendly Week Date Selected", {
                        ...experimentProperties,
                        selected_date: date.value,
                      });
                    }}
                    aria-pressed={selected}
                    className={`rounded-xl border px-1 py-2 text-center transition active:scale-[.98] ${
                      selected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-500"
                        : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-emerald-50/60"
                    }`}
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-wide">
                      {date.weekday}
                    </span>
                    <span className="mt-0.5 block text-lg font-black leading-5">
                      {date.day}
                    </span>
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              onClick={() => {
                analytics.track("Calendly Booking Panel Opened", {
                  ...experimentProperties,
                  selected_date: selectedCalendarDate,
                });
                setCalendarOpen(true);
              }}
              className="mt-3 h-11 w-full rounded-xl bg-emerald-600 text-sm font-black text-white shadow-lg shadow-emerald-950/15 hover:bg-emerald-500"
            >
              See {selectedDate.weekday} {selectedDate.day} times
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  calendarFrameLoaded ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
              {calendarFrameLoaded
                ? "Calendly is ready"
                : "Calendly is preloading while you choose"}
            </p>
          </section>

          <div className="my-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">
            <span className="h-px flex-1 bg-white/10" />
            Or try a workflow
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid gap-2.5">
            {WORKFLOWS.map((workflow) => {
              const Icon = workflow.icon;
              return (
                <a
                  key={workflow.id}
                  href={workflowHandoffUrl(workflow.id)}
                  onClick={() => chooseWorkflow(workflow.id)}
                  className="group relative flex min-h-[72px] items-center gap-3 rounded-xl border border-white/10 bg-white/[.045] p-3 pr-10 text-left transition hover:border-emerald-400/30 hover:bg-emerald-400/[.07] active:scale-[.99]"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-black leading-4 text-white">
                      {workflow.label}
                    </span>
                    <span className="mt-1 block text-[11px] leading-4 text-slate-400">
                      {workflow.description}
                    </span>
                  </span>
                  <ArrowRight className="absolute right-3 h-4 w-4 text-emerald-300" />
                </a>
              );
            })}
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-500">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            No playbook form before the calendar or product choices.
          </p>
        </div>

        <div
          aria-hidden={!calendarOpen}
          className={`absolute inset-0 z-40 flex flex-col bg-[#0d1117] transition-opacity duration-150 ${
            calendarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 pr-12">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
              <CalendarDays className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-black text-white">
                {selectedDate.fullLabel} times
              </h3>
              <p className="mt-0.5 text-[10px] text-slate-400">
                Calendly collects your contact details once you choose a time.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCalendarOpen(false)}
            className="absolute right-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/5 text-slate-400 hover:bg-white/15 hover:text-white"
            aria-label="Return to date choices"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative min-h-[420px] flex-1 overflow-hidden bg-white">
            {!calendarFrameLoaded && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-white text-slate-600">
                <div className="text-center">
                  <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
                  <p className="mt-2 text-xs font-semibold">
                    Loading {selectedDate.weekday} times…
                  </p>
                </div>
              </div>
            )}
            <iframe
              src={calendlyEmbedUrl(selectedCalendarDate)}
              title="Book a PestFlow setup call"
              className={`h-full min-h-[420px] w-full bg-white transition-opacity duration-150 ${
                calendarFrameLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="eager"
              tabIndex={calendarOpen ? 0 : -1}
              onLoad={() => {
                setCalendarFrameLoaded(true);
                analytics.track("Calendly Embed Loaded", {
                  ...experimentProperties,
                  selected_date: selectedCalendarDate,
                });
              }}
            />
          </div>
          <a
            href={calendlyEmbedUrl(selectedCalendarDate)}
            target="_blank"
            rel="noreferrer"
            className="border-t border-white/10 px-4 py-2.5 text-center text-[11px] font-semibold text-slate-300 hover:text-white"
          >
            Calendar not showing? Open {selectedDate.weekday} in a new tab.
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
