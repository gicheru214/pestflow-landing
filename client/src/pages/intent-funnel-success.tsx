import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analytics } from "@/lib/analytics";
import {
  PESTFLOW_APP_STORE_URL,
  PESTFLOW_CALENDLY_URL,
  PESTFLOW_PWA_APP_URL,
} from "@/lib/intent-funnel";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

type Device = "ios" | "android" | "desktop";
type Stage = "contact" | "complete";

const WORKFLOW_LABELS: Record<string, string> = {
  routes: "the route board",
  billing: "job-to-payment",
  field: "field visibility",
  switching: "a safe switch plan",
  start: "your first workflow",
  video: "your first workflow",
};

function detectedDevice(): Device {
  if (typeof window === "undefined") return "desktop";
  const requested = new URLSearchParams(window.location.search).get("device");
  if (requested === "ios" || requested === "android" || requested === "desktop") return requested;
  const userAgent = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (/android/.test(userAgent)) return "android";
  return "desktop";
}

function initialStage(): Stage {
  if (typeof window === "undefined") return "contact";
  return new URLSearchParams(window.location.search).get("preview") === "complete"
    ? "complete"
    : "contact";
}

export default function IntentFunnelSuccess() {
  const device = useMemo(detectedDevice, []);
  const intent = useMemo(() => {
    if (typeof window === "undefined") return "start";
    return new URLSearchParams(window.location.search).get("intent") || "start";
  }, []);
  const [stage, setStage] = useState<Stage>(initialStage);
  const [showBothDevices, setShowBothDevices] = useState(device === "desktop");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    analytics.track(stage === "contact" ? "Inside Signup Viewed" : "Inside Signup Complete Viewed", {
      funnel: "activation_entry",
      intent,
      device,
    });
  }, [device, intent, stage]);

  const trackChoice = (action: string) => {
    analytics.track("Post Activation Choice", {
      funnel: "activation_entry",
      intent,
      device,
      action,
    });
  };

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
    const normalizedEmail = email.trim().toLowerCase();
    const phoneDigits = phone.replace(/\D/g, "");

    if (nameParts.length < 2 || nameParts.some((part) => part.length < 2)) {
      setFormError("Enter your first and last name.");
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
          routeAnswers: {
            intent,
            surface: "inside_workspace_signup",
            funnel: "activation-entry-v1",
          },
        }),
      });
      if (!response.ok) throw new Error("contact_capture_failed");

      localStorage.setItem(
        "pestflow_inside_signup",
        JSON.stringify({ fullName: fullName.trim(), companyName: companyName.trim(), email: normalizedEmail }),
      );
      analytics.identify(normalizedEmail, { activation_intent: intent });
      analytics.track("Inside Signup Submitted", {
        funnel: "activation-entry-v1",
        intent,
        fields: ["full_name", "company", "email", "phone"],
      });
      setStage("complete");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFormError("We could not save your workspace yet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const showIos = device === "ios" || showBothDevices;
  const showAndroid = device === "android" || showBothDevices;

  return (
    <main className="min-h-screen overflow-hidden bg-[#07101c] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -right-32 -top-40 h-[32rem] w-[32rem] rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-48 -left-40 h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <a href="/?funnel=jtbd&popup-check=1" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white p-1.5">
              <img src={logoImage} alt="PestFlow" className="h-full w-full object-contain" />
            </span>
            <span className="text-sm font-black">PestFlow</span>
          </a>
          <a href="/?funnel=jtbd&popup-check=1" className="text-sm font-semibold text-slate-400 transition hover:text-white">
            Back
          </a>
        </header>

        {stage === "contact" ? (
          <section className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 py-10 lg:grid-cols-[1.04fr_.96fr] lg:gap-12">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
                <CheckCircle2 className="h-4 w-4" /> You’re inside PestFlow
              </div>
              <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
                Let’s save your workspace.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Your starting point is {WORKFLOW_LABELS[intent] || "your first workflow"}. Add your contact information now so your setup is waiting when you return.
              </p>

              <div className="mt-7 flex items-center gap-3 text-xs font-semibold text-slate-400 sm:text-sm">
                <span className="flex items-center gap-2 text-emerald-300"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400 text-xs font-black text-emerald-950"><Check className="h-3.5 w-3.5" /></span> Choose</span>
                <span className="h-px flex-1 bg-emerald-400/40" />
                <span className="flex items-center gap-2 text-white"><span className="grid h-6 w-6 place-items-center rounded-full border border-emerald-300 bg-emerald-400/15 text-xs font-black text-emerald-200">2</span> Save access</span>
                <span className="h-px flex-1 bg-white/10" />
                <span className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full border border-white/15 text-xs font-black">3</span> Keep going</span>
              </div>
            </div>

            <form onSubmit={submitContact} className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur sm:p-7">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400 text-emerald-950">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Save your access</p>
                  <h2 className="mt-1 text-xl font-black text-white">Where should PestFlow remember you?</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-slate-300">
                  Full name
                  <Input value={fullName} onChange={(event) => { setFullName(event.target.value); setFormError(""); }} placeholder="First and last name" autoComplete="name" className="mt-2 h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500" />
                </label>
                <label className="text-xs font-bold text-slate-300">
                  Company
                  <Input value={companyName} onChange={(event) => { setCompanyName(event.target.value); setFormError(""); }} placeholder="Pest-control company" autoComplete="organization" className="mt-2 h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500" />
                </label>
                <label className="text-xs font-bold text-slate-300">
                  Work email
                  <Input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setFormError(""); }} placeholder="you@company.com" autoComplete="email" className="mt-2 h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500" />
                </label>
                <label className="text-xs font-bold text-slate-300">
                  Phone
                  <Input type="tel" value={phone} onChange={(event) => { setPhone(event.target.value); setFormError(""); }} placeholder="(555) 555-5555" autoComplete="tel" className="mt-2 h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500" />
                </label>
              </div>

              {formError && <p className="mt-4 text-xs font-semibold text-red-400">{formError}</p>}
              <Button type="submit" disabled={submitting} className="mt-6 h-12 w-full bg-emerald-400 text-sm font-black text-emerald-950 hover:bg-emerald-300">
                {submitting ? "Saving your workspace…" : "Save workspace and continue"}
                {!submitting && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                These details save your PestFlow access and setup context.
              </p>
            </form>
          </section>
        ) : (
          <section className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 py-10 lg:grid-cols-[1.04fr_.96fr] lg:gap-12">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
                <CheckCircle2 className="h-4 w-4" /> Workspace saved
              </div>
              <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
                Keep PestFlow where you work.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Your information is saved. Continue in the browser, put PestFlow on your phone, or book help configuring your first workflow.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur sm:p-7">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400 text-emerald-950">
                  {device === "desktop" ? <MonitorSmartphone className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Choose what’s next</p>
                  <h2 className="mt-1 text-xl font-black text-white">
                    {device === "ios" && "Continue on this iPhone"}
                    {device === "android" && "Continue on this Android"}
                    {device === "desktop" && "Continue here or add your phone"}
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {showIos && (
                  <Button asChild className="h-12 w-full bg-emerald-400 font-black text-emerald-950 hover:bg-emerald-300">
                    <a href={PESTFLOW_APP_STORE_URL} target="_blank" rel="noreferrer" onClick={() => trackChoice("ios_app_store")}>
                      <Download className="mr-2 h-5 w-5" /> Get the iPhone app
                    </a>
                  </Button>
                )}

                {showAndroid && (
                  <Button asChild className={`${showIos ? "border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white" : "bg-emerald-400 font-black text-emerald-950 hover:bg-emerald-300"} h-12 w-full`} variant={showIos ? "outline" : "default"}>
                    <a href={PESTFLOW_PWA_APP_URL} onClick={() => trackChoice("android_browser_install")}>
                      <Smartphone className="mr-2 h-5 w-5" /> Use PestFlow on Android
                    </a>
                  </Button>
                )}

                <Button asChild variant="outline" className="h-12 w-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <a href={PESTFLOW_PWA_APP_URL} onClick={() => trackChoice("web_app")}>
                    Continue in browser <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>

              {showAndroid && (
                <p className="mt-3 rounded-xl bg-slate-950/45 p-3 text-xs leading-5 text-slate-400">
                  On Android, open PestFlow in Chrome and choose <strong className="text-slate-200">Add to Home screen</strong> from the browser menu.
                </p>
              )}

              {!showBothDevices && (
                <button type="button" onClick={() => setShowBothDevices(true)} className="mt-4 w-full text-center text-xs font-semibold text-cyan-200 hover:text-cyan-100">
                  Using a different phone? Show both options
                </button>
              )}

              <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
                <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
              </div>

              <Button asChild variant="outline" className="h-12 w-full border-violet-300/25 bg-violet-400/10 text-violet-100 hover:bg-violet-400/20 hover:text-white">
                <a href={PESTFLOW_CALENDLY_URL} target="_blank" rel="noreferrer" onClick={() => trackChoice("setup_call")}>
                  <CalendarDays className="mr-2 h-5 w-5" /> Book a 15-minute setup call
                </a>
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
