import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, ShieldCheck, Bug, SprayCan, Search, Smartphone, Home, Calendar, Building2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Input } from "@/components/ui/input";
import videoBackground from "@assets/generated_videos/background_video_of_nature_and_pests_for_pest_control_software.mp4";

export function Hero() {
  const demoLink = "https://calendly.com/tgicheru21/30min";
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <section className="relative w-full h-screen min-h-[800px] overflow-hidden">
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
            We help you be the <br />
            <span className="text-emerald-400">BEST</span> in <span className="text-blue-400">PEST</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 items-center justify-center pt-8"
          >
            <Link href="/onboarding">
              <Button size="xl" className="h-16 px-10 text-xl font-bold shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/40 bg-gradient-to-r from-emerald-500 to-blue-600 border-none group text-white">
                Start Trial <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Button asChild variant="outline" size="xl" className="h-16 px-10 text-xl font-semibold bg-white/10 text-white border-white/20 hover:bg-white hover:text-slate-900 backdrop-blur-md transition-all duration-300">
              <a href={demoLink} target="_blank" rel="noopener noreferrer">
                <PlayCircle className="mr-2 h-6 w-6" /> Watch Demo
              </a>
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
               {/* Placeholder Logos - In a real app these would be SVGs */}
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
               <div className="flex items-center gap-2">
                 <Building2 className="w-8 h-8 text-white" />
                 <span className="text-xl font-bold text-white">UrbanShield</span>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
