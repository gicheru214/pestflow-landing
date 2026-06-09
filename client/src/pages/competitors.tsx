import { Link } from "wouter";
import { ArrowRight, Check, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

type Cell = boolean | "partial" | string;

const featureGroups: { group: string; rows: { label: string; pf: Cell; fr: Cell; gd: Cell }[] }[] = [
  {
    group: "Scheduling & Routing",
    rows: [
      { label: "Drag-and-drop route board", pf: true, fr: true, gd: true },
      { label: "Route optimization", pf: true, fr: true, gd: "Basic" },
      { label: "Recurring service automation", pf: true, fr: true, gd: true },
      { label: "Technician GPS tracking", pf: true, fr: true, gd: "Limited" },
    ],
  },
  {
    group: "Mobile App",
    rows: [
      { label: "Native iOS & Android app", pf: true, fr: true, gd: true },
      { label: "Free for field technicians", pf: true, fr: false, gd: false },
      { label: "In-app signatures & photos", pf: true, fr: true, gd: "Basic" },
    ],
  },
  {
    group: "Billing & Payments",
    rows: [
      { label: "Recurring billing & auto-pay", pf: true, fr: true, gd: true },
      { label: "Branded customer portal", pf: true, fr: "Limited", gd: "Limited" },
      { label: "Automated review requests", pf: true, fr: true, gd: false },
    ],
  },
  {
    group: "Pricing & Onboarding",
    rows: [
      { label: "Transparent published pricing", pf: true, fr: false, gd: true },
      { label: "No implementation fee", pf: true, fr: false, gd: true },
      { label: "Free trial", pf: true, fr: false, gd: false },
      { label: "Free data migration", pf: true, fr: false, gd: "Partial" },
    ],
  },
];

const summary = [
  {
    name: "PestFlow",
    tag: "Built for growing crews",
    accent: true,
    pros: ["Mobile-first, free for techs", "Branded customer portal + reviews", "No setup fee, free migration"],
    price: "$40",
    priceNote: "per route · 7-day trial",
  },
  {
    name: "FieldRoutes",
    tag: "By ServiceTitan · Enterprise-leaning",
    accent: false,
    pros: ["Deep route optimization", "Large enterprise feature set"],
    cons: ["Dated interface, reported crashes", "$1,500–$2,000 implementation fee", "No free trial — demo only"],
    price: "$199–350",
    priceNote: "/mo + setup",
  },
  {
    name: "GorillaDesk",
    tag: "Simple & affordable · Small teams",
    accent: false,
    pros: ["Easy to learn, quick to start", "Low entry price, no contract"],
    cons: ["Stalls past 2–3 trucks", "SMS is a paid add-on", "Basic reporting & portal"],
    price: "$49",
    priceNote: "/mo · SMS extra",
  },
];

function CellMark({ value }: { value: Cell }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-emerald-600" strokeWidth={3} />;
  if (value === false) return <X className="mx-auto h-5 w-5 text-red-400" strokeWidth={3} />;
  if (value === "partial") return <Minus className="mx-auto h-5 w-5 text-amber-500" strokeWidth={3} />;
  return <span className="text-sm font-semibold text-amber-600">{value}</span>;
}

export default function CompetitorsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* HERO */}
      <section className="border-b bg-secondary/30 px-4 py-20 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            PEST CONTROL SOFTWARE COMPARISON
          </div>
          <h1 className="font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            How PestFlow stacks up <br className="hidden sm:block" />
            against <span className="text-emerald-700">the field</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            An honest, side-by-side look at PestFlow, FieldRoutes, and GorillaDesk — features, pricing, and the
            trade-offs nobody puts on their own site.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/onboarding">
              <Button size="lg" className="h-12 bg-emerald-600 px-8 text-base font-bold text-white hover:bg-emerald-700">
                Start Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#matrix">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold">
                See Full Comparison
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* AT A GLANCE */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-emerald-600">At a glance</p>
          <h2 className="font-heading text-3xl font-extrabold text-slate-900 md:text-4xl">
            Three platforms, three different jobs
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">
            Each tool has a real sweet spot. Here's the short version before we get into the details.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {summary.map((s) => (
            <div
              key={s.name}
              className={`rounded-2xl border p-7 ${
                s.accent ? "border-2 border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10" : "border-slate-200 bg-white"
              }`}
            >
              <h3 className={`font-heading text-xl font-extrabold ${s.accent ? "text-emerald-700" : "text-slate-900"}`}>
                {s.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{s.tag}</p>
              <ul className="mt-5 space-y-2.5 border-t border-slate-100 pt-5">
                {s.pros.map((p) => (
                  <li key={p} className="flex gap-2.5 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" strokeWidth={3} />
                    {p}
                  </li>
                ))}
                {s.cons?.map((c) => (
                  <li key={c} className="flex gap-2.5 text-sm text-slate-700">
                    <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" strokeWidth={3} />
                    {c}
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-slate-100 pt-5">
                <span className="font-heading text-2xl font-extrabold text-slate-900">{s.price}</span>
                <span className="text-sm text-slate-500"> {s.priceNote}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE MATRIX */}
      <section id="matrix" className="bg-emerald-50/60 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center font-heading text-3xl font-extrabold text-slate-900 md:text-4xl">
            Head-to-head, line by line
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-stretch">
              <div className="flex items-center px-5 py-5 font-heading text-sm font-bold text-slate-900">Feature</div>
              <div className="flex flex-col items-center justify-center bg-emerald-600 px-3 py-5 text-center">
                <span className="font-heading text-base font-extrabold text-white">PestFlow</span>
                <span className="text-[11px] font-semibold text-emerald-100">★ Recommended</span>
              </div>
              <div className="flex items-center justify-center bg-slate-700 px-3 py-5 text-center font-heading text-base font-extrabold text-white">
                FieldRoutes
              </div>
              <div className="flex items-center justify-center bg-slate-500 px-3 py-5 text-center font-heading text-base font-extrabold text-white">
                GorillaDesk
              </div>
            </div>

            {featureGroups.map((g) => (
              <div key={g.group}>
                <div className="bg-emerald-700 px-5 py-2.5 font-heading text-xs font-bold uppercase tracking-wide text-white">
                  {g.group}
                </div>
                {g.rows.map((r, i) => (
                  <div
                    key={r.label}
                    className={`grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center border-b border-slate-100 ${
                      i % 2 ? "bg-white" : "bg-slate-50/50"
                    }`}
                  >
                    <div className="px-5 py-4 text-sm font-medium text-slate-700">{r.label}</div>
                    <div className="bg-emerald-50/70 px-3 py-4 text-center">
                      <CellMark value={r.pf} />
                    </div>
                    <div className="px-3 py-4 text-center">
                      <CellMark value={r.fr} />
                    </div>
                    <div className="px-3 py-4 text-center">
                      <CellMark value={r.gd} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEEP DIVES */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="mb-10 text-center font-heading text-3xl font-extrabold text-slate-900 md:text-4xl">
          Go deeper on each matchup
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/competitors/fieldroutes">
            <div className="group h-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-emerald-300 hover:shadow-lg">
              <h3 className="font-heading text-2xl font-extrabold text-slate-900">PestFlow vs FieldRoutes</h3>
              <p className="mt-3 text-slate-600">
                FieldRoutes is enterprise software with enterprise pricing. We break down the setup fees, the
                contracts, and where a growing crew actually feels the difference.
              </p>
              <span className="mt-5 inline-flex items-center font-semibold text-emerald-700 group-hover:gap-1">
                Read the full comparison <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
          <Link href="/competitors/gorilladesk">
            <div className="group h-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-emerald-300 hover:shadow-lg">
              <h3 className="font-heading text-2xl font-extrabold text-slate-900">PestFlow vs GorillaDesk</h3>
              <p className="mt-3 text-slate-600">
                GorillaDesk is a great starting point — but teams past 2–3 trucks hit its limits on reporting and
                automation. We compare scale, hidden SMS costs, and when it's time to move.
              </p>
              <span className="mt-5 inline-flex items-center font-semibold text-emerald-700 group-hover:gap-1">
                Read the full comparison <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-20 text-center">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:36px_36px]" />
        <div className="relative mx-auto max-w-3xl">
          <h2 className="font-heading text-3xl font-extrabold text-white md:text-4xl">
            Run your pest control business from the truck.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-50">
            Start your free trial — no credit card, no contracts, no implementation fees.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="mt-8 h-14 bg-white px-10 text-lg font-bold text-emerald-700 hover:bg-emerald-50">
              Start Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
