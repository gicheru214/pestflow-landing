import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BLOG_POSTS } from "@/lib/blog-data";
import { BlogIndexCTA } from "@/components/blog/blog-layout";
import { analytics, EVENTS } from "@/lib/analytics";

const SORO_EMBED_SCRIPT_ID = "pestflow-soro-blog-embed";
const SORO_EMBED_SRC =
  "https://app.trysoro.com/api/embed/6ef964cf-c53d-45a7-8c8f-c00c065bee13";

function SoroBlogEmbed() {
  useEffect(() => {
    // The target exists before this effect runs, so Soro can render into it
    // immediately. Reload the script whenever the SPA returns to /blog.
    document.getElementById(SORO_EMBED_SCRIPT_ID)?.remove();

    const script = document.createElement("script");
    script.id = SORO_EMBED_SCRIPT_ID;
    script.src = SORO_EMBED_SRC;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
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
    </section>
  );
}

export default function BlogIndex() {
  useEffect(() => {
    document.title = "Pest Control Business Guides & Templates | PestFlow Blog";
    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };
    setMeta(
      "description",
      "Pest control software guides for owners comparing scheduling, routing, CRM, billing, field operations, reporting, inventory, and automation.",
    );
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = "https://pestflow.org/blog";
    analytics.track(EVENTS.LANDING.PAGE_VIEW, { page: "blog_index" });
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
