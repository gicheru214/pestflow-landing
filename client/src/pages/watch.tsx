import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";
import { analytics, EVENTS } from "@/lib/analytics";

const DESKTOP_PRICING_URL = "https://app.pestflow.org/pricing";
const MOBILE_PRICING_URL = "https://app.pestflow.org/mobile/onboard/upgrade";

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  // UA sniff first (catches iOS/Android), then narrow viewport as fallback.
  const ua = navigator.userAgent || "";
  if (/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(ua)) return true;
  return window.matchMedia("(max-width: 767px)").matches;
}

export default function Watch() {
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    analytics.track(EVENTS.LANDING.PAGE_VIEW, { page: "watch" });
    // Reveal the Start Trial CTA after 30s so users have a chance to absorb the demo.
    const t = setTimeout(() => setShowCta(true), 30_000);
    return () => clearTimeout(t);
  }, []);

  const handleStartTrial = () => {
    const incoming = new URLSearchParams(window.location.search);
    const cached = (() => {
      try { return JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}"); }
      catch { return {} as Record<string, string>; }
    })();

    const out = new URLSearchParams();
    ["firstName", "lastName", "email", "phone", "routeCount", "routeMix", "routeDensity", "routeBottleneck"].forEach((k) => {
      const v = incoming.get(k) || cached[k];
      if (v) out.set(k, v);
    });

    // Forward the user's 15Q audit answers + their computed leak number so the
    // smart-pricing /tour can render a personalized Revenue Leak Report
    // instead of falling back to median-operator seed values.
    const quizRev = incoming.get("quiz_revenue") || cached.quizRevenue;
    if (quizRev) out.set("quiz_revenue", String(quizRev));
    try {
      if (cached.quizAnswers && typeof cached.quizAnswers === "object") {
        // Compact: indexedAnswers[i] = optIdx for question i
        const compact = Object.entries(cached.quizAnswers).reduce<Record<string, number>>(
          (acc, [k, v]: [string, any]) => {
            if (v && typeof v.val === "number") acc[k] = v.val;
            return acc;
          },
          {}
        );
        if (Object.keys(compact).length > 0) {
          out.set("qa", btoa(JSON.stringify(compact)));
        }
      }
    } catch { /* non-blocking */ }

    const target = isMobileDevice() ? MOBILE_PRICING_URL : DESKTOP_PRICING_URL;
    window.location.href = `${target}?${out.toString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="w-full bg-slate-950 border-b border-white/5 py-3">
        <div className="container mx-auto px-4 flex justify-center">
          <img src={logoImage} alt="PestFlow" className="h-9 w-auto object-contain" />
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-full px-3 py-1 mb-3">
              <span className="text-emerald-400 text-[11px] font-bold tracking-wider uppercase">Watch · 2 min</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight">
              See how PestFlow turns your answers into more revenue.
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
              Quick walk-through of the routes, recurring billing, and lead-capture features that drove the numbers in your quiz.
            </p>
          </div>

          <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/TB4__rmaNpE?autoplay=1&mute=1&rel=0"
              title="PestFlow Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          <div className="mt-6 text-center">
            <Button
              size="lg"
              className="px-10 py-7 text-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rounded-xl"
              onClick={handleStartTrial}
            >
              Start My 7-Day Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-xs text-slate-500 mt-3">
              {showCta
                ? "Choose the $150/month or $250/month plan on the next screen."
                : "Watching the demo? The trial button stays right here when you're ready."}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
