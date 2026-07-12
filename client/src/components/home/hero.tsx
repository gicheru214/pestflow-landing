import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import videoBackground from "@assets/generated_videos/pest_control_professional_suburban.mp4";
import { useState } from "react";
import { DemoVideoModal, PESTFLOW_CALENDLY_URL } from "./auto-popup";
import { analytics, EVENTS } from "@/lib/analytics";

export function Hero({ variant }: { variant?: "tech" } = {}) {
  const isTech = variant === "tech";
  const [showDemo, setShowDemo] = useState(false);
  const intent = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("intent") : null;

  const message = (() => {
    if (isTech) {
      return {
        badge: "FREE FOR FIELD TECHNICIANS",
        headline: <>Pest control techs <span className="text-emerald-400">work free</span> <br className="hidden sm:block" />with PestFlow.</>,
        body: "Job sheets, customer notes, and your daily schedule — all in your pocket. Free for field technicians, no credit card ever.",
      };
    }
    if (intent === "routes") {
      return {
        badge: "PEST CONTROL ROUTING SOFTWARE",
        headline: <>Build tighter routes <span className="text-emerald-400">before the first truck rolls.</span></>,
        body: "Recurring stops, service windows, technician assignments, and day-of changes stay in one route board built for pest control.",
      };
    }
    if (intent === "billing") {
      return {
        badge: "PEST CONTROL BILLING SOFTWARE",
        headline: <>Finish the service. <span className="text-emerald-400">Get paid faster.</span></>,
        body: "Connect completed work, invoices, recurring cards, and payment follow-up without rebuilding the job in another system.",
      };
    }
    if (intent === "field") {
      return {
        badge: "PEST CONTROL FIELD SOFTWARE",
        headline: <>Know what’s happening <span className="text-emerald-400">in the field.</span></>,
        body: "Technician status, customer notes, photos, service proof, and office communication stay connected from the truck.",
      };
    }
    if (intent === "switching") {
      return {
        badge: "SWITCH TO PESTFLOW",
        headline: <>Switch software <span className="text-emerald-400">without risking the workweek.</span></>,
        body: "Test one real PestFlow workflow first, keep your current system running, and get human help when you are ready to move more.",
      };
    }
    return {
      badge: "PEST CONTROL SOFTWARE",
      headline: <>Run your <span className="text-emerald-400">pest control</span> business <br className="hidden sm:block" />from the truck.</>,
      body: "Drag-and-drop route board, recurring billing, technician GPS, automated review requests, and a branded customer portal — built for pest control owners scaling past $1M.",
    };
  })();

  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      <DemoVideoModal open={showDemo} onOpenChange={setShowDemo} />
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoBackground} type="video/mp4" />
        </video>
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-transparent" />
      </div>

      <div className="container relative h-full mx-auto px-4 md:px-6 z-10 flex flex-col justify-center items-center text-center">
        <div className="w-full min-w-0 max-w-5xl space-y-8 flex flex-col items-center mt-20">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-center text-xs text-white font-medium backdrop-blur-md sm:text-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
            {message.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full break-words text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-white font-heading leading-[1.05] drop-shadow-lg"
          >
            {message.headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="w-full text-base sm:text-lg md:text-xl text-slate-200 max-w-3xl leading-relaxed drop-shadow"
          >
            {message.body}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-6"
          >
            <Link href="/onboarding">
              <Button 
                size="lg"
                className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-bold shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all duration-300 bg-emerald-600 hover:bg-emerald-700 border-none group text-white w-full sm:w-auto"
                onClick={() => analytics.track(EVENTS.LANDING.CTA_CLICK, { cta: "start_trial" })}
              >
                {isTech ? "Start Free" : "Start for $1"} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg"
              className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-semibold bg-white/10 text-white border-white/20 hover:bg-white hover:text-slate-900 backdrop-blur-md transition-all duration-300 w-full sm:w-auto"
              onClick={() => {
                analytics.track(EVENTS.LANDING.DEMO_REQUEST_START);
                setShowDemo(true);
              }}
            >
              <PlayCircle className="mr-2 h-5 w-5" /> Watch Demo
            </Button>
          </motion.div>

          {!isTech && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="flex w-full min-w-0 flex-col items-center gap-2 px-2"
            >
              <p className="text-xs font-medium text-slate-300 sm:text-sm">$1 today · 7-day full-product trial · Cancel anytime</p>
              <a
                href={PESTFLOW_CALENDLY_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => analytics.track("Calendar Opened", { source: "hero", intent: intent || "default" })}
                className="inline-flex max-w-full items-center justify-center gap-2 text-center text-sm font-semibold text-white/80 underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-white"
              >
                <CalendarDays className="h-4 w-4 text-emerald-400" /> Prefer help? Book a 15-minute PestFlow setup call
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
