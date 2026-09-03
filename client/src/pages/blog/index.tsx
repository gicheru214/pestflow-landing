import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BookOpen, CalendarDays, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { BLOG_POSTS } from "@/lib/blog-data";
import { BlogIndexCTA } from "@/components/blog/blog-layout";
import { analytics, EVENTS } from "@/lib/analytics";
import { buildSoroArticleCalendlyUrl } from "@shared/calendly-url";

const SORO_EMBED_SCRIPT_ID = "pestflow-soro-blog-embed";
const SORO_EMBED_SRC =
  "https://app.trysoro.com/api/embed/6ef964cf-c53d-45a7-8c8f-c00c065bee13";
const BLOG_TITLE = "Pest Control Business Guides & Templates | PestFlow Blog";
const BLOG_DESCRIPTION =
  "Pest control software guides for owners comparing scheduling, routing, CRM, billing, field operations, reporting, inventory, and automation.";

function SoroArticleCTA({ articleSlug }: { articleSlug: string }) {
  const calendlyUrl = buildSoroArticleCalendlyUrl(articleSlug);

  const trackClick = (cta: "book_demo" | "explore_pestflow", destination: string) => {
    const properties = {
      cta: `soro_article_${cta}`,
      placement: "soro_article_end",
      post: articleSlug,
      destination,
    };
    analytics.track(EVENTS.LANDING.CTA_CLICK, properties);
    if (cta === "book_demo") {
      analytics.track(EVENTS.LANDING.DEMO_REQUEST_START, properties);
    }
  };

  return (
    <aside
      className="mt-10 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-7 shadow-sm md:p-10"
      aria-labelledby="soro-article-cta-heading"
      data-pestflow-soro-cta={articleSlug}
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700">
        <CalendarDays className="h-3.5 w-3.5" />
        See PestFlow in action
      </div>
      <h2
        id="soro-article-cta-heading"
        className="mt-4 text-2xl font-bold font-heading tracking-tight text-foreground md:text-3xl"
      >
        Ready to make this easier in your business?
      </h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Book a PestFlow demo and we’ll show you how scheduling, routes, billing,
        technician workflows, and customer communication work together for your team.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          asChild
          size="lg"
          className="group w-full bg-emerald-600 font-bold text-white shadow-lg hover:bg-emerald-700 sm:w-auto"
        >
          <a
            href={calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick("book_demo", "calendly")}
          >
            Book a demo
            <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full bg-white sm:w-auto">
          <Link
            href="/"
            onClick={() => trackClick("explore_pestflow", "pestflow_home")}
          >
            Explore PestFlow
          </Link>
        </Button>
      </div>
    </aside>
  );
}

function SoroBlogEmbed() {
  const [articleSlug, setArticleSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!articleSlug) return;
    analytics.track(EVENTS.LANDING.PAGE_VIEW, {
      page: "soro_blog_article",
      post: articleSlug,
    });
  }, [articleSlug]);

  useEffect(() => {
    const target = document.getElementById("soro-blog");
    if (!target) return;

    let syncTimer: number | undefined;
    const syncArticle = () => {
      window.clearTimeout(syncTimer);
      syncTimer = window.setTimeout(() => {
        const hasRenderedArticle = Boolean(target.querySelector(".soro-blog-article"));
        const currentSlug = new URLSearchParams(window.location.search).get("post")?.trim();
        setArticleSlug(hasRenderedArticle && currentSlug ? currentSlug : null);
      }, 0);
    };

    const observer = new MutationObserver(syncArticle);
    observer.observe(target, { childList: true, subtree: true });
    window.addEventListener("popstate", syncArticle);

    // The target exists before this effect runs, so Soro can render into it
    // immediately. Reload the script whenever the SPA returns to /blog.
    document.getElementById(SORO_EMBED_SCRIPT_ID)?.remove();

    const script = document.createElement("script");
    script.id = SORO_EMBED_SCRIPT_ID;
    script.src = SORO_EMBED_SRC;
    script.defer = true;
    document.body.appendChild(script);
    syncArticle();

    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", syncArticle);
      window.clearTimeout(syncTimer);
      script.remove();
    };
  }, []);

  return (
    <section className="container mx-auto max-w-5xl px-4 py-16 md:px-6" aria-labelledby="latest-guides-heading">
      <h2 id="latest-guides-heading" className="mb-6 text-sm font-semibold uppercase tracking-widest text-emerald-700">
        Latest guides
      </h2>
      <div id="soro-blog" className="min-h-48" aria-live="polite">
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          Loading the latest PestFlow articles…
        </div>
      </div>
      {articleSlug ? <SoroArticleCTA articleSlug={articleSlug} /> : null}
    </section>
  );
}

export default function BlogIndex() {
  useEffect(() => {
    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    const syncBlogHead = () => {
      const isArticle = Boolean(new URLSearchParams(window.location.search).get("post"));
      const canonicals = Array.from(
        document.querySelectorAll('link[rel="canonical"]'),
      ) as HTMLLinkElement[];

      if (isArticle) {
        const soroCanonical = canonicals.find((tag) => tag.hasAttribute("data-soro"));
        if (soroCanonical) {
          canonicals.forEach((tag) => {
            if (tag !== soroCanonical) tag.remove();
          });
        }
        return;
      }

      document.title = BLOG_TITLE;
      setMeta("description", BLOG_DESCRIPTION);
      let canonical = canonicals[0];
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.removeAttribute("data-soro");
      canonical.href = "https://pestflow.org/blog";
      canonicals.slice(1).forEach((tag) => tag.remove());
    };

    const queueHeadSync = () => window.setTimeout(syncBlogHead, 0);
    const originalPushState = history.pushState;
    const patchedPushState: History["pushState"] = function (this: History, ...args) {
      originalPushState.apply(this, args);
      queueHeadSync();
    };
    history.pushState = patchedPushState;
    window.addEventListener("popstate", queueHeadSync);

    const headObserver = new MutationObserver(queueHeadSync);
    headObserver.observe(document.head, { childList: true });
    syncBlogHead();

    const initialArticle = new URLSearchParams(window.location.search).get("post");
    if (!initialArticle) {
      analytics.track(EVENTS.LANDING.PAGE_VIEW, { page: "blog_index" });
    }

    return () => {
      headObserver.disconnect();
      window.removeEventListener("popstate", queueHeadSync);
      if (history.pushState === patchedPushState) history.pushState = originalPushState;
    };
  }, []);

  const featured = BLOG_POSTS[0];
  const rest = BLOG_POSTS.slice(1);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <Navbar />
      <main className="flex-grow">
        <section className="border-b bg-secondary/30">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl py-16 md:py-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold mb-6">
              <BookOpen className="w-3 h-3" />
              PestFlow Learn
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight leading-[1.05] mb-6">
              Pest control software{" "}
              <span className="text-emerald-700">guides built for owners.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
              Compare scheduling, routing, CRM, billing, technician workflows, reporting, inventory,
              automation, and the operational details that matter before you choose a system.
            </p>
          </div>
        </section>

        <SoroBlogEmbed />

        <section className="container mx-auto px-4 md:px-6 max-w-5xl py-16">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-700 mb-4">
            Featured guide
          </h2>
          <Link
            href={`/blog/${featured.slug}`}
            className="block group rounded-2xl border bg-card overflow-hidden hover:border-emerald-400 hover:shadow-xl transition-all duration-300"
          >
            <div className="p-8 md:p-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold mb-4">
                {featured.category}
              </div>
              <h3 className="text-3xl md:text-4xl font-bold font-heading leading-tight mb-4 group-hover:text-emerald-700 transition-colors">
                {featured.title}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-3xl">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-x-6 gap-y-2 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {featured.readTime}
                </span>
                <span>Updated {featured.updated}</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read guide <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </section>

        <section className="container mx-auto px-4 md:px-6 max-w-5xl pb-16">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-700 mb-6">
            More guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-xl border bg-card p-6 md:p-8 hover:border-emerald-400 hover:shadow-lg transition-all duration-200"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-semibold mb-3">
                  {post.category}
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-heading leading-snug mb-3 group-hover:text-emerald-700 transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 md:px-6 max-w-5xl pb-20">
          <BlogIndexCTA />
        </section>
      </main>
      <Footer />
    </div>
  );
}
