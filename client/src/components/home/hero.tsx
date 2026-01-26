import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, ShieldCheck, Bug, SprayCan } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import videoBackground from "@assets/generated_videos/pest_control_professional_suburban.mp4";
import { useState } from "react";
import { DemoVideoModal } from "./auto-popup";

export function Hero() {
  const [showDemo, setShowDemo] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <section className="relative w-full h-screen min-h-[800px] overflow-hidden">
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
            PEST CONTROL SOFTWARE
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl text-white font-heading leading-[1.1] drop-shadow-lg"
          >
            Software for <br />
            <span className="text-emerald-400">pest control</span> businesses
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 items-center justify-center pt-8"
          >
            <Link href="/onboarding">
              <Button size="xl" className="h-16 px-10 text-xl font-bold shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/40 bg-emerald-600 hover:bg-emerald-700 border-none group text-white">
                Start Trial <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="xl" 
              className="h-16 px-10 text-xl font-semibold bg-white/10 text-white border-white/20 hover:bg-white hover:text-slate-900 backdrop-blur-md transition-all duration-300"
              onClick={() => setShowDemo(true)}
            >
              <PlayCircle className="mr-2 h-6 w-6" /> Watch Demo
            </Button>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="pt-16 pb-8 flex flex-col items-center gap-6 w-full"
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
