import { Button } from "@/components/ui/button";
import { Check, Bug, MousePointer2 } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const PRICING_PLANS = [
  {
    name: "Starter",
    price: "49",
    description: "Perfect for growing pest control businesses.",
    features: [
      "Up to 2 Technicians",
      "Scheduling & Dispatching",
      "Invoicing & Payments",
      "Basic Reporting",
      "Mobile App Access"
    ],
    popular: false
  },
  {
    name: "Growth",
    price: "99",
    description: "Advanced tools for scaling operations.",
    features: [
      "Up to 5 Technicians",
      "Route Optimization",
      "Customer Portal",
      "Review Generation",
      "QuickBooks Integration",
      "Advanced Reporting"
    ],
    popular: true
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative bugs */}
      <div className="absolute top-10 left-10 opacity-5 rotate-45">
        <Bug className="w-24 h-24" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-5 -rotate-12">
        <MousePointer2 className="w-32 h-32" />
      </div>

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading text-slate-900">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-600">
              Choose the plan that fits your business stage. All plans come with a 14-day free trial.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PRICING_PLANS.map((plan, index) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`relative rounded-3xl p-8 bg-white border ${plan.popular ? 'border-primary shadow-2xl scale-105 z-10 ring-4 ring-primary/10' : 'border-slate-200 shadow-lg'} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-emerald-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg tracking-wide uppercase">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2 text-slate-900">{plan.name}</h3>
                <p className="text-slate-500 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-slate-900">${plan.price}</span>
                  <span className="text-slate-500 font-medium">/mo</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5 text-emerald-700" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/onboarding">
                <Button className={`w-full h-12 text-lg font-bold ${plan.popular ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20' : 'bg-slate-900 hover:bg-slate-800'} transition-all hover:scale-[1.02]`} size="lg">
                  Start Free Trial
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
