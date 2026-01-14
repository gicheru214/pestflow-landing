import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { TrialModal } from "./trial-modal";

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
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your business stage. All plans come with a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <div 
              key={plan.name}
              className={`relative rounded-2xl p-8 bg-white border ${plan.popular ? 'border-primary shadow-2xl scale-105 z-10' : 'border-border shadow-lg'} transition-all duration-300 hover:shadow-xl`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold shadow-md">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <TrialModal>
                <Button className={`w-full ${plan.popular ? 'bg-primary' : 'bg-slate-900'} hover:opacity-90 transition-opacity`} size="lg">
                  Start Trial
                </Button>
              </TrialModal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
