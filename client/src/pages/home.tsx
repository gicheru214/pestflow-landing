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

export default function Home() {
  useEffect(() => {
    // Save UTM params for later use in signup tracking
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    
    const utmSource = urlParams.get('utm_source') || hashParams.get('utm_source');
    const utmCampaign = urlParams.get('utm_campaign') || hashParams.get('utm_campaign');
    const utmContent = urlParams.get('utm_content') || hashParams.get('utm_content');
    
    if (utmSource) sessionStorage.setItem('utm_source', utmSource);
    if (utmCampaign) sessionStorage.setItem('utm_campaign', utmCampaign);
    if (utmContent) sessionStorage.setItem('utm_content', utmContent);
    
    analytics.track(EVENTS.LANDING.PAGE_VIEW, {
      utm_source: utmSource,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
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
