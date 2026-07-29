import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  MapPinned,
  Radio,
  RefreshCcw,
  Rocket,
  X,
} from "lucide-react";
import { analytics, EVENTS } from "@/lib/analytics";
import { PESTFLOW_CALENDLY_URL } from "@/lib/intent-funnel";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

type PlaybookVariant =
  | "playbook-jtbd"
  | "playbook-pwa"
  | "playbook-calendar";
type PopupStep = "playbook" | "activation";
type WorkflowId = "routes" | "billing" | "field" | "switching";

const APP_ENTRY_URL = "https://app.pestflow.org/mobile/onboard/feature";
const POPUP_SEEN_KEY = "pestflow_popup_seen";
const POPUP_SUBMITTED_KEY = "pestflow_popup_submitted";

const WORKFLOWS: Record<
  WorkflowId,
  {
    label: string;
    description: string;
    icon: typeof MapPinned;
  }
> = {
  routes: {
    label: "Build and adjust routes",
    description: "See recurring stops, route gaps, and technician assignments.",
    icon: MapPinned,
  },
  billing: {
    label: "Get billing under control",
    description: "Connect completed work, invoices, cards, and payment follow-up.",
    icon: CreditCard,
  },
  field: {
    label: "See what is happening in the field",
    description: "Keep job status, notes, photos, and customer updates together.",
    icon: Radio,
  },
  switching: {
    label: "Plan a safer software switch",
    description: "Test one real workflow before moving the whole operation.",
    icon: RefreshCcw,
  },
};

function playbookVariantFromUrl(): PlaybookVariant {
  if (typeof window === "undefined") return "playbook-jtbd";
  const requested = new URLSearchParams(window.location.search).get("funnel");
  if (
    requested === "playbook-jtbd" ||
    requested === "playbook-pwa" ||
    requested === "playbook-calendar"
  ) {
    return requested;
  }
  return "playbook-jtbd";
}

function initialStepFromUrl(): PopupStep {
  if (typeof window === "undefined") return "playbook";
  return new URLSearchParams(window.location.search).get("preview_step") ===
    "activation"
    ? "activation"
    : "playbook";
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
    // A partial snapshot should never interrupt the visitor's next step.
  }
}

function appEntryUrl(
  workflow: WorkflowId | null,
  fields: {
    name: string;
    email: string;
    phone: string;
  },
  variant: PlaybookVariant,
) {
  const url = new URL(APP_ENTRY_URL);
  const [firstName, ...lastNameParts] = fields.name.trim().split(/\s+/);
  if (firstName) url.searchParams.set("firstName", firstName);
  if (lastNameParts.length) {
    url.searchParams.set("lastName", lastNameParts.join(" "));
  }
  if (fields.email) url.searchParams.set("email", fields.email.trim());
  if (fields.phone) url.searchParams.set("phone", fields.phone.trim());
  if (workflow) url.searchParams.set("intent", workflow);
  url.searchParams.set("source", "playbook_activation_popup");
  url.searchParams.set("funnel_variant", variant);
  return url.toString();
}

function calendlyEmbedUrl(name: string, email: string) {
  const url = new URL(PESTFLOW_CALENDLY_URL);
  url.searchParams.set("hide_gdpr_banner", "1");
  url.searchParams.set("background_color", "0b1220");
  url.searchParams.set("text_color", "e2e8f0");
  url.searchParams.set("primary_color", "22c55e");
  if (name.trim()) url.searchParams.set("name", name.trim());
  if (email.trim()) url.searchParams.set("email", email.trim());
  return url.toString();
}

function CalendarEmbed({
  name,
  email,
  variant,
}: {
  name: string;
  email: string;
  variant: PlaybookVariant;
}) {
  const trackedLoad = useRef(false);

  return (
    <section className="mt-5">
      <div className="mb-3 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-400/15 text-violet-200">
          <CalendarDays className="h-4.5 w-4.5" />
        </span>
        <div>
          <h3 className="text-sm font-black text-white">
            Want help getting set up?
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Pick a time below. We’ll work from the information you already
            entered.
          </p>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white">
        <iframe
          src={calendlyEmbedUrl(name, email)}
          title="Book a PestFlow setup call"
          className="h-[630px] w-full bg-white"
          onLoad={() => {
            if (trackedLoad.current) return;
            trackedLoad.current = true;
            analytics.track("Calendly Embed Loaded", {
              source: "playbook_activation_popup",
              funnel_variant: variant,
              calendly_url: PESTFLOW_CALENDLY_URL,
            });
          }}
        />
      </div>
    </section>
  );
}

function WorkflowChoices({
  name,
  email,
  phone,
  variant,
}: {
  name: string;
  email: string;
  phone: string;
  variant: PlaybookVariant;
}) {
  return (
    <section className="mt-5">
      <div className="mb-3">
        <h3 className="text-base font-black text-white">
          What do you need to get done first?
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Choose one and we’ll take you directly into that PestFlow workflow.
          You can explore before creating the account.
        </p>
      </div>
      <div className="grid gap-2.5">
        {(
          Object.entries(WORKFLOWS) as Array<
            [WorkflowId, (typeof WORKFLOWS)[WorkflowId]]
          >
        ).map(([id, workflow]) => {
          const Icon = workflow.icon;
          return (
            <a
              key={id}
              href={appEntryUrl(id, { name, email, phone }, variant)}
              onClick={() =>
                analytics.track("Playbook Activation Need Selected", {
                  workflow: id,
                  funnel_variant: variant,
                  destination: "pestflow_app",
                })
              }
              className="group flex min-h-[76px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3.5 text-left transition active:scale-[.985]"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-white">
                  {workflow.label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">
                  {workflow.description}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-emerald-300 transition group-active:translate-x-1" />
            </a>
          );
        })}
      </div>
    </section>
  );
}

export function PlaybookActivationPopup() {
  const variant = useMemo(playbookVariantFromUrl, []);
  const previewStep = useMemo(initialStepFromUrl, []);
  const forced =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("popup-check");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<PopupStep>(previewStep);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const snapshotRef = useRef<Record<string, unknown>>({});

  useEffect(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    snapshotRef.current = {
      name,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" "),
      phone,
      email,
      step,
      funnelVariant: variant,
    };
  }, [email, name, phone, step, variant]);

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

  useEffect(() => {
    const openPopup = (trigger: string) => {
      setOpen(true);
      analytics.track(EVENTS.LANDING.POPUP_SHOWN, {
        trigger,
        funnel: "playbook_activation",
        funnel_variant: variant,
        step: previewStep,
      });
    };

    if (forced) {
      openPopup("forced_preview");
      return;
    }
    if (localStorage.getItem(POPUP_SUBMITTED_KEY)) return;
    if (localStorage.getItem(POPUP_SEEN_KEY)) return;

    const timer = window.setTimeout(() => {
      localStorage.setItem(POPUP_SEEN_KEY, "true");
      openPopup("first_visit_timer");
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [forced, previewStep, variant]);

  useEffect(() => {
    if (step !== "activation") return;

    analytics.track("Playbook Delivery Confirmation Viewed", {
      funnel: "playbook_activation",
      funnel_variant: variant,
      delivery_window_minutes: 10,
    });

    const handleCalendlyMessage = (event: MessageEvent) => {
      if (
        event.origin !== "https://calendly.com" ||
        typeof event.data?.event !== "string" ||
        !event.data.event.startsWith("calendly.")
      ) {
        return;
      }
      analytics.track("Calendly Embed Event", {
        source: "playbook_activation_popup",
        funnel_variant: variant,
        calendly_event: event.data.event,
      });
    };

    window.addEventListener("message", handleCalendlyMessage);
    return () => window.removeEventListener("message", handleCalendlyMessage);
  }, [step, variant]);

  const closePopup = () => {
    analytics.track(EVENTS.LANDING.POPUP_DISMISSED, {
      funnel: "playbook_activation",
      funnel_variant: variant,
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
    const phoneDigits = phone.replace(/\D/g, "");
    let valid = true;

    if (nameParts.length < 2 || name.trim().length < 3) {
      setNameError("Please enter your full name");
      valid = false;
    } else {
      setNameError("");
    }
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setPhoneError("Please enter a valid phone number");
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
    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          firstName,
          lastName: lastNameParts.join(" "),
          email: normalizedEmail,
          phone: phone.trim(),
          companyName: "Guide Request",
          technicians: "N/A",
        }),
      });
      if (!response.ok) throw new Error("capture_failed");

      const savedPopupData = {
        name: name.trim(),
        firstName,
        lastName: lastNameParts.join(" "),
        phone: phone.trim(),
        email: normalizedEmail,
      };
      localStorage.setItem(
        "pestflow_popup_data",
        JSON.stringify(savedPopupData),
      );
      localStorage.setItem(POPUP_SUBMITTED_KEY, "true");
      analytics.identify(normalizedEmail, {
        $email: normalizedEmail,
        $name: name.trim(),
        $phone: phone.trim(),
      });
      analytics.track(EVENTS.LANDING.POPUP_SUBMIT, {
        funnel: "playbook_activation",
        funnel_variant: variant,
        fields: ["full_name", "phone", "email"],
        ...campaignFromUrl(),
      });
      pushPartial({
        ...snapshotRef.current,
        reason: "guide_submit_activation_step",
      });
      setStep("activation");
    } catch {
      setSubmitError(
        "We could not save your request yet. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openGeneralApp = () => {
    analytics.track("Playbook PWA Opened", {
      funnel: "playbook_activation",
      funnel_variant: variant,
      destination: "pestflow_app",
    });
    window.location.href = appEntryUrl(
      null,
      { name, email, phone },
      variant,
    );
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
        className="bottom-2 left-1/2 top-auto z-[90] max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[430px] -translate-x-1/2 translate-y-0 gap-0 overflow-y-auto rounded-[28px] border border-white/10 bg-[#08111f] p-0 text-white shadow-[0_28px_90px_rgba(0,0,0,.55)] sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
        hideCloseButton
        aria-describedby="playbook-popup-description"
      >
        <DialogTitle className="sr-only">
          Get the PestFlow playbook and choose how to start
        </DialogTitle>
        <button
          type="button"
          onClick={closePopup}
          className="absolute right-4 top-4 z-30 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-slate-950/80 text-slate-200 shadow-lg transition active:scale-95"
          aria-label="Close and keep browsing"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative overflow-hidden rounded-[28px]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
          <AnimatePresence mode="wait">
            {step === "playbook" ? (
              <motion.div
                key="playbook"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                className="relative p-5 sm:p-6"
              >
                <div className="flex items-center gap-3 pr-14">
                  <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg">
                    <img
                      src={logoImage}
                      alt="PestFlow"
                      className="h-full w-full object-contain"
                    />
                  </span>
                  <div>
                    <p className="text-sm font-black tracking-wide text-white">
                      PestFlow
                    </p>
                    <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
                      Free playbook
                    </p>
                  </div>
                </div>

                <div className="mt-5 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-emerald-300">
                  Free download · $97 value
                </div>
                <h2 className="mt-3 text-[28px] font-black leading-[1.02] tracking-[-.04em] text-white">
                  The $1–3M Pest Control Playbook
                </h2>
                <p
                  id="playbook-popup-description"
                  className="mt-3 text-sm leading-6 text-slate-300"
                >
                  The practical blueprint for growing from $1 million to $3
                  million without losing control of routes, billing, or the
                  field.
                </p>

                <ul className="mt-4 space-y-2">
                  {[
                    "Stack routes without automatically adding another truck",
                    "Create a repeatable local-growth and review system",
                    "Collect faster and automate the follow-up owners hate",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs leading-5 text-slate-300"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">
                      Full name
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
                      className={`h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 ${
                        nameError ? "border-red-500" : ""
                      }`}
                    />
                    {nameError && (
                      <p className="mt-1 text-xs font-semibold text-red-400">
                        {nameError}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">
                      Phone number
                    </label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(event) => {
                        setPhone(event.target.value);
                        setPhoneError("");
                        setSubmitError("");
                      }}
                      placeholder="(555) 123-4567"
                      autoComplete="tel"
                      className={`h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 ${
                        phoneError ? "border-red-500" : ""
                      }`}
                    />
                    {phoneError && (
                      <p className="mt-1 text-xs font-semibold text-red-400">
                        {phoneError}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setEmailError("");
                        setSubmitError("");
                      }}
                      placeholder="john@example.com"
                      autoComplete="email"
                      className={`h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 ${
                        emailError ? "border-red-500" : ""
                      }`}
                    />
                    {emailError && (
                      <p className="mt-1 text-xs font-semibold text-red-400">
                        {emailError}
                      </p>
                    )}
                  </div>
                </div>

                {submitError && (
                  <p className="mt-3 text-xs font-semibold text-red-400">
                    {submitError}
                  </p>
                )}
                <Button
                  type="button"
                  onClick={submitPlaybook}
                  disabled={submitting}
                  className="mt-5 h-12 w-full bg-emerald-500 text-sm font-black text-emerald-950 hover:bg-emerald-400"
                >
                  {submitting ? "Saving your request…" : "Send me the playbook"}
                  {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                <p className="mt-3 text-center text-[11px] text-slate-500">
                  No spam—we don’t do that.
                </p>
                <a
                  href="https://app.pestflow.org/login"
                  className="mt-4 block border-t border-white/10 pt-4 text-center text-[11px] font-semibold text-slate-400"
                >
                  Already use PestFlow? Log in
                </a>
              </motion.div>
            ) : (
              <motion.div
                key="activation"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                className="relative p-5 sm:p-6"
              >
                <div className="flex items-center gap-3 pr-14">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-400 text-emerald-950">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.15em] text-emerald-300">
                      Request saved
                    </p>
                    <h2 className="mt-1 text-xl font-black leading-tight text-white">
                      Okay—the playbook will be sent in 10 minutes.
                    </h2>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  While it’s on the way, choose whether you want to explore
                  PestFlow yourself or get help setting it up.
                </p>

                {variant === "playbook-jtbd" && (
                  <>
                    <WorkflowChoices
                      name={name}
                      email={email}
                      phone={phone}
                      variant={variant}
                    />
                    <CalendarEmbed
                      name={name}
                      email={email}
                      variant={variant}
                    />
                  </>
                )}

                {variant === "playbook-pwa" && (
                  <>
                    <section className="mt-5 rounded-2xl border border-emerald-300/35 bg-emerald-400/10 p-4">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-400 text-emerald-950">
                        <Rocket className="h-5 w-5" />
                      </span>
                      <h3 className="mt-3 text-lg font-black text-white">
                        Start inside PestFlow
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-300">
                        Explore in your browser first. PestFlow will ask you to
                        finish account setup when you use or save a live
                        workflow.
                      </p>
                      <Button
                        type="button"
                        onClick={openGeneralApp}
                        className="mt-4 h-12 w-full bg-emerald-400 text-sm font-black text-emerald-950 hover:bg-emerald-300"
                      >
                        Open PestFlow <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <p className="mt-2 text-center text-[10px] leading-4 text-slate-500">
                        The mobile-app option comes after you have seen the
                        workflow.
                      </p>
                    </section>
                    <CalendarEmbed
                      name={name}
                      email={email}
                      variant={variant}
                    />
                  </>
                )}

                {variant === "playbook-calendar" && (
                  <>
                    <CalendarEmbed
                      name={name}
                      email={email}
                      variant={variant}
                    />
                    <div className="mt-6 flex items-center gap-3">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-[10px] font-black uppercase tracking-[.15em] text-slate-500">
                        Or start yourself
                      </span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <WorkflowChoices
                      name={name}
                      email={email}
                      phone={phone}
                      variant={variant}
                    />
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
