import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function CTA() {
  return (
    <section className="py-32 bg-primary relative overflow-hidden">
      {/* Refined Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="container relative mx-auto px-4 md:px-6 text-center text-primary-foreground">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading tracking-tight">
          Ready to grow your pest control business?
        </h2>
        <p className="text-xl md:text-2xl opacity-90 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          Start with the workflow slowing you down most. Use the full product for seven days before deciding if it belongs in your operation.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/onboarding">
            <Button size="xl" variant="secondary" className="h-16 px-12 text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300 bg-white text-primary hover:bg-slate-50 border-0">
              Start for $1 <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </div>
        
        <p className="mt-8 text-sm opacity-80 font-medium tracking-wide">
          $1 today • 7-day full-product trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}
