import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Wrench, Building2 } from "lucide-react";

function pushTechLead(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify({ type: "tech_lead", ...payload });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/submissions", new Blob([body], { type: "application/json" }));
      return;
    }
    fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  } catch { /* ignore */ }
}

type Step = "role" | "lead";

export function TechPopup() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("role");
  const [form, setForm] = useState({ name: "", email: "", phone: "", employer: "", ownerName: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Auto-open after 2s (same pattern as AutoPopup)
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Reset step on open
  useEffect(() => { if (open) setStep("role"); }, [open]);

  const set = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.employer.trim()) e.employer = "We need the business name to set up your account";
    if (!form.ownerName.trim()) e.ownerName = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      employer: form.employer.trim(),
      ownerName: form.ownerName.trim(),
      role: "technician",
      source: "tech-landing",
      timestamp: new Date().toISOString(),
    };

    pushTechLead(payload);
    localStorage.setItem("pestflow_tech_lead", JSON.stringify(payload));

    const params = new URLSearchParams({
      type: "tech",
      name: payload.name,
      email: payload.email,
      employer: payload.employer,
    });
    window.location.href = `/signup-success?${params.toString()}`;
  };

  const handleOwnerChoice = () => {
    setOpen(false);
    window.location.href = "/";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-0 rounded-2xl shadow-2xl">
        <AnimatePresence mode="wait">

          {/* Step 1: Role gate */}
          {step === "role" && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1ECFC8" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span className="font-bold text-slate-800 text-sm tracking-tight">PestFlow</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                Are you a technician or a business owner?
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                We'll set up the right experience for you.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setStep("lead")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-[#1ECFC8] hover:bg-teal-50 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-200 transition-colors">
                    <Wrench className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm">I'm a Field Technician</div>
                    <div className="text-xs text-slate-500">Free account — stay organized on the job</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                </button>

                <button
                  onClick={handleOwnerChoice}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-[#F5A623] hover:bg-amber-50 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
                    <Building2 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm">I Own a Pest Control Business</div>
                    <div className="text-xs text-slate-500">Route optimization, invoicing, scheduling</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Tech lead capture */}
          {step === "lead" && (
            <motion.div
              key="lead"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="p-7"
            >
              <button
                onClick={() => setStep("role")}
                className="text-xs text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1 transition-colors"
              >
                ‹ Back
              </button>

              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1ECFC8" }}>
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-800 text-sm">PestFlow Tech — Free</span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-1 mt-3">Claim your free tech account</h2>
              <p className="text-xs text-slate-500 mb-5">Takes 30 seconds. No credit card, ever.</p>

              <div className="space-y-3">
                <Field label="Your Name" error={errors.name}>
                  <Input
                    placeholder="Mike Rodriguez"
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    className={errors.name ? "border-red-400" : ""}
                  />
                </Field>

                <Field label="Work Email" error={errors.email}>
                  <Input
                    type="email"
                    placeholder="mike@greenshieldpest.com"
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                    className={errors.email ? "border-red-400" : ""}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Any email works — just use your work one if you have it.</p>
                </Field>

                <Field label="Phone Number (optional)" error={errors.phone}>
                  <Input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                  />
                </Field>

                <Field label="Business You Work For *" error={errors.employer}>
                  <Input
                    placeholder="Green Shield Pest Control"
                    value={form.employer}
                    onChange={e => set("employer", e.target.value)}
                    className={errors.employer ? "border-red-400" : ""}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Required — we use this to set up your account.</p>
                </Field>

                <Field label="Business Owner's Name" error={errors.ownerName}>
                  <Input
                    placeholder="John Smith"
                    value={form.ownerName}
                    onChange={e => set("ownerName", e.target.value)}
                    className={errors.ownerName ? "border-red-400" : ""}
                  />
                </Field>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-5 py-5 text-sm font-bold rounded-xl text-white flex items-center justify-center gap-2"
                style={{ background: submitting ? "#a3a3a3" : "#1ECFC8" }}
              >
                {submitting ? "Setting up your account…" : (
                  <>Claim My Free Account <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>

              <p className="text-[10px] text-center text-slate-400 mt-3">
                100% free for field technicians. No card required.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}
