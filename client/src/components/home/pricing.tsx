import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";

const INCLUDED_FEATURES = [
  "Scheduling and route management",
  "Invoicing and recurring billing",
  "Customer communication",
  "Mobile technician workflow",
];

const PLANS = [
  {
    name: "Small Team",
    teamSize: "1–5 technicians",
    price: 150,
    description: "Straightforward monthly pricing for owner-operators and smaller field teams.",
    featured: false,
  },
  {
    name: "Growing Team",
    teamSize: "6+ technicians",
    price: 250,
    description: "One monthly price for established teams with six or more field technicians.",
    featured: true,
  },
] as const;

export function Pricing() {
  return (
    <section id="pricing" className="relative scroll-mt-24 overflow-hidden bg-[#f3faed] py-24">
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-700">
            Two plans. No slider.
          </p>
          <h2 className="mb-4 font-heading text-3xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
            Simple pricing based on team size
          </h2>
          <p className="text-lg text-slate-600">
            Pay $150 per month for up to five technicians, or $250 per month for six or more.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
          {PLANS.map((plan, index) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className={`relative flex min-h-[610px] flex-col rounded-[2rem] border p-8 shadow-sm sm:p-12 ${
                plan.featured
                  ? "border-emerald-500 bg-slate-950 text-white shadow-xl"
                  : "border-emerald-100 bg-white text-slate-950"
              }`}
            >
              {plan.featured && (
                <span className="absolute right-8 top-8 rounded-full bg-lime-400 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-950">
                  6+ technicians
                </span>
              )}

              <p className={`text-xs font-extrabold uppercase tracking-[0.22em] ${plan.featured ? "text-lime-400" : "text-emerald-700"}`}>
                {plan.name}
              </p>
              <h3 className="mt-5 text-xl font-extrabold">{plan.teamSize}</h3>
              <div className="mt-8 flex items-end gap-2">
                <span className="text-6xl font-black tracking-tight">${plan.price}</span>
                <span className={`pb-2 text-base ${plan.featured ? "text-slate-300" : "text-slate-500"}`}>
                  / month
                </span>
              </div>
              <p className={`mt-7 min-h-14 text-base leading-7 ${plan.featured ? "text-slate-300" : "text-slate-600"}`}>
                {plan.description}
              </p>

              <div className={`my-9 h-px ${plan.featured ? "bg-white/15" : "bg-slate-200"}`} />

              <p className={`mb-5 text-xs font-extrabold uppercase tracking-[0.18em] ${plan.featured ? "text-white" : "text-slate-700"}`}>
                PestFlow includes
              </p>
              <ul className="space-y-4">
                {INCLUDED_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-base font-medium">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${plan.featured ? "border-lime-400 text-lime-400" : "border-emerald-500 text-emerald-600"}`}>
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/onboarding" className="mt-auto pt-10">
                <span className={`flex h-14 w-full items-center justify-center rounded-xl text-base font-extrabold transition-transform hover:-translate-y-0.5 ${plan.featured ? "bg-lime-400 text-emerald-950 hover:bg-lime-300" : "bg-slate-950 text-white hover:bg-slate-800"}`}>
                  Start for $1 <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </Link>
            </motion.article>
          ))}
        </div>

        <p className="mt-10 text-center text-sm font-medium text-slate-500">
          $1 today · 7-day full-product trial · Monthly billing after trial · Cancel anytime
        </p>
      </div>
    </section>
  );
}
