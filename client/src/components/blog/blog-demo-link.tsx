import { useEffect, useMemo, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { analytics, EVENTS } from "@/lib/analytics";
import { buildPestFlowCalendlyUrl } from "@shared/calendly-url";

type BlogDemoLinkProps = {
  articleSlug: string;
  source: "soro" | "pestflow";
};

export function BlogDemoLink({ articleSlug, source }: BlogDemoLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const tracking = useMemo(() => {
    const article = source === "soro" ? "soro_article" : "blog_article";
    return {
      cta: article + "_book_demo",
      placement: article + "_intro",
      post: articleSlug,
      destination: "calendly",
    };
  }, [articleSlug, source]);

  useEffect(() => {
    const link = linkRef.current;
    if (!link || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio < 0.5) return;
      analytics.track(EVENTS.LANDING.BLOG_DEMO_LINK_VIEWED, tracking);
      observer.disconnect();
    }, { threshold: 0.5 });
    observer.observe(link);
    return () => observer.disconnect();
  }, [tracking]);

  const href = buildPestFlowCalendlyUrl({
    utmSource: "pestflow_blog",
    utmMedium: "website",
    utmCampaign: source === "soro" ? "soro_article_intro_demo" : "blog_article_intro_demo",
    utmContent: articleSlug,
  });

  const trackClick = () => {
    analytics.track(EVENTS.LANDING.CTA_CLICK, tracking);
    analytics.track(EVENTS.LANDING.DEMO_REQUEST_START, tracking);
  };

  return (
    <aside
      aria-label="PestFlow demo"
      data-pestflow-blog-demo={tracking.placement}
      className="not-prose my-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-950"
    >
      <span>See how PestFlow fits your pest control business.</span>
      <a
        ref={linkRef}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={trackClick}
        className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 underline decoration-emerald-400 underline-offset-4 hover:text-emerald-950"
      >
        Book a demo
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </a>
    </aside>
  );
}
