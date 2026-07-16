import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  MonitorPlay,
  Rocket,
  Sparkles,
  X,
} from "lucide-react";
import { analytics } from "@/lib/analytics";
import {
  PESTFLOW_CALENDLY_URL,
  PESTFLOW_PWA_ONBOARD_URL,
} from "@/lib/intent-funnel";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

type IntentStep = "choice" | "video" | "handoff";
type IntentChoice = "start" | "watch" | "call";

function initialStepFromUrl(): IntentStep {
  if (typeof window === "undefined") return "choice";
  const requested = new URLSearchParams(window.location.search).get("intent_step");
  return requested === "video" || requested === "handoff" ? requested : "choice";
}

export function IntentFirstPopup() {
  const forced =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("popup-check");
  const initialStep = useMemo(initialStepFromUrl, []);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<IntentStep>(initialStep);

  useEffect(() => {
    if (forced) {
      setOpen(true);
      analytics.track("Intent Prompt Viewed", {
        trigger: "forced",
        funnel: "intent_first",
        step: initialStep,
      });
      return;
    }

    const seenKey = "pestflow_intent_first_seen";
    if (sessionStorage.getItem(seenKey)) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(seenKey, "true");
      analytics.track("Intent Prompt Viewed", {
        trigger: "engaged_timer",
        delay_ms: 8000,
        funnel: "intent_first",
      });
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [forced, initialStep]);

  const close = () => {
    analytics.track("Intent Prompt Dismissed", {
      funnel: "intent_first",
      step,
    });
    setOpen(false);
  };

  const choose = (intent: IntentChoice) => {
    analytics.track("Intent Selected", { funnel: "intent_first", intent });

    if (intent === "call") {
      analytics.track("Calendar Opened", {
        funnel: "intent_first",
        surface: "intent_prompt",
      });
      window.open(PESTFLOW_CALENDLY_URL, "_blank", "noopener,noreferrer");
      return;
    }

    setStep(intent === "watch" ? "video" : "handoff");
  };

  const openPwa = (surface: string) => {
    analytics.track("PWA Handoff Clicked", {
      funnel: "intent_first",
      surface,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && open) close();
        else setOpen(nextOpen);
      }}
    >
      <DialogContent
        className="max-h-[min(92vh,calc(100dvh-1rem))] w-[calc(100vw-1.25rem)] max-w-[calc(100vw-1.25rem)] overflow-y-auto border-slate-700 bg-[#08111f] p-0 text-white shadow-2xl sm:max-w-[760px]"
        aria-describedby="intent-first-description"
        hideCloseButton
      >
        <DialogTitle className="sr-only">PestFlow intent-first funnel</DialogTitle>
        <button
          type="button"
          aria-label="Close intent prompt"
          onClick={close}
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-slate-950/70 text-slate-300 transition hover:border-white/30 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative overflow-hidden rounded-lg">
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-36 -left-28 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative border-b border-white/10 px-5 py-5 sm:px-8">
            <div className="flex items-center gap-3 pr-12">
              <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white p-1.5">
                <img src={logoImage} alt="PestFlow" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide text-white">PestFlow</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Staging · intent-first funnel
                </p>
              </div>
            </div>
          </div>

          {step === "choice" && (
            <div className="relative px-5 pb-6 pt-7 sm:px-8 sm:pb-8">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  <Sparkles className="h-3.5 w-3.5" /> Choose your shortest path
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white sm:text-4xl">
                  What would you like to do first?
                </h2>
                <p id="intent-first-description" className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Start inside PestFlow, watch the two-minute walkthrough, or get help setting it up. You can switch paths at any time.
                </p>
              </div>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={() => choose("start")}
                  className="group flex w-full items-start gap-4 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-400/15 sm:p-5"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20">
                    <Rocket className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-white sm:text-lg">Start setting up PestFlow</span>
                      <span className="rounded-full bg-emerald-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-950">Recommended</span>
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-slate-300">
                      Open a guided workspace in your browser and save your details inside the app—no PDF gate.
                    </span>
                  </span>
                  <ArrowRight className="mt-3 h-5 w-5 shrink-0 text-emerald-300 transition group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={() => choose("watch")}
                  className="group flex w-full items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/[0.07] sm:p-5"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-400/15 text-cyan-200">
                    <MonitorPlay className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-base font-bold text-white sm:text-lg">Watch the product walkthrough</span>
                    <span className="mt-1 block text-sm leading-5 text-slate-300">
                      See scheduling, routing, invoicing, and field work before you start.
                    </span>
                  </span>
                  <ArrowRight className="mt-3 h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-cyan-200" />
                </button>

                <button
                  type="button"
                  onClick={() => choose("call")}
                  className="group flex w-full items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-300/50 hover:bg-white/[0.07] sm:p-5"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-400/15 text-violet-200">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-base font-bold text-white sm:text-lg">Book a setup call</span>
                    <span className="mt-1 block text-sm leading-5 text-slate-300">
                      Pick a time and we’ll help configure your first workflow with you.
                    </span>
                  </span>
                  <ExternalLink className="mt-3 h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-violet-200" />
                </button>
              </div>

              <p className="mt-5 text-center text-xs text-slate-500">
                Close this window to keep browsing the landing page.
              </p>
            </div>
          )}

          {step === "video" && (
            <div className="relative px-5 pb-6 pt-6 sm:px-8 sm:pb-8">
              <button
                type="button"
                onClick={() => setStep("choice")}
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Back to options
              </button>
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">See PestFlow in two minutes</h2>
              <p id="intent-first-description" className="mt-2 text-sm text-slate-300">
                The walkthrough starts muted. Nothing launches until someone chooses to watch it.
              </p>
              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl">
                <div className="relative aspect-video w-full">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/TB4__rmaNpE?autoplay=1&mute=1&rel=0"
                    title="PestFlow product walkthrough"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                    onLoad={() => analytics.track("Intent Video Started", { funnel: "intent_first" })}
                  />
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-12 flex-1 bg-emerald-400 font-bold text-emerald-950 hover:bg-emerald-300">
                  <a href={PESTFLOW_PWA_ONBOARD_URL} onClick={() => openPwa("video_step")}>
                    Open guided PestFlow <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-12 border-white/15 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white">
                  <a
                    href={PESTFLOW_CALENDLY_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => analytics.track("Calendar Opened", { funnel: "intent_first", surface: "video_step" })}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" /> Book setup call
                  </a>
                </Button>
              </div>
            </div>
          )}

          {step === "handoff" && (
            <div className="relative px-5 pb-6 pt-7 sm:px-8 sm:pb-8">
              <button
                type="button"
                onClick={() => setStep("choice")}
                className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Back to options
              </button>
              <div className="grid gap-6 sm:grid-cols-[1.05fr_.95fr] sm:items-center">
                <div>
                  <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400 text-emerald-950 shadow-xl shadow-emerald-500/20">
                    <Rocket className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-white sm:text-4xl">Your guided workspace is ready</h2>
                  <p id="intent-first-description" className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                    Try PestFlow in the browser first. Your contact and business details stay inside the setup flow instead of being traded for a download.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">What happens next</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-200">
                    {[
                      "Open the guided PestFlow PWA",
                      "Save your setup and contact details there",
                      "Choose self-serve, app install, or a setup call",
                    ].map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                          <Check className="h-3 w-3" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button asChild className="mt-7 h-14 w-full bg-emerald-400 text-base font-black text-emerald-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-300">
                <a href={PESTFLOW_PWA_ONBOARD_URL} onClick={() => openPwa("handoff_step")}>
                  Start inside PestFlow <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <div className="mt-4 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row sm:gap-5">
                <a
                  href="/experiments/intent-first/success"
                  className="font-semibold text-cyan-200 underline decoration-cyan-200/30 underline-offset-4 hover:text-cyan-100"
                >
                  Preview the post-setup screen
                </a>
                <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />
                <a
                  href={PESTFLOW_CALENDLY_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-slate-300 hover:text-white"
                  onClick={() => analytics.track("Calendar Opened", { funnel: "intent_first", surface: "handoff_step" })}
                >
                  <Clock3 className="h-4 w-4" /> Book a setup call instead
                </a>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
