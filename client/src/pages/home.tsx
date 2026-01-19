import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { Pricing } from "@/components/home/pricing";
import { CTA } from "@/components/home/cta";
import { LeadGen } from "@/components/home/lead-gen";
import { AutoPopup } from "@/components/home/auto-popup";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <AutoPopup />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <LeadGen />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
