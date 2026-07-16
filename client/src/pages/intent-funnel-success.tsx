import { useEffect, useMemo } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Download,
  ExternalLink,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";
import {
  PESTFLOW_APP_STORE_URL,
  PESTFLOW_CALENDLY_URL,
  PESTFLOW_PWA_APP_URL,
} from "@/lib/intent-funnel";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

type Device = "ios" | "android" | "desktop";

function detectedDevice(): Device {
  if (typeof window === "undefined") return "desktop";
  const requested = new URLSearchParams(window.location.search).get("device");
  if (requested === "ios" || requested === "android" || requested === "desktop") return requested;
  const userAgent = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (/android/.test(userAgent)) return "android";
  return "desktop";
}

export default function IntentFunnelSuccess() {
  const device = useMemo(detectedDevice, []);

  useEffect(() => {
    analytics.track("Intent Activation Success Viewed", {
      funnel: "intent_first",
      device,
      surface: "staging_preview",
    });
  }, [device]);

  const trackContinue = (action: string) => {
    analytics.track("Post Activation Choice", {
      funnel: "intent_first",
      device,
      action,
    });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#07101c] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -right-32 -top-40 h-[32rem] w-[32rem] rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-48 -left-40 h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <a href="/?funnel=intent-first&popup-check=1" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white p-1.5">
              <img src={logoImage} alt="PestFlow" className="h-full w-full object-contain" />
            </span>
            <span>
              <span className="block text-sm font-black">PestFlow</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Staging preview</span>
            </span>
          </a>
          <a href="/?funnel=intent-first&popup-check=1" className="text-sm font-semibold text-slate-400 transition hover:text-white">
            Back to landing
          </a>
        </header>

        <section className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 py-10 lg:grid-cols-[1.04fr_.96fr] lg:gap-12">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
              <CheckCircle2 className="h-4 w-4" /> Setup saved
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
              Your PestFlow workspace is ready.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Your details are already saved inside PestFlow. Choose how you want to keep going—there’s no PDF to download and no form to fill out again.
            </p>

            <div className="mt-7 flex items-center gap-3 text-xs font-semibold text-slate-400 sm:text-sm">
              <span className="flex items-center gap-2 text-emerald-300"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400 text-xs font-black text-emerald-950">1</span> Landing</span>
              <span className="h-px flex-1 bg-emerald-400/40" />
              <span className="flex items-center gap-2 text-emerald-300"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400 text-xs font-black text-emerald-950">2</span> Guided PWA</span>
              <span className="h-px flex-1 bg-emerald-400/40" />
              <span className="flex items-center gap-2 text-white"><span className="grid h-6 w-6 place-items-center rounded-full border border-emerald-300 bg-emerald-400/15 text-xs font-black text-emerald-200">3</span> Keep going</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur sm:p-7">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400 text-emerald-950">
                {device === "desktop" ? <MonitorSmartphone className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Best next step</p>
                <h2 className="mt-1 text-xl font-black text-white">
                  {device === "ios" && "Keep PestFlow on your iPhone"}
                  {device === "android" && "Keep PestFlow on your Android"}
                  {device === "desktop" && "Continue in the web app"}
                </h2>
              </div>
            </div>

            {device === "ios" && (
              <>
                <p className="mt-4 text-sm leading-6 text-slate-300">Install the iPhone app for fast access in the field, or continue in the browser.</p>
                <Button asChild className="mt-5 h-13 w-full bg-emerald-400 font-black text-emerald-950 hover:bg-emerald-300">
                  <a href={PESTFLOW_APP_STORE_URL} target="_blank" rel="noreferrer" onClick={() => trackContinue("ios_app_store")}>
                    <Download className="mr-2 h-5 w-5" /> Get the iPhone app
                  </a>
                </Button>
              </>
            )}

            {device === "android" && (
              <>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Continue in Chrome, then use <strong className="text-white">Add to Home screen</strong> from the browser menu for app-like access.
                </p>
                <Button asChild className="mt-5 h-13 w-full bg-emerald-400 font-black text-emerald-950 hover:bg-emerald-300">
                  <a href={PESTFLOW_PWA_APP_URL} onClick={() => trackContinue("android_pwa")}>
                    <Smartphone className="mr-2 h-5 w-5" /> Open PestFlow in Chrome
                  </a>
                </Button>
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-slate-950/45 p-3 text-xs leading-5 text-slate-400">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" /> This prototype does not show a Google Play button until a verified PestFlow listing is available.
                </p>
              </>
            )}

            {device === "desktop" && (
              <>
                <p className="mt-4 text-sm leading-6 text-slate-300">Go straight to your workspace and continue setting up your first workflow.</p>
                <Button asChild className="mt-5 h-13 w-full bg-emerald-400 font-black text-emerald-950 hover:bg-emerald-300">
                  <a href={PESTFLOW_PWA_APP_URL} onClick={() => trackContinue("web_app")}>
                    Open PestFlow web app <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </>
            )}

            {device === "ios" && (
              <Button asChild variant="outline" className="mt-3 h-12 w-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <a href={PESTFLOW_PWA_APP_URL} onClick={() => trackContinue("ios_browser")}>
                  Continue in browser <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}

            <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
              <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
            </div>

            <Button asChild variant="outline" className="h-12 w-full border-violet-300/25 bg-violet-400/10 text-violet-100 hover:bg-violet-400/20 hover:text-white">
              <a href={PESTFLOW_CALENDLY_URL} target="_blank" rel="noreferrer" onClick={() => trackContinue("setup_call")}>
                <CalendarDays className="mr-2 h-5 w-5" /> Book a 15-minute setup call
              </a>
            </Button>
            <p className="mt-4 text-center text-xs text-slate-500">You can change this choice later from PestFlow settings.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
