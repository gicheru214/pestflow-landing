import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowRight,
  CalendarDays,
  Rocket,
  Smartphone,
  X,
} from "lucide-react";
import { analytics } from "@/lib/analytics";
import {
  PESTFLOW_APP_STORE_URL,
  PESTFLOW_CALENDLY_URL,
  PESTFLOW_PWA_APP_URL,
} from "@/lib/intent-funnel";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

type Device = "ios" | "android" | "desktop";

const FIRST_VISIT_KEY = "pestflow_first_visit_start_prompt_v1";

function detectedDevice(): Device {
  if (typeof window === "undefined") return "desktop";

  const requested = new URLSearchParams(window.location.search).get("device");
  if (requested === "ios" || requested === "android" || requested === "desktop") {
    return requested;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isTouchMac =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  if (/iphone|ipad|ipod/.test(userAgent) || isTouchMac) return "ios";
  if (/android/.test(userAgent)) return "android";
  return "desktop";
}

function rememberFirstVisitPrompt() {
  try {
    window.localStorage.setItem(FIRST_VISIT_KEY, new Date().toISOString());
  } catch {
    // Storage can be unavailable in strict/private browser modes.
  }
}

function hasSeenFirstVisitPrompt() {
  try {
    return Boolean(window.localStorage.getItem(FIRST_VISIT_KEY));
  } catch {
    return false;
  }
}

export function IntentFirstPopup() {
  const forced =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("popup-check");
  const device = useMemo(detectedDevice, []);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (forced) {
      setOpen(true);
      analytics.track("First Visit Start Prompt Viewed", {
        trigger: "forced_preview",
        funnel: "first_visit_start",
        detected_device: device,
      });
      return;
    }

    if (hasSeenFirstVisitPrompt()) return;

    const timer = window.setTimeout(() => {
      rememberFirstVisitPrompt();
      setOpen(true);
      analytics.track("First Visit Start Prompt Viewed", {
        trigger: "first_visit_timer",
        delay_ms: 2500,
        funnel: "first_visit_start",
        detected_device: device,
      });
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [device, forced]);

  const close = () => {
    rememberFirstVisitPrompt();
    analytics.track("First Visit Start Prompt Dismissed", {
      funnel: "first_visit_start",
      detected_device: device,
    });
    setOpen(false);
  };

  const startUsingPestFlow = () => {
    const destination =
      device === "ios" ? PESTFLOW_APP_STORE_URL : PESTFLOW_PWA_APP_URL;

    analytics.track("First Visit Start Selected", {
      funnel: "first_visit_start",
      detected_device: device,
      destination: device === "ios" ? "ios_app_store" : "web_app",
    });
    window.location.href = destination;
  };

  const bookWalkthrough = () => {
    analytics.track("First Visit Walkthrough Selected", {
      funnel: "first_visit_start",
      detected_device: device,
    });
    window.location.href = PESTFLOW_CALENDLY_URL;
  };

  const deviceLabel =
    device === "ios"
      ? "iPhone detected"
      : device === "android"
        ? "Android detected"
        : "Works on phone or desktop";

  const startDescription =
    device === "ios"
      ? "Open the iPhone app and start at your own pace. Setup help stays available if you want it."
      : "Open PestFlow and start at your own pace. Setup help stays available if you want it.";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && open) close();
        else setOpen(nextOpen);
      }}
    >
      <DialogContent
        className="bottom-2 left-1/2 top-auto max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[430px] -translate-x-1/2 translate-y-0 gap-0 overflow-y-auto rounded-[28px] border border-white/10 bg-[#08111f] p-0 text-white shadow-[0_28px_90px_rgba(0,0,0,.55)] sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
        aria-describedby="first-visit-start-description"
        hideCloseButton
      >
        <DialogTitle className="sr-only">
          Choose how to get started with PestFlow
        </DialogTitle>

        <div className="relative overflow-hidden rounded-[28px]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

          <button
            type="button"
            aria-label="Close and keep browsing"
            onClick={close}
            className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-slate-950/75 text-slate-200 shadow-lg transition active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative px-5 pb-5 pt-5">
            <div className="flex items-center gap-3 pr-14">
              <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg">
                <img
                  src={logoImage}
                  alt="PestFlow"
                  className="h-full w-full object-contain"
                />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-black tracking-wide text-white">
                  PestFlow
                </p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.17em] text-emerald-300">
                  First time here?
                </p>
              </div>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-bold text-emerald-200">
              <Smartphone className="h-3.5 w-3.5" />
              {deviceLabel}
            </div>

            <h2 className="mt-4 max-w-sm text-[29px] font-black leading-[1.05] tracking-[-0.035em] text-white">
              Ready to start—or want us to show you around?
            </h2>
            <p
              id="first-visit-start-description"
              className="mt-3 text-sm leading-6 text-slate-300"
            >
              Choose the path that feels right. You can switch or ask for help
              at any time.
            </p>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={startUsingPestFlow}
                className="group flex min-h-[108px] w-full items-center gap-4 rounded-[22px] border border-emerald-300/45 bg-emerald-400/12 p-4 text-left shadow-[0_16px_36px_rgba(16,185,129,.10)] transition active:scale-[.985]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/20">
                  <Rocket className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-black text-white">
                    Start using PestFlow
                  </span>
                  <span className="mt-1 block text-xs leading-[1.55] text-slate-300">
                    {startDescription}
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-emerald-300 transition group-active:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={bookWalkthrough}
                className="group flex min-h-[108px] w-full items-center gap-4 rounded-[22px] border border-white/12 bg-white/[0.055] p-4 text-left transition active:scale-[.985]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-400/15 text-violet-200">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-black text-white">
                    Book a live walkthrough
                  </span>
                  <span className="mt-1 block text-xs leading-[1.55] text-slate-300">
                    Pick a time now. We’ll walk through your setup and help get
                    your account activated.
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-violet-200 transition group-active:translate-x-1" />
              </button>
            </div>

            <p className="mt-4 text-center text-[11px] leading-5 text-slate-500">
              Not ready? Tap × and keep looking around.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
