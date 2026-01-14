import { Link } from "wouter";

// ... existing imports

export function Hero() {
  const demoLink = "https://calendly.com/tgicheru21/30min";

  return (
    <section className="relative w-full py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-green-50/50 via-white to-white">
      {/* Abstract Background Elements - refined for better aesthetics */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] opacity-60" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[80px] opacity-60" />

      <div className="container relative mx-auto px-4 md:px-6 z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium backdrop-blur-sm shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            The #1 Software for Pest Control Pros
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-foreground font-heading leading-[1.1]"
          >
            Grow Your Pest Control <br className="hidden md:block" />
            Business With <span className="text-primary relative inline-block">
              PestFlow
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light"
          >
            Streamline scheduling, automate billing, and empower your technicians with the all-in-one platform built specifically for the pest control industry.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-6"
          >
            <Link href="/onboarding">
              <Button size="xl" className="h-14 px-8 text-lg font-semibold shadow-xl shadow-primary/20 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30">
                Start Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Button asChild variant="outline" size="xl" className="h-14 px-8 text-lg bg-white/80 backdrop-blur hover:bg-white hover:text-primary transition-all duration-300 border-2 border-primary/10 hover:border-primary/20">
              <a href={demoLink} target="_blank" rel="noopener noreferrer">
                <PlayCircle className="mr-2 h-5 w-5" /> Watch Demo
              </a>
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="pt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Credit card required for verification</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
