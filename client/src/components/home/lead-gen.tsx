import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analytics, EVENTS } from "@/lib/analytics";

type Answer = "yes" | "sometimes" | "no";
type CheckId = "callback" | "capacity" | "invoice";
type Answers = Partial<Record<CheckId, Answer>>;

const checks: Array<{ id: CheckId; question: string; title: string; action: string }> = [
  {
    id: "callback",
    question: "Does every missed call get a same-day follow-up?",
    title: "Missed-call follow-up",
    action: "Review the last 10 missed calls. Give each one an owner, a callback time, and a recorded outcome.",
  },
  {
    id: "capacity",
    question: "Can your team see open route capacity before promising an appointment?",
    title: "Route capacity",
    action: "Look at the next five route days. Mark open slots and long drives before your team books another visit.",
  },
  {
    id: "invoice",
    question: "Does every completed job reach an invoice without someone chasing it?",
    title: "Job-to-invoice handoff",
    action: "Compare the last 10 completed jobs with sent invoices. Assign an owner to every missing invoice.",
  },
];

const answerLabels: Record<Answer, string> = {
  yes: "Yes, consistently",
  sometimes: "Sometimes",
  no: "No or not sure",
};

function firstPriority(answers: Answers) {
  return checks.find((check) => answers[check.id] === "no")
    ?? checks.find((check) => answers[check.id] === "sometimes")
    ?? null;
}

export function LeadGen() {
  const [answers, setAnswers] = useState<Answers>({});
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emailAccepted, setEmailAccepted] = useState(false);
  const [error, setError] = useState("");
  const completedTracked = useRef(false);
  const answeredCount = checks.filter((check) => answers[check.id]).length;
  const complete = answeredCount === checks.length;
  const priority = complete ? firstPriority(answers) : null;

  const choose = (id: CheckId, answer: Answer) => {
    const next = { ...answers, [id]: answer };
    if (answeredCount === 0) {
      sessionStorage.setItem("pestflow_owner_checkup_started", "true");
      analytics.track(EVENTS.LANDING.OWNER_CHECKUP_STARTED);
    }
    if (!completedTracked.current && checks.every((check) => next[check.id])) {
      completedTracked.current = true;
      analytics.track(EVENTS.LANDING.OWNER_CHECKUP_COMPLETED, {
        priority: firstPriority(next)?.id ?? "none",
      });
    }
    setAnswers(next);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!complete || submitting || saved) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          firstName: firstName.trim(),
          lastName: "",
          email: email.trim(),
          quizAnswers: {
            source: "homepage_owner_checkup",
            answers,
            priority: priority?.id ?? "none",
          },
        }),
      });
      if (!response.ok) throw new Error("Submission failed");
      const result = await response.json().catch(() => null) as {
        playbookDelivery?: { accepted?: boolean };
      } | null;
      setSaved(true);
      setEmailAccepted(result?.playbookDelivery?.accepted === true);
      localStorage.setItem("pestflow_popup_submitted", "true");
      localStorage.setItem("pestflow_popup_submitted_workflow_v2", "true");
      analytics.identify(email.trim());
      analytics.track(EVENTS.LANDING.OWNER_CHECKUP_LEAD_SAVED, {
        priority: priority?.id ?? "none",
      });
    } catch {
      setError("We couldn't save your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="owner-checkup" className="relative overflow-hidden bg-slate-900 py-20 text-white md:py-24">
      <div className="absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[90px]" />
      <div className="container relative z-10 mx-auto grid gap-10 px-4 md:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm font-semibold text-emerald-300">
            <ClipboardCheck className="h-4 w-4" /> Free owner checkup
          </div>
          <h2 className="max-w-xl font-heading text-3xl font-extrabold leading-tight md:text-4xl">
            Find the first handoff to fix in your pest control business.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            Answer three practical questions about calls, routes, and invoices. Get a useful next step on this page before sharing any contact details.
          </p>
          <div className="mt-7 space-y-3 text-sm text-slate-200">
            <p className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" /> About two minutes</p>
            <p className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" /> No account needed</p>
            <p className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" /> Optional full 27-point playbook by email</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold">Your two-minute checkup</h3>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">{answeredCount} of 3</span>
          </div>
          <div className="space-y-5">
            {checks.map((check, index) => (
              <fieldset key={check.id} className="border-b border-white/10 pb-5 last:border-b-0 last:pb-0">
                <legend className="mb-3 text-sm font-semibold leading-6 text-white">
                  <span className="mr-2 text-emerald-300">{index + 1}.</span>{check.question}
                </legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(["yes", "sometimes", "no"] as const).map((answer) => (
                    <button
                      key={answer}
                      type="button"
                      aria-pressed={answers[check.id] === answer}
                      onClick={() => choose(check.id, answer)}
                      className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors sm:text-center ${answers[check.id] === answer
                        ? "border-emerald-400 bg-emerald-500/20 text-white"
                        : "border-white/15 bg-slate-800/70 text-slate-300 hover:border-emerald-400/60 hover:text-white"}`}
                    >
                      {answerLabels[answer]}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          {complete && (
            <div className="mt-7 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-5" role="status" aria-live="polite">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">Your first fix</p>
              <h4 className="mt-2 text-xl font-bold">{priority?.title ?? "Keep your handoffs visible"}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                {priority?.action ?? "Your answers suggest these handoffs are already tracked. Review 10 recent calls, route days, and invoices to confirm the process holds up in practice."}
              </p>
              <p className="mt-3 text-xs text-slate-400">This is a starting point from your answers, not a measured revenue loss or a full business audit.</p>
            </div>
          )}

          {complete && !saved && (
            <form onSubmit={submit} className="mt-6 space-y-3 rounded-xl border border-white/10 bg-slate-800/60 p-5">
              <h4 className="text-lg font-bold">Want the full 27-point playbook?</h4>
              <p className="text-sm leading-6 text-slate-300">Get the deeper checks and a seven-day action plan by email.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium text-slate-300">First name
                  <Input required value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" className="mt-1 border-slate-600 bg-slate-900 text-white" />
                </label>
                <label className="text-xs font-medium text-slate-300">Email
                  <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-1 border-slate-600 bg-slate-900 text-white" />
                </label>
              </div>
              {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
              <Button disabled={submitting} type="submit" className="w-full bg-emerald-600 font-bold text-white hover:bg-emerald-500">
                {submitting ? "Saving your request…" : "Email me the full playbook"}<ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-slate-400">We'll email the playbook and practical PestFlow tips. Unsubscribe anytime.</p>
            </form>
          )}

          {saved && (
            <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-5" role="status">
              <h4 className="font-bold">Your request is saved</h4>
              <p className="mt-1 text-sm text-slate-200">
                {emailAccepted ? "The playbook is on its way." : "Email delivery is temporarily unavailable. You can download the playbook now."}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                <a href="/pest-control-revenue-leak-playbook.pdf" download className="text-emerald-300 underline">Download the playbook</a>
                <a href="/growth-kit?download=1" className="text-emerald-300 underline">Open the full toolkit</a>
              </div>
            </div>
          )}

          {complete && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              {!saved && <button type="button" onClick={() => { setAnswers({}); completedTracked.current = false; }} className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white">
                <RotateCcw className="h-3.5 w-3.5" /> Start over
              </button>}
              <a href="/onboarding" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">Try PestFlow <ArrowRight className="inline h-4 w-4" /></a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
