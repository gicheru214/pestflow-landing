import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { Pricing } from "@/components/home/pricing";
import { CTA } from "@/components/home/cta";
import { LeadGen } from "@/components/home/lead-gen";
import { Widgets } from "@/components/home/widgets";
import { AutoPopup } from "@/components/home/auto-popup";
import { MobileDownloadBanner } from "@/components/home/mobile-download-banner";
import { analytics, EVENTS } from "@/lib/analytics";
import { captureMarketingAttribution } from "@/lib/marketingAttribution";

export default function Home() {
  useEffect(() => {
    // Save UTM params for later use in signup tracking
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    
    const attribution = captureMarketingAttribution(urlParams, hashParams);
    analytics.track(EVENTS.LANDING.PAGE_VIEW, {
      ...attribution,
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <AutoPopup />
      <MobileDownloadBanner />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <LeadGen />
        <Widgets />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
