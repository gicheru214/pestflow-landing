import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
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
          <Link
            href="/ai-tutor"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            AI Tutor
          </Link>
          <div className="group relative">
            <Link
              href="/competitors"
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Competitors <ChevronDown className="h-3.5 w-3.5" />
            </Link>
            <div className="invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded-xl border bg-white p-2 shadow-xl">
                <Link
                  href="/competitors"
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                >
                  All comparisons
                </Link>
                <Link
                  href="/competitors/fieldroutes"
                  className="block rounded-lg px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                >
                  PestFlow vs FieldRoutes
                </Link>
                <Link
                  href="/competitors/gorilladesk"
                  className="block rounded-lg px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                >
                  PestFlow vs GorillaDesk
                </Link>
              </div>
            </div>
          </div>
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
          <Link
            href="/blog"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Blog
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
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
