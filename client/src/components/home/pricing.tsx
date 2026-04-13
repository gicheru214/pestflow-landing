import { motion } from "framer-motion";
import { Bug, MousePointer2 } from "lucide-react";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-10 left-10 opacity-5 rotate-45">
        <Bug className="w-24 h-24" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-5 -rotate-12">
        <MousePointer2 className="w-32 h-32" />
      </div>

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading text-slate-900">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600">
              Slide to your route count and see exactly what you'll pay. All plans include a 14-day free trial.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200"
        >
          <iframe
            src="https://pestflow-smart-pricing.lovable.app/embed/pricing"
            style={{ width: "100%", height: "800px", border: "none" }}
            title="PestFlow Pricing"
            allow="payment"
          />
        </motion.div>
      </div>
    </section>
  );
}
