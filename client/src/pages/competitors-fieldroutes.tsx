import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

type Cell = boolean | string;

const rows: { label: string; pf: Cell; rival: Cell; winner: "pf" | "rival" | "tie" }[] = [
  { label: "Starting price", pf: "$40 / route", rival: "$199–350 / mo", winner: "pf" },
  { label: "Implementation fee", pf: "None", rival: "$1,500–$2,000", winner: "pf" },
  { label: "Free trial", pf: "7 days, no card", rival: "Demo only", winner: "pf" },
  { label: "Contract required", pf: "Month-to-month", rival: "Annual contract", winner: "pf" },
  { label: "Free for field technicians", pf: true, rival: false, winner: "pf" },
  { label: "Route optimization", pf: true, rival: true, winner: "tie" },
  { label: "Modern, fast interface", pf: true, rival: "Dated, reported crashes", winner: "pf" },
  { label: "Branded customer portal", pf: true, rival: "Limited", winner: "pf" },
  { label: "Enterprise reporting suite", pf: "Core reports", rival: true, winner: "rival" },
  { label: "Free data migration", pf: true, rival: false, winner: "pf" },
];

function Mark({ value, win }: { value: Cell; win: boolean }) {
  if (value === true)
    return <Check className={`mx-auto h-5 w-5 ${win ? "text-emerald-600" : "text-slate-400"}`} strokeWidth={3} />;
  if (value === false) return <X className="mx-auto h-5 w-5 text-red-400" strokeWidth={3} />;
  return <span className={`text-sm font-semibold ${win ? "text-emerald-700" : "text-slate-600"}`}>{value}</span>;
}

export default function CompetitorsFieldRoutes() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 px-4 py-16 md:py-20">
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,#5ec23e_1px,transparent_0)] [background-size:38px_38px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Link href="/competitors">
            <span className="mb-6 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> All comparisons
            </span>
          </Link>
          <h1 className="font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
            PestFlow <span className="text-slate-400">vs</span> <span className="text-emerald-400">FieldRoutes</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            FieldRoutes is built for large enterprises — with enterprise pricing, setup fees, and contracts to match.
            Here's the honest head-to-head for a growing crew.
          </p>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-slate-200 bg-slate-50">
            <div className="px-5 py-4 font-heading text-sm font-bold text-slate-500"></div>
            <div className="border-l border-slate-200 bg-emerald-600 px-4 py-4 text-center font-heading text-base font-extrabold text-white">
              PestFlow
            </div>
            <div className="border-l border-slate-200 px-4 py-4 text-center font-heading text-base font-extrabold text-slate-700">
              FieldRoutes
            </div>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={`grid grid-cols-[1.4fr_1fr_1fr] items-center ${
                i !== rows.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <div className="px-5 py-4 text-sm font-medium text-slate-700">{r.label}</div>
              <div className="border-l border-slate-100 bg-emerald-50/50 px-4 py-4 text-center">
                <Mark value={r.pf} win={r.winner === "pf"} />
              </div>
              <div className="border-l border-slate-100 px-4 py-4 text-center">
                <Mark value={r.rival} win={r.winner === "rival"} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* THE TAKE */}
      <section className="bg-emerald-50/60 px-4 py-16">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <div>
            <h3 className="font-heading text-xl font-extrabold text-slate-900">Where FieldRoutes wins</h3>
            <ul className="mt-4 space-y-3">
              {["Deep route optimization for huge fleets", "Mature enterprise reporting & analytics", "Backed by ServiceTitan's ecosystem"].map((t) => (
                <li key={t} className="flex gap-2.5 text-slate-700">
                  <Check className="mt-1 h-4 w-4 flex-shrink-0 text-emerald-600" strokeWidth={3} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-xl font-extrabold text-slate-900">Where it costs you</h3>
            <ul className="mt-4 space-y-3">
              {["$1,500–$2,000 just to get started", "Annual contract, no free trial", "Dated UI with reported crashes", "Per-seat pricing — techs aren't free"].map((t) => (
                <li key={t} className="flex gap-2.5 text-slate-700">
                  <X className="mt-1 h-4 w-4 flex-shrink-0 text-red-400" strokeWidth={3} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-heading text-3xl font-extrabold text-white">
            Skip the setup fee. Start today.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-lg text-emerald-50">
            No contracts, no implementation invoice — just a 7-day free trial.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="mt-7 h-14 bg-white px-10 text-lg font-bold text-emerald-700 hover:bg-emerald-50">
              Start Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
