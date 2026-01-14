import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  const stripeLink = "https://buy.stripe.com/cNi28q7XZ9XB5LRcH6dfG06";

  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pattern-grid-lg" />
      
      <div className="container relative mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Ready to grow your pest control business?
        </h2>
        <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-2xl mx-auto">
          Join thousands of pest control professionals who trust PestFlow to manage their operations.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="xl" variant="secondary" className="h-16 px-10 text-lg font-bold shadow-2xl hover:scale-105 transition-transform">
            <a href={stripeLink} target="_blank" rel="noopener noreferrer">
              Start Your Free Trial <ArrowRight className="ml-2 h-6 w-6" />
            </a>
          </Button>
        </div>
        
        <p className="mt-6 text-sm opacity-75">
          No credit card required for 14-day trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}
