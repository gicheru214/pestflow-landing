import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { Pricing } from "@/components/home/pricing";
import { CTA } from "@/components/home/cta";
import { LeadGen } from "@/components/home/lead-gen";
import { TechPopup } from "@/components/home/tech-popup";
import { analytics, EVENTS } from "@/lib/analytics";
import { captureMarketingAttribution } from "@/lib/marketingAttribution";

export default function TechLanding() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);

    const attribution = captureMarketingAttribution(urlParams, hashParams);
    analytics.track(EVENTS.LANDING.PAGE_VIEW, {
      ...attribution,
      page: 'tech',
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <TechPopup />
      <Navbar />
      <main className="flex-grow">
        <Hero variant="tech" />
        <Features />
        <LeadGen />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
