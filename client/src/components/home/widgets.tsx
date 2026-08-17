import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, TrendingUp, Zap } from "lucide-react";

// ─── 1. Revenue Leak Calculator ──────────────────────────────────────────────

const AVG_TICKET = 89;
const INDUSTRY_BENCHMARK = 14;
const WORK_DAYS = 250;

function RevenueCalculator() {
  const [stops, setStops] = useState(8);
  const [trucks, setTrucks] = useState(2);
  const gap = Math.max(0, INDUSTRY_BENCHMARK - stops);
  const annualLeak = gap * trucks * AVG_TICKET * WORK_DAYS;
  const weeklyLeak = Math.round(annualLeak / 50);

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="h-11 w-11 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Revenue Leak Calculator</h3>
          <p className="text-sm text-slate-500">See exactly what unoptimized routes cost you</p>
        </div>
      </div>

      <div className="space-y-7 mb-8">
        <div>
          <div className="flex justify-between items-baseline mb-3">
            <label htmlFor="stops-per-truck" className="text-sm font-semibold text-slate-700">Stops per truck / day</label>
            <output htmlFor="stops-per-truck" className="text-2xl font-extrabold text-emerald-600">{stops}</output>
          </div>
          <input
            id="stops-per-truck"
            aria-describedby="stops-range-help"
            type="range" min={4} max={18} value={stops}
            onChange={(e) => setStops(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
          />
          <div id="stops-range-help" className="flex justify-between text-xs text-slate-500 mt-2">
            <span>4 stops</span>
            <span className="text-emerald-700 font-semibold">industry avg: {INDUSTRY_BENCHMARK} ↑</span>
            <span>18 stops</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-3">
            <label htmlFor="number-of-trucks" className="text-sm font-semibold text-slate-700">Number of trucks</label>
            <output htmlFor="number-of-trucks" className="text-2xl font-extrabold text-emerald-600">{trucks}</output>
          </div>
          <input
            id="number-of-trucks"
            aria-describedby="trucks-range-help"
            type="range" min={1} max={15} value={trucks}
            onChange={(e) => setTrucks(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
          />
          <div id="trucks-range-help" className="flex justify-between text-xs text-slate-500 mt-2">
            <span>1 truck</span>
            <span>15 trucks</span>
          </div>
        </div>
      </div>

      {gap > 0 ? (
        <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 text-center mb-4">
          <p className="text-xs text-red-700 font-bold uppercase tracking-widest mb-2">Estimated Annual Leak</p>
          <p className="text-5xl sm:text-6xl font-extrabold text-red-600 tracking-tight">${annualLeak.toLocaleString()}</p>
          <p className="text-sm text-slate-500 mt-3">
            That's <span className="font-bold text-slate-700">${weeklyLeak.toLocaleString()}/week</span> left on the table
          </p>
        </div>
      ) : (
        <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-6 text-center mb-4">
          <p className="text-lg font-bold text-emerald-700">You're at or above the benchmark.</p>
          <p className="text-sm text-slate-500 mt-1">PestFlow keeps you there and pushes further.</p>
        </div>
      )}

      <Button asChild className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base rounded-xl">
        <Link href="/onboarding">
          Fix this with PestFlow <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

// ─── 2. Route IQ Grader ───────────────────────────────────────────────────────

const QUESTIONS = [
  { id: "manual_scheduling", text: "Do you manually schedule and re-arrange routes each day?" },
  { id: "manual_confirm", text: "Do you call customers to confirm appointments by hand?" },
  { id: "split_apps", text: "Do you use separate apps for billing and scheduling?" },
];

function RouteIQGrader() {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({
    manual_scheduling: null,
    manual_confirm: null,
    split_apps: null,
  });
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = Object.values(answers).every((v) => v !== null);
  const yesCount = Object.values(answers).filter((v) => v === true).length;
  const score = 100 - yesCount * 28;

  const scoreColor = score >= 75 ? "text-emerald-700" : score >= 45 ? "text-amber-700" : "text-red-700";
  const scoreBg = score >= 75 ? "bg-emerald-50 border-emerald-200" : score >= 45 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
  const scoreLabel = score >= 75 ? "Solid foundation" : score >= 45 ? "Room to optimize" : "Significant revenue risk";

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="h-11 w-11 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Route IQ Grader</h3>
          <p className="text-sm text-slate-500">3 questions — see where you're leaking efficiency</p>
        </div>
      </div>

      {!submitted ? (
        <div className="space-y-3">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p id={`${q.id}-question`} className="text-sm text-slate-800 font-medium mb-3 leading-snug">{q.text}</p>
              <div role="group" aria-labelledby={`${q.id}-question`} className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    type="button"
                    key={String(val)}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                    aria-pressed={answers[q.id] === val}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold border-2 transition-all ${
                      answers[q.id] === val
                        ? val
                          ? "bg-red-100 border-red-400 text-red-700"
                          : "bg-emerald-100 border-emerald-400 text-emerald-700"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {val ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <Button
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base rounded-xl disabled:opacity-40 mt-2"
          >
            Grade My Operation <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <div className={`rounded-2xl border-2 p-8 mb-5 ${scoreBg}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Your Route IQ Score</p>
            <p className={`text-7xl font-extrabold tracking-tight ${scoreColor}`}>{score}</p>
            <p className="text-slate-600 text-sm font-medium mb-1">out of 100</p>
            <p className={`text-base font-bold mt-2 ${scoreColor}`}>{scoreLabel}</p>
            {yesCount > 0 && (
              <p className="text-xs text-slate-500 mt-3">
                {yesCount} of 3 inefficiencies identified — PestFlow automates all of them on day one.
              </p>
            )}
          </div>
          <Button asChild className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base rounded-xl">
            <Link href="/onboarding">
              See my full audit inside PestFlow <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <button
            onClick={() => { setSubmitted(false); setAnswers({ manual_scheduling: null, manual_confirm: null, split_apps: null }); }}
            className="text-xs text-slate-600 hover:text-slate-800 mt-3 underline block mx-auto"
          >
            Retake
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

export function Widgets() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-5">
            Try It Right Now
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-heading tracking-tight mb-4">
            See what PestFlow can do <span className="text-emerald-600">for your operation</span>
          </h2>
          <p className="text-base text-slate-500 max-w-md mx-auto">
            Two tools. Two minutes. A clear picture of where your money's going — and how to get it back.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {[
            <RevenueCalculator />,
            <RouteIQGrader />,
          ].map((widget, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8"
            >
              {widget}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
