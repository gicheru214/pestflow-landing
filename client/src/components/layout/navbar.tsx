import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/generated_images/modern_pestflow_saas_logo.png";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            {/* Using mix-blend-multiply to simulate transparency for white-bg logo on light header */}
            <img 
              src={logoImage} 
              alt="PestFlow" 
              className="h-24 w-auto object-contain mix-blend-multiply scale-150 origin-left" 
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Log in
          </Link>
          <Link href="/onboarding">
            <Button size="lg" className="font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              Start Trial
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
