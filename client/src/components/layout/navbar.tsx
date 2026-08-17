import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <nav aria-label="Primary" className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
      <div className="container flex h-20 items-center justify-between mx-auto px-4 md:h-24 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="PestFlow home" className="flex items-center gap-2 cursor-pointer">
            <img 
              src={logoImage} 
              alt=""
              className="h-20 w-auto object-contain md:h-28"
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
          <a
            href="/#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Features
          </a>
          <a
            href="/#pricing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Pricing
          </a>
          <Link
            href="/blog"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Blog
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href="https://app.pestflow.org/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Log in
          </a>
          <Button asChild size="lg" className="hidden font-semibold shadow-lg hover:shadow-xl transition-all duration-300 sm:inline-flex">
            <Link href="/onboarding">
              Start Trial
            </Link>
          </Button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-primary-navigation"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileOpen((open) => !open)}
            className="grid min-h-11 min-w-11 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          >
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div id="mobile-primary-navigation" className="border-t bg-white px-4 py-4 shadow-lg md:hidden">
          <div className="container mx-auto grid gap-1">
            <Link href="/ai-tutor" onClick={() => setMobileOpen(false)} className="min-h-11 rounded-lg px-3 py-3 font-medium text-slate-700 hover:bg-slate-100">
              AI Tutor
            </Link>
            <a href="/#features" onClick={() => setMobileOpen(false)} className="min-h-11 rounded-lg px-3 py-3 font-medium text-slate-700 hover:bg-slate-100">
              Features
            </a>
            <a href="/#pricing" onClick={() => setMobileOpen(false)} className="min-h-11 rounded-lg px-3 py-3 font-medium text-slate-700 hover:bg-slate-100">
              Pricing
            </a>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="min-h-11 rounded-lg px-3 py-3 font-medium text-slate-700 hover:bg-slate-100">
              Blog
            </Link>
            <Button asChild size="lg" className="mt-2 w-full font-semibold sm:hidden">
              <Link href="/onboarding" onClick={() => setMobileOpen(false)}>Start Trial</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
