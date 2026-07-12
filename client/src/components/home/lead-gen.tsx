import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, CheckCircle2, CreditCard, Route, ShieldCheck } from "lucide-react";
import { analytics, EVENTS } from "@/lib/analytics";
import { PESTFLOW_CALENDLY_URL } from "./auto-popup";

const PRODUCT_PROOF = [
  "Move a stop without losing the recurring service series",
  "Connect completed work to the invoice and payment follow-up",
  "Keep technician status, notes, photos, and customer history together",
  "Test one workflow before moving the rest of your operation",
];

export function LeadGen() {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
      <div className="absolute right-0 top-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-primary/20 opacity-50 blur-[100px]" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-[300px] w-[300px] rounded-full bg-blue-500/20 opacity-50 blur-[80px]" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
              <Route className="h-4 w-4" />
              See the real workflow first
            </div>
            <h2 className="mb-4 font-heading text-3xl font-extrabold leading-tight md:text-4xl">
              Start with the part of your operation that costs you the most time.
            </h2>
            <p className="mb-8 max-w-xl text-lg leading-8 text-slate-300">
              PestFlow connects the route, field work, invoice, payment, and customer history. You do not need to trust a broad software promise—test the workflow your team actually uses.
            </p>

            <div className="mb-8 space-y-3">
              {PRODUCT_PROOF.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  <span className="text-slate-200">{item}</span>
                </div>
              ))}
            </div>

            <div className="grid max-w-xl gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-emerald-400"><CreditCard className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wider">Today</span></div>
                <p className="mt-3 text-2xl font-extrabold">$1 activation</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">Seven days with the real product. Your plan price is shown before checkout.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-emerald-400"><ShieldCheck className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wider">No lock-in</span></div>
                <p className="mt-3 text-2xl font-extrabold">Cancel anytime</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">Keep control of the trial and ask for human setup help only if you want it.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-lg sm:p-8"
          >
            <div className="mb-4 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Two ways to start
            </div>
            <h3 className="text-2xl font-extrabold leading-tight">Try PestFlow yourself—or map the first workflow with us.</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">Self-serve stays primary. A real person is available before you download or migrate anything.</p>

            <div className="mt-7 space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Self-serve</p>
                <h4 className="mt-2 text-xl font-bold">Use the real product for $1</h4>
                <p className="mt-2 text-sm leading-6 text-slate-400">Build a route, send a test invoice, and invite one teammate during the seven-day trial.</p>
                <Link href="/onboarding" className="mt-5 block">
                  <Button
                    onClick={() => analytics.track(EVENTS.LANDING.CTA_CLICK, { cta: "leadgen_start_for_1" })}
                    className="h-12 w-full bg-emerald-600 font-bold text-white hover:bg-emerald-500"
                  >
                    Start for $1 <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Guided</p>
                <h4 className="mt-2 text-xl font-bold">Book a 15-minute setup call</h4>
                <p className="mt-2 text-sm leading-6 text-slate-400">Bring one route, billing, field, or migration problem. We will show that workflow—no generic sales deck.</p>
                <a
                  href={PESTFLOW_CALENDLY_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => analytics.track("Calendar Opened", { source: "trust_section" })}
                  className="mt-5 flex h-12 w-full items-center justify-center rounded-lg border border-white/15 bg-white/5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <CalendarDays className="mr-2 h-4 w-4" /> Book setup call
                </a>
              </div>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-slate-500">No phone number required for the popup recommendation. Calendly asks only for the details needed to schedule your call.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
