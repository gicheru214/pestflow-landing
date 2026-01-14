import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/fa047a48-9d16-4d41-b933-c7508833c965_1768347009427.jpg";

export function Navbar() {
  const stripeLink = "https://buy.stripe.com/cNi28q7XZ9XB5LRcH6dfG06";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <img src={logoImage} alt="PestFlow" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About Us
          </a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Log in
          </Link>
          <Button asChild size="lg" className="font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            <a href={stripeLink} target="_blank" rel="noopener noreferrer">
              Start Trial
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
}
