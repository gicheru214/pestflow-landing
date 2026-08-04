import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  FileText,
  LoaderCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analytics, EVENTS } from "@/lib/analytics";
import { beginMetaLeadEvent } from "@/lib/metaLeadEvent";
import { isTenDigitPhone, limitPhoneInput } from "@shared/phone";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

export type WorkflowId = "recurring" | "invoice" | "schedule";

type PopupStep = "playbook" | "workflow";

type SubmissionResponse = {
  metaRegistration?: {
    eventId?: string;
  };
  playbookDelivery?: {
    accepted?: boolean;
  };
};

const FUNNEL_ID = "playbook-workflow-v3";
const PESTFLOW_CALENDLY_URL =
  "https://calendly.com/tgicheru21/pestflow-set-up-call";
const POPUP_SEEN_KEY = "pestflow_popup_seen_workflow_v3";
const POPUP_SUBMITTED_KEY = "pestflow_popup_submitted_workflow_v3";
const POPUP_DATA_KEY = "pestflow_popup_data";

const WORKFLOWS: Array<{
  id: WorkflowId;
  label: string;
  description: string;
  icon: typeof RefreshCw;
}> = [
  {
    id: "recurring",
    label: "Set up recurring service agreements",
    description: "Create the agreement once, then build the future visits.",
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

function initialStep(): PopupStep {
  if (typeof window === "undefined") return "playbook";
  return new URLSearchParams(window.location.search).get("preview_step") ===
    "workflow"
    ? "workflow"
    : "playbook";
}

type CalendarDate = {
  value: string;
  weekday: string;
  day: string;
  fullLabel: string;
};

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

  // Start with the next business day so the default date is less likely to be
  // blocked by Calendly's minimum-notice rules.
  cursor.setDate(cursor.getDate() + 1);
  while (dates.length < 5) {
    const weekday = cursor.getDay();
    if (weekday !== 0 && weekday !== 6) {
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

function campaignFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || sessionStorage.getItem("utm_source"),
    utm_campaign:
      params.get("utm_campaign") || sessionStorage.getItem("utm_campaign"),
    utm_content:
      params.get("utm_content") || sessionStorage.getItem("utm_content"),
  };
}

function pushPartial(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify({ type: "popup_partial", ...payload });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/submissions",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
    fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Partial capture must never interrupt the visitor's funnel.
  }
}

function workflowHandoffUrl(
  workflow: WorkflowId,
  metaEventId: string,
) {
  const current = new URLSearchParams(window.location.search);
  const next = new URLSearchParams({
    source: `playbook_workflow_${workflow}`,
    intent: workflow,
    handoff: "app_store",
  });
  if (metaEventId) next.set("meta_event_id", metaEventId);
  [
    "internal",
    "device",
    "revision",
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

function calendlyEmbedUrl(
  name: string,
  email: string,
  selectedDate?: string,
) {
  const url = new URL(PESTFLOW_CALENDLY_URL);
  url.searchParams.set("hide_gdpr_banner", "1");
  url.searchParams.set("hide_event_type_details", "1");
  url.searchParams.set("background_color", "ffffff");
  url.searchParams.set("text_color", "0f172a");
  url.searchParams.set("primary_color", "42a824");
  if (selectedDate) {
    url.searchParams.set("month", selectedDate.slice(0, 7));
    url.searchParams.set("date", selectedDate);
  }
  if (name.trim()) url.searchParams.set("name", name.trim());
  if (email.trim()) url.searchParams.set("email", email.trim());
  return url.toString();
}

export function PlaybookActivationPopup() {
  const params = new URLSearchParams(window.location.search);
  const forced = params.has("popup-check");
  const resetPreview = params.get("reset_preview") === "1";
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<PopupStep>(initialStep);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [metaEventId, setMetaEventId] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarFrameLoaded, setCalendarFrameLoaded] = useState(false);
  const [calendarReady, setCalendarReady] = useState(false);
  const [calendarDates] = useState(upcomingWeekdays);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(
    calendarDates[0].value,
  );
  const snapshotRef = useRef<Record<string, unknown>>({});
  const calendlyLoadStartedAtRef = useRef<number | null>(null);
  const calendlyLoadTrackedRef = useRef(false);
  const calendlyReadyTrackedRef = useRef(false);

  useEffect(() => {
    if (resetPreview) {
      localStorage.removeItem(POPUP_SEEN_KEY);
      localStorage.removeItem(POPUP_SUBMITTED_KEY);
      localStorage.removeItem(POPUP_DATA_KEY);
      setMetaEventId("");
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem(POPUP_DATA_KEY) || "{}");
        if (typeof saved.metaEventId === "string") {
          setMetaEventId(saved.metaEventId);
        }
      } catch {
        // A malformed local snapshot should not block the popup.
      }
    }

    const openPopup = (trigger: string) => {
      setOpen(true);
      analytics.track(EVENTS.LANDING.POPUP_SHOWN, {
        trigger,
        funnel: FUNNEL_ID,
        step: initialStep(),
      });
    };

    if (forced) {
      openPopup(resetPreview ? "forced_reset_preview" : "forced_preview");
      return;
    }
    if (localStorage.getItem(POPUP_SUBMITTED_KEY)) {
      return;
    }
    if (localStorage.getItem(POPUP_SEEN_KEY)) {
      return;
    }

    const timer = window.setTimeout(() => {
      localStorage.setItem(POPUP_SEEN_KEY, "true");
      openPopup("first_visit_timer");
    }, 350);
    return () => window.clearTimeout(timer);
  }, [forced, resetPreview]);

  useEffect(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    snapshotRef.current = {
      name,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" "),
      phone,
      email,
      step,
      funnelVariant: FUNNEL_ID,
      metaEventId,
    };
  }, [email, metaEventId, name, phone, step]);

  useEffect(() => {
    const onLeave = () => {
      const data = snapshotRef.current;
      if (data.email || data.phone || data.name) {
        pushPartial({ ...data, reason: "unload" });
      }
    };
    window.addEventListener("beforeunload", onLeave);
    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener("beforeunload", onLeave);
      window.removeEventListener("pagehide", onLeave);
    };
  }, []);

  const selectedCalendarDateDetails =
    calendarDates.find((date) => date.value === selectedCalendarDate) ||
    calendarDates[0];

  useEffect(() => {
    if (!open) return;
    if (calendlyLoadStartedAtRef.current === null) {
      calendlyLoadStartedAtRef.current = performance.now();
    }

    const handleCalendlyMessage = (event: MessageEvent) => {
      if (
        event.origin !== "https://calendly.com" ||
        typeof event.data?.event !== "string" ||
        !event.data.event.startsWith("calendly.")
      ) {
        return;
      }
      analytics.track("Calendly Embed Event", {
        funnel: FUNNEL_ID,
        calendly_event: event.data.event,
        placement: "preloaded_weekly_calendar",
      });
      if (
        !calendlyReadyTrackedRef.current &&
        (event.data.event === "calendly.profile_page_viewed" ||
          event.data.event === "calendly.event_type_viewed")
      ) {
        calendlyReadyTrackedRef.current = true;
        setCalendarReady(true);
        analytics.track("Calendly Ready", {
          funnel: FUNNEL_ID,
          placement: "preloaded_weekly_calendar",
          ready_duration_ms:
            calendlyLoadStartedAtRef.current === null
              ? undefined
              : Math.round(
                  performance.now() - calendlyLoadStartedAtRef.current,
                ),
        });
      }
      if (event.data.event === "calendly.event_scheduled") {
        analytics.track("Calendar Booking Completed", {
          funnel: FUNNEL_ID,
          placement: "preloaded_weekly_calendar",
          selected_date: selectedCalendarDate,
        });
      }
    };

    window.addEventListener("message", handleCalendlyMessage);
    return () => window.removeEventListener("message", handleCalendlyMessage);
  }, [open, selectedCalendarDate]);

  useEffect(() => {
    if (step !== "workflow") return;
    analytics.track("Calendly Week Strip Viewed", {
      funnel: FUNNEL_ID,
      placement: "above_workflow_options",
      dates: calendarDates.map((date) => date.value),
      selected_date: selectedCalendarDate,
    });
    analytics.track("Playbook Workflow Choice Viewed", {
      funnel: FUNNEL_ID,
      delivery_window_minutes: 10,
      choices: WORKFLOWS.map((workflow) => workflow.id),
    });
  }, [calendarDates, selectedCalendarDate, step]);

  const openCalendly = () => {
    analytics.track("Calendly Booking Panel Opened", {
      funnel: FUNNEL_ID,
      placement: "compact_booking_card",
      calendar_frame_loaded: calendarFrameLoaded,
      calendar_ready: calendarReady,
      selected_date: selectedCalendarDate,
    });
    setCalendarOpen(true);
  };

  const selectCalendarDate = (date: CalendarDate) => {
    setSelectedCalendarDate(date.value);
    setCalendarFrameLoaded(false);
    setCalendarReady(false);
    calendlyLoadTrackedRef.current = false;
    calendlyReadyTrackedRef.current = false;
    calendlyLoadStartedAtRef.current = performance.now();
    analytics.track("Calendly Week Date Selected", {
      funnel: FUNNEL_ID,
      placement: "weekly_calendar_strip",
      selected_date: date.value,
      selected_day: date.weekday,
    });
  };

  const handleCalendlyLoad = () => {
    setCalendarFrameLoaded(true);
    if (calendlyLoadTrackedRef.current) return;
    calendlyLoadTrackedRef.current = true;
    analytics.track("Calendly Embed Loaded", {
      funnel: FUNNEL_ID,
      placement: "preloaded_weekly_calendar",
      calendly_url: PESTFLOW_CALENDLY_URL,
      selected_date: selectedCalendarDate,
      load_duration_ms:
        calendlyLoadStartedAtRef.current === null
          ? undefined
          : Math.round(performance.now() - calendlyLoadStartedAtRef.current),
    });
  };

  const closePopup = () => {
    analytics.track(EVENTS.LANDING.POPUP_DISMISSED, {
      funnel: FUNNEL_ID,
      step,
    });
    const data = snapshotRef.current;
    if (data.email || data.phone || data.name) {
      pushPartial({ ...data, reason: "dismissed" });
    }
    setOpen(false);
  };

  const submitPlaybook = async () => {
    const nameParts = name.trim().split(/\s+/).filter(Boolean);
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = limitPhoneInput(phone);
    let valid = true;

    if (nameParts.length < 2 || name.trim().length < 3) {
      setNameError("Please enter your full name");
      valid = false;
    } else {
      setNameError("");
    }
    if (!isTenDigitPhone(normalizedPhone)) {
      setPhoneError("Please enter exactly 10 digits");
      valid = false;
    } else {
      setPhoneError("");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }
    if (!valid) return;

    const [firstName, ...lastNameParts] = nameParts;
    const lastName = lastNameParts.join(" ");
    const preferredMetaEventId = beginMetaLeadEvent();
    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          firstName,
          lastName,
          email: normalizedEmail,
          phone: normalizedPhone,
          companyName: "Guide Request",
          technicians: "N/A",
          metaEventId: preferredMetaEventId,
        }),
      });
      if (!response.ok) throw new Error("capture_failed");

      const saved = (await response.json()) as SubmissionResponse;
      if (saved.playbookDelivery?.accepted === false) {
        throw new Error("playbook_delivery_failed");
      }
      const canonicalMetaEventId =
        saved.metaRegistration?.eventId || preferredMetaEventId;

      localStorage.setItem(
        POPUP_DATA_KEY,
        JSON.stringify({
          name: name.trim(),
          firstName,
          lastName,
          phone: normalizedPhone,
          email: normalizedEmail,
          metaEventId: canonicalMetaEventId,
        }),
      );
      localStorage.setItem(POPUP_SUBMITTED_KEY, "true");
      setPhone(normalizedPhone);
      setMetaEventId(canonicalMetaEventId);
      analytics.identify(normalizedEmail, {
        $email: normalizedEmail,
        $name: name.trim(),
        $phone: normalizedPhone,
      });
      analytics.track(EVENTS.LANDING.POPUP_SUBMIT, {
        funnel: FUNNEL_ID,
        fields: ["full_name", "phone", "email"],
        ...campaignFromUrl(),
      });
      pushPartial({
        ...snapshotRef.current,
        firstName,
        lastName,
        phone: normalizedPhone,
        email: normalizedEmail,
        metaEventId: canonicalMetaEventId,
        reason: "guide_submit_workflow_step",
      });
      setStep("workflow");
    } catch {
      setSubmitError("We could not send the playbook yet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const chooseWorkflow = (workflow: WorkflowId) => {
    localStorage.setItem("pestflow_selected_workflow", workflow);
    analytics.track("Playbook Workflow Selected", {
      funnel: FUNNEL_ID,
      workflow,
      destination: "facebook_success_then_apple_app_store",
    });
    pushPartial({
      ...snapshotRef.current,
      workflow,
      metaEventId,
      reason: "workflow_selected",
    });
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
        className="top-[calc(50%+2.25rem)] max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] gap-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] p-0 shadow-2xl sm:max-w-[400px] xl:top-[50%]"
        hideCloseButton
        aria-describedby="playbook-popup-description"
        onEscapeKeyDown={(event) => {
          if (!calendarOpen) return;
          event.preventDefault();
          setCalendarOpen(false);
        }}
      >
        <DialogTitle className="sr-only">
          Get the $3 million Pest Control Playbook
        </DialogTitle>
        <button
          type="button"
          onClick={closePopup}
          className="absolute right-3 top-3 z-30 grid h-8 w-8 place-items-center rounded-full bg-white/5 text-slate-400 transition hover:bg-white/15 hover:text-white active:scale-95"
          aria-label="Close and keep browsing"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === "playbook" ? (
              <motion.div
                key="playbook"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                className="flex flex-col items-center p-4 sm:p-6"
              >
                <img
                  src={logoImage}
                  alt="PestFlow"
                  className="mb-2 h-12 w-auto object-contain sm:h-14"
                />
                <div className="mb-3 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-0.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                    Free Download — $97 Value
                  </span>
                </div>
                <h2 className="mb-1 text-center text-base font-bold leading-tight text-white sm:text-lg">
                  The $3M Pest Control Playbook
                </h2>
                <p
                  id="playbook-popup-description"
                  className="mb-3 text-center text-xs text-slate-400"
                >
                  The exact blueprint top operators use to scale toward $3
                  million—and finally get off the truck for good.
                </p>
                <ul className="mb-4 w-full space-y-1">
                  {[
                    "The route-stacking system that grows revenue without automatically adding another truck",
                    "The local-growth formula that helps you win your city",
                    "How to collect faster and automate payment follow-up",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-slate-300 sm:text-sm"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500 sm:h-4 sm:w-4" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="w-full space-y-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        setNameError("");
                        setSubmitError("");
                      }}
                      placeholder="John Smith"
                      autoComplete="name"
                      className={`h-9 border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 ${
                        nameError ? "border-red-500" : ""
                      }`}
                    />
                    {nameError && (
                      <p className="mt-0.5 text-xs text-red-400">{nameError}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">
                      Phone <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={phone}
                      onChange={(event) => {
                        setPhone(limitPhoneInput(event.target.value));
                        setPhoneError("");
                        setSubmitError("");
                      }}
                      placeholder="(555) 123-4567"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      className={`h-9 border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 ${
                        phoneError ? "border-red-500" : ""
                      }`}
                    />
                    {phoneError && (
                      <p className="mt-0.5 text-xs text-red-400">{phoneError}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setEmailError("");
                        setSubmitError("");
                      }}
                      placeholder="john@example.com"
                      type="email"
                      autoComplete="email"
                      className={`h-9 border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 ${
                        emailError ? "border-red-500" : ""
                      }`}
                    />
                    {emailError && (
                      <p className="mt-0.5 text-xs text-red-400">{emailError}</p>
                    )}
                  </div>
                  {submitError && (
                    <p className="text-center text-xs font-semibold text-red-400">
                      {submitError}
                    </p>
                  )}
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={submitPlaybook}
                    className="mt-1 h-11 w-full rounded-lg bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-500"
                  >
                    {submitting
                      ? "Sending the playbook…"
                      : "Send Me the Free Playbook"}
                    {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                  <p className="pt-0.5 text-center text-xs text-slate-500">
                    No spam—we don’t do that.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="workflow"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                className="p-4 sm:p-5"
              >
                <div className="flex items-start gap-3 pr-8">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.14em] text-emerald-300">
                      Playbook requested
                    </p>
                    <h2 className="mt-1 text-lg font-black leading-tight text-white">
                      Okay—the playbook will be sent in 10 minutes.
                    </h2>
                  </div>
                </div>

                <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_16px_50px_rgba(15,23,42,0.22)]">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                      <CalendarDays className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-black text-slate-950">
                        Choose a setup day
                      </h3>
                      <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                        Pick a date, then see the live Calendly times.
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
                          onClick={() => selectCalendarDate(date)}
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
                    onClick={openCalendly}
                    className="mt-3 h-11 w-full rounded-xl bg-emerald-600 text-sm font-black text-white shadow-lg shadow-emerald-950/15 hover:bg-emerald-500"
                  >
                    See {selectedCalendarDateDetails.weekday} {selectedCalendarDateDetails.day} times
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[10px] leading-4 text-slate-500">
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

                <div className="my-4 h-px bg-white/10" />
                <h3 className="text-base font-black text-white">
                  What do you want to do first?
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Pick where you want to start. PestFlow will open in the Apple
                  App Store.
                </p>

                <div className="mt-4 grid gap-2.5">
                  {WORKFLOWS.map((workflow) => {
                    const Icon = workflow.icon;
                    return (
                      <a
                        key={workflow.id}
                        href={workflowHandoffUrl(workflow.id, metaEventId)}
                        onClick={() => chooseWorkflow(workflow.id)}
                        className="group relative flex min-h-[76px] items-center gap-3 rounded-xl border border-white/10 bg-white/[.045] p-3 pr-10 text-left transition hover:border-emerald-400/30 hover:bg-emerald-400/[.07] active:scale-[.99]"
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
                        <ArrowRight className="absolute right-3 h-4 w-4 text-emerald-300 transition group-hover:translate-x-0.5" />
                      </a>
                    );
                  })}
                </div>
                <p className="mt-4 text-center text-[10px] leading-4 text-slate-500">
                  No login yet. Your contact information is already saved.
                </p>

              </motion.div>
            )}
          </AnimatePresence>
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
                {selectedCalendarDateDetails.fullLabel} times
              </h3>
              <p className="mt-0.5 text-[10px] text-slate-400">
                Choose a live time, then confirm your details.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCalendarOpen(false)}
            className="absolute right-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/5 text-slate-400 transition hover:bg-white/15 hover:text-white"
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
                    Loading {selectedCalendarDateDetails.weekday} times…
                  </p>
                </div>
              </div>
            )}
            <iframe
              src={calendlyEmbedUrl("", "", selectedCalendarDate)}
              title="Book a PestFlow setup call"
              className={`h-full min-h-[420px] w-full bg-white transition-opacity duration-150 ${
                calendarFrameLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="eager"
              tabIndex={calendarOpen ? 0 : -1}
              onLoad={handleCalendlyLoad}
            />
          </div>
          <a
            href={calendlyEmbedUrl(name, email, selectedCalendarDate)}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              analytics.track("Calendly Direct Link Opened", {
                funnel: FUNNEL_ID,
                placement: "booking_panel_fallback",
                selected_date: selectedCalendarDate,
              })
            }
            className="border-t border-white/10 px-4 py-2.5 text-center text-[11px] font-semibold text-slate-300 hover:text-white"
          >
            Calendar not showing? Open {selectedCalendarDateDetails.weekday} in a new tab.
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
