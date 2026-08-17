import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, ArrowRight, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { analytics, EVENTS } from "@/lib/analytics";
import { buildMobileFieldSuccessPath } from "@/lib/mobileFieldHandoff";

type Stage = "gate" | "form" | "exit";

export function LeadGen() {
  const [stage, setStage] = useState<Stage>("gate");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    routes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          companyName: `Routes: ${formData.routes || "unspecified"}`
        })
      });
      if (!response.ok) throw new Error("Submission failed");
      const saved = await response.json().catch(() => null) as {
        playbookDelivery?: { accepted?: boolean };
      } | null;
      if (saved?.playbookDelivery?.accepted === false) {
        throw new Error("Resend did not accept the playbook email");
      }

      analytics.identify(formData.email.trim(), {
        $email: formData.email.trim(),
        $name: `${formData.firstName} ${formData.lastName}`.trim(),
        routes: formData.routes,
      });
      analytics.track(EVENTS.LANDING.NEWSLETTER_SIGNUP, { routes: formData.routes });
      window.location.href = buildMobileFieldSuccessPath({
        source: "homepage_playbook",
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        routes: formData.routes,
        search: window.location.search,
      });
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const acceptGate = () => {
    analytics.track(EVENTS.LANDING.NEWSLETTER_SIGNUP, { gate: "owner_yes" });
    setStage("form");
  };

  const declineGate = () => {
    analytics.track(EVENTS.LANDING.POPUP_DISMISSED, { gate: "owner_no", source: "leadgen" });
    setStage("exit");
  };

  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-50" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px] opacity-50" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary-foreground font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Free 27-Point Owner Scorecard
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading mb-4 leading-tight">
              Find the revenue leaks hiding between the sale, the route, and the invoice.
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-lg">
              Score 27 operating checks across recurring revenue, route capacity, technician closeout, estimates, retention, and owner visibility.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-slate-200">A 0–2 score for every check, based on visible proof</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-slate-200">The exact records, owners, dates, and queues to look for</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-slate-200">A one-page, 7-day plan for fixing the three worst leaks</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 max-w-lg">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-extrabold text-emerald-400">27</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wide">Operating checks</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-extrabold text-emerald-400 flex items-center justify-center gap-0.5">
                  6 <Star className="w-4 h-4 fill-emerald-400" />
                </div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wide">Leak categories</div>
              </div>
            </div>

            <div className="max-w-lg rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-200">Every check asks for evidence another person can find. If the process only lives in someone’s memory, it does not earn the point.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl"
          >
            {stage === "gate" && (
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-emerald-300 mb-4">
                  One Quick Question
                </div>
                <h3 className="text-2xl font-extrabold mb-2 leading-tight">
                  Are you a pest control business owner?
                </h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Be honest. The next page is built for owners ready to make more money. If that's not you, no harm done.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={acceptGate}
                    size="lg"
                    className="w-full min-h-[56px] h-auto py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold whitespace-normal text-left leading-snug rounded-xl"
                  >
                    Yes — I'm a pest control owner and I want to make more money
                  </Button>
                  <Button
                    onClick={declineGate}
                    variant="outline"
                    size="lg"
                    className="w-full min-h-[52px] h-auto py-3 px-4 bg-transparent border-white/15 text-slate-400 hover:bg-white/5 hover:text-slate-200 font-medium whitespace-normal text-left leading-snug rounded-xl"
                  >
                    No — I'm not a pest control owner. Even if I was, I don't want to make more money
                  </Button>
                </div>

              </>
            )}

            {stage === "form" && (
              <>
                <h3 className="text-xl font-bold mb-2">Get the 27-point playbook</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Download it instantly, score your operation, and circle the three zeroes closest to cash or customer trust.
                </p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="first-name" className="text-sm font-medium text-slate-300">First Name</label>
                      <Input
                        id="first-name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="John"
                        required
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="last-name" className="text-sm font-medium text-slate-300">Last Name</label>
                      <Input
                        id="last-name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Doe"
                        required
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-300">Work Email</label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@yourcompany.com"
                      required
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="routes" className="text-sm font-medium text-slate-300">How many routes do you currently run?</label>
                    <select
                      id="routes"
                      value={formData.routes}
                      onChange={(e) => setFormData({ ...formData, routes: e.target.value })}
                      required
                      className="w-full h-10 rounded-md bg-slate-800/50 border border-slate-700 text-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="" disabled>Select one</option>
                      <option value="0">Just getting started (0 routes)</option>
                      <option value="1-2">1–2 routes</option>
                      <option value="3-5">3–5 routes</option>
                      <option value="6-10">6–10 routes</option>
                      <option value="11+">11+ routes</option>
                    </select>
                  </div>

                  <Button
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full min-h-[52px] h-auto py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base whitespace-normal leading-snug rounded-lg"
                  >
                    {isSubmitting ? "Preparing..." : (
                      <>Send Me The Revenue Leak Playbook <ArrowRight className="ml-2 h-4 w-4 shrink-0" /></>
                    )}
                  </Button>

                  <p className="text-xs text-center text-slate-500 mt-4">
                    Includes the $1M Playbook. We respect your inbox — unsubscribe anytime.
                  </p>
                </form>
              </>
            )}

            {stage === "exit" && (
              <>
                <h3 className="text-xl font-bold mb-3">No worries — this one's not for you.</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  The playbook and quiz are built specifically for pest control owners ready to grow. If that changes, you know where to find us.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setStage("gate")}
                  className="w-full bg-transparent border-white/15 text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  Actually, take me back
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
