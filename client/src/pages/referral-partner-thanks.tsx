import { useEffect, useState } from "react";
import { ArrowRight, Check, Handshake } from "lucide-react";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";
import { completedReferralPartnerApplication, fireReferralPartnerApplicationOnce } from "@/lib/referralPartnerConversion";

export default function ReferralPartnerThanks() {
  const [completed] = useState(() => Boolean(completedReferralPartnerApplication()));

  useEffect(() => {
    document.title = completed ? "Application received | PestFlow Partners" : "Referral partners | PestFlow";
    if (!completed) return;

    // The base Pixel records PageView and Lead on this URL. The custom
    // partner event is sent only for a confirmed application.
    let attempts = 0;
    if (fireReferralPartnerApplicationOnce()) return;
    const retry = window.setInterval(() => {
      attempts += 1;
      if (fireReferralPartnerApplicationOnce() || attempts >= 10) window.clearInterval(retry);
    }, 150);
    return () => window.clearInterval(retry);
  }, [completed]);

  return <main className="flex min-h-screen flex-col bg-emerald-50 font-sans text-[#0d280a]">
    <header className="border-b border-emerald-200 bg-white">
      <div className="mx-auto flex h-24 max-w-6xl items-center px-5">
        <a href="/" aria-label="PestFlow home"><img src={logoImage} alt="PestFlow" className="h-24 w-auto object-contain sm:h-28" /></a>
      </div>
    </header>
    <section className="mx-auto flex w-full max-w-3xl flex-1 items-center px-5 py-16">
      <div className="w-full rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-[0_20px_80px_rgba(28,70,30,0.08)] sm:p-14">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
          {completed ? <Check className="h-8 w-8 text-emerald-600" /> : <Handshake className="h-8 w-8 text-emerald-600" />}
        </div>
        <p className="mt-7 text-xs font-black uppercase tracking-[0.16em] text-emerald-700">PestFlow referral partners</p>
        <h1 className="mt-3 font-heading text-4xl font-black tracking-tight sm:text-5xl">{completed ? "Application received." : "Interested in partnering?"}</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600">
          {completed
            ? "Thanks for telling us about your business. The PestFlow team will review your application and follow up about fit and commission terms. You don't need to send an owner introduction yet."
            : "The short application is on our referral partner page. Tell us about the pest control owners you already work with and when you could make a warm introduction."}
        </p>
        <a href="/referral-partners" className="mt-9 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700">
          {completed ? "Back to partner details" : "View partner application"}<ArrowRight className="h-5 w-5" />
        </a>
      </div>
    </section>
    <footer className="border-t border-emerald-200 bg-white px-5 py-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} Reflectly AI, Inc. · PestFlow · <a href="/privacy" className="underline">Privacy</a></footer>
  </main>;
}
