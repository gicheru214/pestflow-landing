import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Wrench, Building2 } from "lucide-react";

const GOOGLE_CLIENT_ID = "65383864801-kd754q4cjeep88638fus0e48kib9s4ts.apps.googleusercontent.com";

function initGoogle(callback: (r: { credential: string }) => void) {
  const w = window as any;
  if (w.google?.accounts?.id) {
    w.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback, context: "signin" });
    return;
  }
  if (!document.getElementById("pf-gsi3")) {
    const s = document.createElement("script");
    s.id = "pf-gsi3";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true; s.defer = true;
    s.onload = () => (window as any).google?.accounts?.id?.initialize({ client_id: GOOGLE_CLIENT_ID, callback, context: "signin" });
    document.head.appendChild(s);
  }
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleErr, setGoogleErr] = useState("");

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
            >
              {/* Brand header */}
              <div className="px-8 py-5 flex items-center gap-3" style={{ background: "#1ECFC8" }}>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span className="font-bold text-white text-sm tracking-tight">PestFlow for Technicians</span>
              </div>

              <div className="p-8 pt-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                  Are you a technician or a business owner?
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Pest control techs use PestFlow free — always. Tell us who you are.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => setStep("lead")}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-[#1ECFC8] hover:bg-teal-50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: "#e6fafa" }}>
                      <Wrench className="w-5 h-5" style={{ color: "#1ECFC8" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm">I'm a Field Technician</div>
                      <div className="text-xs text-slate-500">Free account — stay organized on every job</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1ECFC8] transition-colors flex-shrink-0" />
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

                {/* ── Returning user sign-in ── */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-center text-[11px] text-slate-400 mb-2 font-medium uppercase tracking-wide">Returning user?</p>
                  <button
                    onClick={() => {
                      initGoogle((r) => {
                        fetch("/api/auth/google", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ credential: r.credential }),
                        }).then((res) => {
                          if (res.ok) window.location.href = "/dashboard";
                          else window.location.href = "/login";
                        }).catch(() => { window.location.href = "/login"; });
                      });
                      setTimeout(() => (window as any).google?.accounts?.id?.prompt(), 200);
                    }}
                    className="w-full flex items-center justify-center gap-2.5 h-9 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-[13px] font-medium text-slate-700 mb-2"
                  >
                    <GoogleIcon />
                    Sign in with Google
                  </button>
                  <a
                    href="/login"
                    className="block text-center text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Or sign in with email →
                  </a>
                </div>
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
            >
              {/* Brand header */}
              <div className="px-7 py-5 flex items-center gap-3" style={{ background: "#1ECFC8" }}>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm leading-tight">PestFlow Tech — Free</div>
                  <div className="text-white/80 text-[11px]">Built for field technicians</div>
                </div>
              </div>

              <div className="p-7 pt-5">
                <button
                  onClick={() => setStep("role")}
                  className="text-xs text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1 transition-colors"
                >
                  ‹ Back
                </button>

                <h2 className="text-lg font-bold text-slate-900 mb-1">Claim your free tech account</h2>
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

                  <Field label="Phone Number" error={errors.phone}>
                    <Input
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={form.phone}
                      onChange={e => set("phone", e.target.value)}
                      className={errors.phone ? "border-red-400" : ""}
                    />
                  </Field>

                  <Field label="Business You Work For" error={errors.employer}>
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
              </div>
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
