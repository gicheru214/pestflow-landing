import { Link } from "wouter";
import logoImage from "@assets/Screenshot_2026-01-13_at_7.27.30_PM-removebg-preview_1768354175011.png";

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
            <img src={logoImage} alt="PestFlow" className="h-8 w-auto mix-blend-multiply" />
            <p className="text-muted-foreground text-sm max-w-xs">
              The complete operating system for modern pest control businesses. Schedule, dispatch, and get paid—all in one place.
            </p>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors cursor-pointer">Features</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="hover:text-primary transition-colors cursor-pointer">Pricing</button></li>
              <li><span className="text-muted-foreground/50">Mobile App</span></li>
              <li><span className="text-muted-foreground/50">Integrations</span></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><span className="text-muted-foreground/50">About Us</span></li>
              <li><span className="text-muted-foreground/50">Careers</span></li>
              <li><span className="text-muted-foreground/50">Blog</span></li>
              <li><span className="text-muted-foreground/50">Contact</span></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><span className="text-muted-foreground/50">Privacy Policy</span></li>
              <li><span className="text-muted-foreground/50">Terms of Service</span></li>
              <li><span className="text-muted-foreground/50">Security</span></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PestFlow. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/admin" className="hover:text-primary transition-colors cursor-pointer">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
