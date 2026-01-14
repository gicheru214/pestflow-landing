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

      <div className="container relative h-full mx-auto px-4 md:px-6 z-10 flex flex-col justify-center">
        <div className="max-w-4xl space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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
            className="text-6xl font-extrabold tracking-tight sm:text-7xl md:text-8xl text-white font-heading leading-[1.1] drop-shadow-lg"
          >
            Everything You Need <br />
            to be the <span className="text-emerald-400">BEST</span> in <span className="text-blue-400">PEST</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-2 flex items-center gap-2"
          >
            <Search className="w-5 h-5 text-slate-400 ml-3" />
            <Input 
              type="text" 
              placeholder="Search for your Feature..." 
              className="border-none shadow-none text-lg h-12 focus-visible:ring-0 placeholder:text-slate-400"
            />
            <Link href="/onboarding">
              <Button size="icon" className="h-12 w-12 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors">
                <ArrowRight className="h-6 w-6" />
              </Button>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white font-medium hover:bg-white/20 transition-colors cursor-default">
              <Building2 className="w-4 h-4 text-blue-300" />
              Commercial
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white font-medium hover:bg-white/20 transition-colors cursor-default">
              <Smartphone className="w-4 h-4 text-blue-300" />
              Mobile App
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white font-medium hover:bg-white/20 transition-colors cursor-default">
              <Home className="w-4 h-4 text-emerald-300" />
              Residential
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white font-medium hover:bg-white/20 transition-colors cursor-default">
              <Calendar className="w-4 h-4 text-blue-300" />
              Scheduling
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="pt-8 flex items-center gap-6"
          >
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold bg-white/10 text-white border-white/20 hover:bg-white hover:text-slate-900 backdrop-blur-md transition-all duration-300">
              <a href={demoLink} target="_blank" rel="noopener noreferrer">
                <PlayCircle className="mr-2 h-6 w-6" /> Watch Demo
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
