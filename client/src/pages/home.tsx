import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { Pricing } from "@/components/home/pricing";
import { CTA } from "@/components/home/cta";
import { LeadGen } from "@/components/home/lead-gen";
import { Widgets } from "@/components/home/widgets";
import { AutoPopup } from "@/components/home/auto-popup";
import { IntentFirstPopup } from "@/components/home/intent-first-popup";
import { JtbdPopup } from "@/components/home/jtbd-popup";
import { MobileDownloadBanner } from "@/components/home/mobile-download-banner";
import { analytics, EVENTS } from "@/lib/analytics";

export default function Home() {
  const requestedFunnel = useMemo(
    () =>
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("funnel")
        : null,
    [],
  );
  const [experimentFunnel, setExperimentFunnel] = useState<string | null>(null);
  const selectedFunnel = requestedFunnel || experimentFunnel;

  useEffect(() => {
    if (requestedFunnel || !window.posthog?.onFeatureFlags) return;

    const applyFeatureFlag = () => {
      const assignment = window.posthog?.getFeatureFlag?.("activation-entry-v1");
      if (assignment !== "control" && assignment !== "jtbd") return;
      setExperimentFunnel((current) => {
        if (current === assignment) return current;
        analytics.track("Activation Entry Experiment Assigned", {
          experiment: "activation-entry-v1",
          funnel_variant: assignment,
        });
        return assignment;
      });
    };

    applyFeatureFlag();
    const unsubscribe = window.posthog.onFeatureFlags(applyFeatureFlag);
    return typeof unsubscribe === "function" ? unsubscribe : undefined;
  }, [requestedFunnel]);

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
      {selectedFunnel === "intent-first" ? (
        <IntentFirstPopup />
      ) : selectedFunnel === "jtbd" ? (
        <JtbdPopup />
      ) : selectedFunnel === "control" ? null : (
        <AutoPopup />
      )}
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
