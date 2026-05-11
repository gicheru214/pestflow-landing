import { useState, useEffect } from "react";
import { TechPopup } from "@/components/home/tech-popup";
import { CheckCircle2, Calendar, Briefcase, Users, Receipt, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: Briefcase, label: "Track Your Jobs", desc: "See today's schedule, log work notes, mark jobs done" },
  { icon: Calendar, label: "Your Daily Schedule", desc: "Know where you need to be and when — no back-and-forth texts" },
  { icon: Users, label: "Customer Info", desc: "Access service history and site details at the address" },
  { icon: Receipt, label: "Quick Invoicing", desc: "Send invoices from the job site — get paid faster" },
];

export default function TechLanding() {
  const [popupOpen, setPopupOpen] = useState(false);

  // Auto-open popup after 1.5s on mobile, 2.5s on desktop
  useEffect(() => {
    const delay = window.innerWidth < 768 ? 1500 : 2500;
    const t = setTimeout(() => setPopupOpen(true), delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1E35] text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1ECFC8" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-bold text-white text-sm tracking-tight">PestFlow <span style={{ color: "#1ECFC8" }}>Tech</span></span>
        </div>
        <button
          onClick={() => setPopupOpen(true)}
          className="text-xs font-semibold px-4 py-2 rounded-full text-[#0F1E35] transition-opacity hover:opacity-90"
          style={{ background: "#1ECFC8" }}
        >
          Get Free Access
        </button>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-14 max-w-lg mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border" style={{ background: "rgba(30,207,200,0.1)", borderColor: "rgba(30,207,200,0.3)", color: "#1ECFC8" }}>
          <CheckCircle2 className="w-3 h-3" />
          100% Free for Field Technicians
        </div>

        <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
          Stay organized.<br />
          <span style={{ color: "#1ECFC8" }}>Hit every job.</span>
        </h1>

        <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-sm">
          PestFlow Tech gives you a simple mobile app to track your jobs, schedule, customers, and invoices — no fluff, no fees.
        </p>

        <button
          onClick={() => setPopupOpen(true)}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-[#0F1E35] shadow-xl transition-transform active:scale-95 mb-3"
          style={{ background: "#1ECFC8", boxShadow: "0 8px 32px rgba(30,207,200,0.35)" }}
        >
          Claim My Free Account
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-xs text-slate-500">No credit card. No catch. Just for technicians.</p>
      </div>

      {/* Features */}
      <div className="px-5 pb-16 max-w-lg mx-auto w-full">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-5">What's included — free</p>
        <div className="grid grid-cols-1 gap-3">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(30,207,200,0.15)" }}>
                <Icon className="w-5 h-5" style={{ color: "#1ECFC8" }} />
              </div>
              <div>
                <div className="font-semibold text-white text-sm">{label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className="w-4 h-4" style={{ color: "#F5A623" }} viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-xs text-slate-400">"Finally an app that doesn't try to make me a manager" — field tech, Austin TX</p>
        </div>
      </div>

      {/* Bottom CTA bar */}
      <div className="sticky bottom-0 px-5 pb-6 pt-4" style={{ background: "linear-gradient(to top, #0F1E35 80%, transparent)" }}>
        <button
          onClick={() => setPopupOpen(true)}
          className="w-full py-4 rounded-2xl text-base font-bold text-[#0F1E35] flex items-center justify-center gap-2 transition-transform active:scale-95"
          style={{ background: "#1ECFC8", boxShadow: "0 8px 32px rgba(30,207,200,0.35)" }}
        >
          Get Free Access — Takes 30 Seconds
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <TechPopup open={popupOpen} onOpenChange={setPopupOpen} />
    </div>
  );
}
