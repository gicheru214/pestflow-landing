import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BookOpenCheck, CheckCircle2, LogIn, MessageCircle, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type TutorChoice = "yes" | "no" | "signin" | null;

const SCRIPTED_RESPONSES: Record<Exclude<TutorChoice, null>, { user: string; reply: string; accent: string }> = {
  yes: {
    user: "Yes, I am studying for my licensing exam.",
    reply:
      "Perfect. Start with labels, safety, application math, IPM, and recordkeeping. PestFlow can walk you through practice questions and explain the right answer in plain English.",
    accent: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  no: {
    user: "No, not right now.",
    reply:
      "No problem. You can still use PestFlow for routes, invoices, customer records, and technician workflows. The tutor is here whenever licensing prep matters.",
    accent: "border-slate-200 bg-slate-50 text-slate-700",
  },
  signin: {
    user: "I already have an account.",
    reply:
      "Great. Sign in to continue into PestFlow and pick up from your dashboard.",
    accent: "border-blue-200 bg-blue-50 text-blue-800",
  },
};

export function AiTutor() {
  const [choice, setChoice] = useState<TutorChoice>(null);
  const selected = choice ? SCRIPTED_RESPONSES[choice] : null;

  return (
    <section id="ai-tutor" className="bg-white py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <BookOpenCheck className="h-4 w-4" />
              AI Tutor
            </div>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Help your team study for the pest control licensing exam.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              A simple tutor flow for labels, PPE, IPM, application math, safety, and recordkeeping. Use it as a quick prep path before a tech sits for the exam.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Label directions and signal words",
                "Application math and dilution",
                "Safety, PPE, and spill response",
                "State recordkeeping basics",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 shadow-2xl shadow-slate-900/20 sm:p-6">
            <div className="rounded-2xl bg-white p-4 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">AI Tutor</h3>
                    <p className="text-sm text-slate-500">Licensing exam check-in</p>
                  </div>
                </div>
                <div className="hidden items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:flex">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  PestFlow
                </div>
              </div>

              <div className="space-y-3">
                <div className="max-w-[88%] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                  Are you studying for your pest control licensing exam?
                </div>

                {selected && (
                  <>
                    <div className="ml-auto max-w-[88%] rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium leading-relaxed text-white">
                      {selected.user}
                    </div>
                    <div className={`max-w-[88%] rounded-2xl border px-4 py-3 text-sm leading-relaxed ${selected.accent}`}>
                      {selected.reply}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                <Button
                  type="button"
                  onClick={() => setChoice("yes")}
                  className="h-11 bg-emerald-600 font-bold text-white hover:bg-emerald-500"
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChoice("no")}
                  className="h-11 font-bold"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  No
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChoice("signin")}
                  className="h-11 font-bold"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in
                </Button>
              </div>

              {choice === "signin" ? (
                <Link href="/login" className="mt-4 block">
                  <Button className="h-12 w-full bg-slate-900 font-bold text-white hover:bg-slate-800">
                    Continue to sign in <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/onboarding" className="mt-4 block">
                  <Button variant="ghost" className="h-12 w-full font-bold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                    Start PestFlow trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
