import { useEffect, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronRight, Calendar, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BLOG_POSTS, getRelatedPosts, type BlogPost } from "@/lib/blog-data";
import { analytics, EVENTS } from "@/lib/analytics";

type BlogLayoutProps = {
  post: BlogPost;
  children: ReactNode;
};

export function BlogLayout({ post, children }: BlogLayoutProps) {
  useEffect(() => {
    document.title = `${post.title} | PestFlow`;
    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };
    setMeta("description", post.description);
    setMeta("og:title", post.title, "property");
    setMeta("og:description", post.description, "property");
    setMeta("og:type", "article", "property");

    analytics.track(EVENTS.LANDING.PAGE_VIEW, { page: "blog", slug: post.slug });
  }, [post]);

  const related = getRelatedPosts(post.slug, 3);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <Navbar />
      <main className="flex-grow">
        <article className="w-full">
          <header className="border-b bg-secondary/30">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl py-12 md:py-16">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Blog
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground truncate">{post.category}</span>
              </nav>

              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold mb-6">
                <Tag className="w-3 h-3" />
                {post.category}
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold font-heading tracking-tight leading-[1.1] mb-6 text-foreground">
                {post.title}
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Updated {post.updated}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
                <span>By the PestFlow team</span>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 md:px-6 max-w-3xl py-12 md:py-16">
            <div className="blog-prose">{children}</div>

            <BlogCTA />
          </div>
        </article>

        {related.length > 0 && (
          <section className="border-t bg-secondary/30 py-16">
            <div className="container mx-auto px-4 md:px-6 max-w-5xl">
              <h2 className="text-2xl md:text-3xl font-bold font-heading mb-8">Keep reading</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="block bg-card border rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all duration-200"
                  >
                    <div className="text-xs font-semibold text-emerald-700 mb-3 uppercase tracking-wide">
                      {rel.category}
                    </div>
                    <h3 className="font-heading font-bold text-lg leading-snug mb-2">{rel.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">{rel.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

export function BlogCTA() {
  return (
    <aside className="not-prose mt-16 rounded-2xl border bg-gradient-to-br from-emerald-50 to-white p-8 md:p-10 shadow-sm">
      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 text-emerald-700 px-3 py-1 text-xs font-semibold mb-4">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        Built for pest control owners
      </div>
      <h3 className="text-2xl md:text-3xl font-bold font-heading mb-3 text-foreground">
        Run your pest control business from the truck.
      </h3>
      <p className="text-muted-foreground mb-6 leading-relaxed">
        Drag-and-drop route board, recurring billing, technician GPS, automated review requests, and a
        branded customer portal. PestFlow is built for owners scaling past $1M.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/onboarding">
          <Button
            size="lg"
            className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg group w-full sm:w-auto"
            onClick={() => analytics.track(EVENTS.LANDING.CTA_CLICK, { cta: "blog_inline_trial" })}
          >
            Start free trial
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <Link href="/blog">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Browse more guides
          </Button>
        </Link>
      </div>
    </aside>
  );
}

export function BlogIndexCTA() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 md:p-12 text-white shadow-xl">
      <div className="max-w-2xl">
        <h2 className="text-2xl md:text-3xl font-bold font-heading mb-3">
          Tired of running your pest control business from sticky notes?
        </h2>
        <p className="text-emerald-50 mb-6 leading-relaxed">
          PestFlow gives you the route board, recurring billing, and tech app every guide on this page
          assumes you already have. 14-day trial, no card required.
        </p>
        <Link href="/onboarding">
          <Button
            size="lg"
            className="font-bold bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg group"
            onClick={() => analytics.track(EVENTS.LANDING.CTA_CLICK, { cta: "blog_index_trial" })}
          >
            Start free trial
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export { BLOG_POSTS };
