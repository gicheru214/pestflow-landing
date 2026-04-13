import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

export function Navbar() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-24 items-center justify-between mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <img 
              src={logoImage} 
              alt="PestFlow" 
              className="h-28 w-auto object-contain" 
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection('features')} 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('pricing')} 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Pricing
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hidden md:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
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
