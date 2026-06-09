import { Link } from "wouter";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-secondary/30 border-t py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <img src={logoImage} alt="PestFlow" className="h-10 w-auto mix-blend-multiply" />
            <p className="text-muted-foreground text-sm max-w-xs">
              The complete operating system for modern pest control businesses. Schedule, dispatch, and get paid—all in one place.
            </p>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors cursor-pointer">Features</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="hover:text-primary transition-colors cursor-pointer">Pricing</button></li>
              <li><a href="https://apps.apple.com/us/app/pestflow/id6773204838" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors cursor-pointer">Mobile App</a></li>
              <li><span className="text-muted-foreground/50">Integrations</span></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><span className="text-muted-foreground/50">About Us</span></li>
              <li><span className="text-muted-foreground/50">Careers</span></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors cursor-pointer">Blog</Link></li>
              <li><span className="text-muted-foreground/50">Contact</span></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/support" className="hover:text-primary transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t text-center md:text-left flex flex-col gap-4 md:flex-row md:justify-between md:items-center text-sm text-muted-foreground">
          <div>
            <p>&copy; {new Date().getFullYear()} Reflectly AI, Inc. All rights reserved.</p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              PestFlow is a product operated by Reflectly AI, Inc., a Texas-based company.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs md:justify-end">
            <Link href="/support" className="hover:text-primary transition-colors">
              Support
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a
              href="https://app.pestflow.org/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
