import { useEffect } from "react";
import { motion } from "framer-motion";

export function Pricing() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("lovable.app") && !event.origin.includes("testflow.org")) return;
      const data = event.data;
      if (!data) return;
      const url: string | undefined =
        typeof data === "string"
          ? data
          : data.url || data.href || data.checkoutUrl || data.stripeUrl;
      if (url && (url.includes("stripe.com") || url.startsWith("https://"))) {
        window.location.href = url;
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <section id="pricing" className="py-24 relative overflow-hidden" style={{ backgroundColor: "#f0fdf4" }}>
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
              Slide to your route count and see exactly what you'll pay. All plans include a 7-day free trial.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full overflow-hidden"
        >
          <iframe
            src="https://testflow.org/embed/pricing"
            scrolling="no"
            style={{
              width: "100%",
              height: "900px",
              border: "none",
              display: "block",
              overflow: "hidden",
              backgroundColor: "#f0fdf4",
            }}
            title="PestFlow Pricing"
            allow="payment"
          />
        </motion.div>
      </div>
    </section>
  );
}
