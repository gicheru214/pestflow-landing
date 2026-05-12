import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, ShieldCheck, Bug, SprayCan } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import videoBackground from "@assets/generated_videos/pest_control_professional_suburban.mp4";
import { useState } from "react";
import { DemoVideoModal } from "./auto-popup";
import { analytics, EVENTS } from "@/lib/analytics";

export function Hero({ variant }: { variant?: "tech" } = {}) {
  const isTech = variant === "tech";
  const [showDemo, setShowDemo] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
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
        <div className="max-w-5xl space-y-8 flex flex-col items-center mt-20">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white font-medium backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
            {isTech ? "FREE FOR FIELD TECHNICIANS" : "PEST CONTROL SOFTWARE"}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-white font-heading leading-[1.05] drop-shadow-lg"
          >
            {isTech ? (
              <>Pest control techs <span className="text-emerald-400">work free</span> <br className="hidden sm:block" />with PestFlow.</>
            ) : (
              <>Run your <span className="text-emerald-400">pest control</span> business <br className="hidden sm:block" />from the truck.</>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-base sm:text-lg md:text-xl text-slate-200 max-w-3xl leading-relaxed drop-shadow"
          >
            {isTech
              ? "Job sheets, customer notes, and your daily schedule — all in your pocket. Free for field technicians, no credit card ever."
              : "Drag-and-drop route board, recurring billing, technician GPS, automated review requests, and a branded customer portal — built for pest control owners scaling past $1M."}
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
                Start Trial <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="pt-8 pb-4 flex flex-col items-center gap-4 w-full"
          >
            <p className="text-sm font-medium text-slate-300 uppercase tracking-widest">Trusted by 500+ Pest Control Companies</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="flex items-center gap-2">
                 <ShieldCheck className="w-8 h-8 text-white" />
                 <span className="text-xl font-bold text-white">TermiGuard</span>
               </div>
               <div className="flex items-center gap-2">
                 <Bug className="w-8 h-8 text-white" />
                 <span className="text-xl font-bold text-white">EcoPest</span>
               </div>
               <div className="flex items-center gap-2">
                 <SprayCan className="w-8 h-8 text-white" />
                 <span className="text-xl font-bold text-white">BugBusters</span>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
