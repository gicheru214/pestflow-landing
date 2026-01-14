import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, ShieldCheck, Bug, SprayCan } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export function Hero() {
  const demoLink = "https://calendly.com/tgicheru21/30min";
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <section className="relative w-full py-24 lg:py-40 overflow-hidden bg-gradient-to-b from-green-50/80 via-white to-white">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] opacity-60 animate-pulse" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[80px] opacity-60" />

      {/* Floating Pest Icons */}
      <motion.div style={{ y: y1 }} className="absolute top-20 left-[10%] opacity-20 hidden lg:block">
        <Bug className="w-12 h-12 text-primary rotate-12" />
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute bottom-40 right-[10%] opacity-20 hidden lg:block">
        <ShieldCheck className="w-16 h-16 text-emerald-600 -rotate-12" />
      </motion.div>
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 right-[20%] opacity-10 hidden lg:block"
      >
        <SprayCan className="w-20 h-20 text-blue-500 rotate-45" />
      </motion.div>

      <div className="container relative mx-auto px-4 md:px-6 z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-10">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/50 px-6 py-2 text-sm text-primary font-bold backdrop-blur-md shadow-lg"
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            The #1 Operating System for Pest Control
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl font-extrabold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl text-slate-900 font-heading leading-[1.05] drop-shadow-sm"
          >
            Kill Bugs. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600 relative inline-block">
              Grow Business.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Stop wrestling with paperwork and start growing your routes. PestFlow is the all-in-one platform built to automate your entire pest control operation.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 w-full justify-center pt-8"
          >
            <Link href="/onboarding">
              <Button size="xl" className="h-16 px-10 text-xl font-bold shadow-xl shadow-primary/25 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 bg-gradient-to-r from-primary to-emerald-600 border-none group">
                Start Free Trial <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Button asChild variant="outline" size="xl" className="h-16 px-10 text-xl font-semibold bg-white/80 backdrop-blur hover:bg-white hover:text-primary transition-all duration-300 border-2 border-slate-200 hover:border-primary/30 group">
              <a href={demoLink} target="_blank" rel="noopener noreferrer">
                <PlayCircle className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform" /> Watch Demo
              </a>
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="pt-10 flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-semibold text-slate-500"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>Cancel anytime</span>
            </div>
             <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>Instant setup</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
