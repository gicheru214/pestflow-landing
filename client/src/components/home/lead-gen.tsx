import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { analytics, EVENTS } from "@/lib/analytics";

export function LeadGen() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          companyName: "N/A (Newsletter)"
        })
      });
      
      analytics.track(EVENTS.LANDING.NEWSLETTER_SIGNUP);
      window.location.href = "/onboarding";
      
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background decoration */}
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
              Free Resource
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading mb-4">
              The Ultimate Guide to Growing Your Pest Control Business
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-lg">
              Download our free 40-page playbook on how top pest control companies are scaling their operations in 2026.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-200">Strategies for recurring revenue growth</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-200">Technician compensation templates</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-200">Marketing checklists for seasonal pests</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-2">Get your free copy</h3>
            <p className="text-slate-400 text-sm mb-6">
              Join 5,000+ pest control owners who read our newsletter.
            </p>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="first-name" className="text-sm font-medium text-slate-300">First Name</label>
                  <Input 
                    id="first-name" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@company.com" 
                  required
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500" 
                />
              </div>

              <Button disabled={isSubmitting} size="lg" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 text-base">
                {isSubmitting ? "Sending..." : "Send Me The Guide"}
              </Button>
              
              <p className="text-xs text-center text-slate-500 mt-4">
                We respect your inbox. Unsubscribe at any time.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
