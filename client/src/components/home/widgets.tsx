import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  Check,
  X,
  TrendingUp,
  Zap,
  BarChart2,
} from "lucide-react";

// ─── 1. Revenue Leak Calculator ──────────────────────────────────────────────

const AVG_TICKET = 89; // avg pest control service ticket $
const INDUSTRY_BENCHMARK = 14; // stops/truck/day
const WORK_DAYS = 250; // ~5 days × 50 weeks

function RevenueCalculator() {
  const [stops, setStops] = useState(8);
  const [trucks, setTrucks] = useState(2);

  const gap = Math.max(0, INDUSTRY_BENCHMARK - stops);
  const annualLeak = gap * trucks * AVG_TICKET * WORK_DAYS;
  const weeklyLeak = Math.round(annualLeak / 50);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Revenue Leak Calculator</h3>
          <p className="text-xs text-slate-500">See exactly what unoptimized routes cost you</p>
        </div>
      </div>

      <div className="space-y-5 md:max-w-xl">
        <div>
          <div className="flex justify-between text-sm font-medium text-slate-700 mb-2">
            <span>Stops per truck / day</span>
            <span className="text-emerald-600 font-bold">{stops}</span>
          </div>
          <input
            type="range"
            min={4}
            max={18}
            value={stops}
            onChange={(e) => setStops(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>4 stops</span>
            <span className="text-emerald-500 font-semibold">↑ industry avg: {INDUSTRY_BENCHMARK}</span>
            <span>18 stops</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm font-medium text-slate-700 mb-2">
            <span>Number of trucks</span>
            <span className="text-emerald-600 font-bold">{trucks}</span>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            value={trucks}
            onChange={(e) => setTrucks(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>1 truck</span>
            <span>15 trucks</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gap > 0 ? (
            <motion.div
              key="leak"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="bg-red-50 border border-red-100 rounded-xl p-4 text-center"
            >
              <p className="text-xs text-red-500 font-semibold uppercase tracking-wide mb-1">
                Estimated annual leak
              </p>
              <p className="text-3xl font-extrabold text-red-600">
                ${annualLeak.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                That's <span className="font-semibold text-slate-700">${weeklyLeak.toLocaleString()}/week</span> left on the table vs. optimized routes
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="maxed"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center"
            >
              <p className="text-sm font-bold text-emerald-700">
                You're at or above the industry benchmark.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PestFlow helps you maintain and push even further.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Link href="/onboarding">
        <Button className="w-full mt-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">
          Fix this with PestFlow <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

// ─── 2. Competitor Comparison ─────────────────────────────────────────────────

const COMPARISON_ROWS = [
  { feature: "Easy setup (< 1 day)", pestflow: true, pestpac: false, gorilla: true },
  { feature: "Drag-and-drop route board", pestflow: true, pestpac: false, gorilla: false },
  { feature: "Recurring billing built-in", pestflow: true, pestpac: true, gorilla: true },
  { feature: "AI Agents / automation", pestflow: true, pestpac: false, gorilla: false },
  { feature: "Branded customer portal", pestflow: true, pestpac: false, gorilla: false },
  { feature: "Technician GPS tracking", pestflow: true, pestpac: true, gorilla: true },
  { feature: "Integrated VoIP & SMS", pestflow: true, pestpac: false, gorilla: false },
  { feature: "No per-user seat fees", pestflow: true, pestpac: false, gorilla: false },
];

function Cell({ val }: { val: boolean }) {
  return val ? (
    <Check className="h-4 w-4 text-emerald-600 mx-auto" />
  ) : (
    <X className="h-4 w-4 text-slate-300 mx-auto" />
  );
}

function ComparisonTable() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
          <BarChart2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">How We Stack Up</h3>
          <p className="text-xs text-slate-500">PestFlow vs PestPac vs GorillaDesk</p>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-400 pb-2 w-1/2">Feature</th>
              <th className="text-center text-xs font-bold text-emerald-700 pb-2 px-2">PestFlow</th>
              <th className="text-center text-xs font-semibold text-slate-400 pb-2 px-2">PestPac</th>
              <th className="text-center text-xs font-semibold text-slate-400 pb-2 px-2">GorillaDesk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.feature} className="hover:bg-emerald-50/40 transition-colors">
                <td className="py-2 text-slate-700 text-xs font-medium pr-2">{row.feature}</td>
                <td className="py-2 text-center">
                  <Cell val={row.pestflow} />
                </td>
                <td className="py-2 text-center">
                  <Cell val={row.pestpac} />
                </td>
                <td className="py-2 text-center">
                  <Cell val={row.gorilla} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/onboarding">
        <Button className="w-full mt-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">
          Switch in under 24 hours <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

// ─── 3. Route IQ Grader ───────────────────────────────────────────────────────

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

  const scoreColor =
    score >= 75 ? "text-emerald-600" : score >= 45 ? "text-amber-500" : "text-red-500";
  const scoreBg =
    score >= 75 ? "bg-emerald-50 border-emerald-100" : score >= 45 ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100";
  const scoreLabel =
    score >= 75 ? "Solid foundation" : score >= 45 ? "Room to optimize" : "Significant revenue risk";

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
          <Zap className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Route IQ Grader</h3>
          <p className="text-xs text-slate-500">3 questions — see where you're leaking efficiency</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4 flex-grow"
          >
            {QUESTIONS.map((q) => (
              <div key={q.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-sm text-slate-700 font-medium mb-2 leading-snug">{q.text}</p>
                <div className="flex gap-2">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                        answers[q.id] === val
                          ? val
                            ? "bg-red-100 border-red-300 text-red-700"
                            : "bg-emerald-100 border-emerald-300 text-emerald-700"
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
              className="mt-auto w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl disabled:opacity-40"
            >
              Grade My Operation <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center flex-grow text-center"
          >
            <div className={`rounded-2xl border p-6 w-full mb-4 ${scoreBg}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Your Route IQ</p>
              <p className={`text-5xl font-extrabold ${scoreColor}`}>{score}<span className="text-2xl text-slate-400">/100</span></p>
              <p className={`text-sm font-semibold mt-1 ${scoreColor}`}>{scoreLabel}</p>
            </div>

            {yesCount > 0 && (
              <p className="text-xs text-slate-500 mb-4 px-2">
                You answered "Yes" to {yesCount} of 3 inefficiencies. PestFlow automates all of them on day one.
              </p>
            )}

            <Link href="/onboarding" className="w-full">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">
                See my full audit inside PestFlow <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <button
              onClick={() => { setSubmitted(false); setAnswers({ manual_scheduling: null, manual_confirm: null, split_apps: null }); }}
              className="text-xs text-slate-400 hover:text-slate-600 mt-3 underline"
            >
              Retake
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

export function Widgets() {
  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4">
            Try It Right Now
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
            See what PestFlow can do <span className="text-emerald-600">for your operation</span>
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Three tools. Two minutes. A clear picture of where your money's going — and how to get it back.
          </p>
        </motion.div>

        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
          {[
            <RevenueCalculator key="calc" />,
            <ComparisonTable key="compare" />,
            <RouteIQGrader key="iq" />,
          ].map((widget, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-8"
            >
              {widget}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
