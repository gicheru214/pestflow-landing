import generatedPosts from "../client/src/content/generated-blog-posts.json";
import scheduledPosts from "../client/src/content/scheduled-blog-posts.json";
import scheduledPhaseTwoPosts from "../client/src/content/scheduled-blog-posts-phase-two.json";
import { getSoroFeedSnapshot, type SoroArticle, type SoroFeedSnapshot } from "./soro";

const SITE_URL = "https://pestflow.org";

type SeoPage = {
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
  schemaType?: "Article" | "BlogPosting";
  publishedAt?: string;
  updatedAt?: string;
  image?: string;
  soroManaged?: boolean;
};

export type ResolvedSeoRequest = {
  page: SeoPage;
  known: boolean;
};

const STATIC_PAGES: SeoPage[] = [
  {
    path: "/",
    title: "PestFlow | Pest Control Business Software",
    description: "Run scheduling, routes, recurring billing, technician work, and customer communication in one pest control operating system.",
  },
  {
    path: "/blog",
    title: "Pest Control Software Guides for Owners | PestFlow",
    description: "Owner-focused pest control software guides covering scheduling, routing, CRM, billing, field operations, reporting, inventory, and automation.",
  },
  {
    path: "/accessibility",
    title: "PestFlow Accessibility Statement",
    description: "Read PestFlow's accessibility goals, supported measures, and how to request assistance or report a barrier.",
  },
  {
    path: "/blog/pest-control-pricing-chart",
    title: "Pest Control Pricing Chart by Service Type | Owner Edition",
    description: "A practical pricing reference for pest control owners quoting general pest, roaches, termites, mosquitoes, rodents, and specialty work.",
    type: "article",
    publishedAt: "2026-05-01T12:00:00.000Z",
  },
  {
    path: "/blog/how-to-start-a-pest-control-business",
    title: "How to Start a Pest Control Business in 2026",
    description: "A step-by-step guide to licensing, startup costs, equipment, pricing, software, and landing the first pest control customers.",
    type: "article",
    publishedAt: "2026-05-01T12:00:00.000Z",
  },
  {
    path: "/blog/pest-control-marketing-ideas",
    title: "12 Pest Control Marketing Ideas That Work in 2026",
    description: "Practical pest control marketing ideas covering local search, LSAs, referrals, neighborhood campaigns, reviews, and follow-up.",
    type: "article",
    publishedAt: "2026-05-01T12:00:00.000Z",
  },
  {
    path: "/blog/pest-control-estimate-template",
    title: "Pest Control Estimate Template for Owners",
    description: "Build clearer pest control estimates with scope, exclusions, warranty terms, deposits, expiration dates, and approval details.",
    type: "article",
    publishedAt: "2026-05-01T12:00:00.000Z",
  },
  {
    path: "/blog/pest-control-invoice-template",
    title: "Pest Control Invoice Template and Billing Guide",
    description: "Create a professional pest control invoice with service details, product records, payment terms, and customer-ready documentation.",
    type: "article",
    publishedAt: "2026-05-01T12:00:00.000Z",
  },
];

const GENERATED_PAGES: SeoPage[] = [
  ...generatedPosts,
  ...scheduledPosts,
  ...scheduledPhaseTwoPosts,
].map((post) => ({
  path: `/blog/${post.slug}`,
  title: `${post.title} | PestFlow`,
  description: post.description,
  type: "article",
  publishedAt: post.publishedAt,
  updatedAt: post.publishedAt,
}));

function publishedPages(now = Date.now()) {
  return [
    ...STATIC_PAGES,
    ...GENERATED_PAGES.filter((page) => {
      if (!page.publishedAt) return true;
      const publishTime = Date.parse(page.publishedAt);
      return Number.isFinite(publishTime) && publishTime <= now;
    }),
  ];
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function normalizeRequestUrl(requestUrl: string | URL) {
  const url = requestUrl instanceof URL ? requestUrl : new URL(requestUrl, SITE_URL);
  url.pathname = url.pathname.replace(/\/$/, "") || "/";
  return url;
}

function soroPage(article: SoroArticle): SeoPage {
  return {
    path: `/blog?post=${encodeURIComponent(article.slug)}`,
    title: `${article.title} | PestFlow`,
    description: article.excerpt,
    type: "article",
    schemaType: "BlogPosting",
    publishedAt: article.isoDate,
    updatedAt: article.isoDate,
    image: article.image,
    soroManaged: true,
  };
}

export async function resolveSeoRequest(
  requestUrl: string | URL,
  feedOverride?: SoroFeedSnapshot,
): Promise<ResolvedSeoRequest> {
  const url = normalizeRequestUrl(requestUrl);
  const pathname = url.pathname;
  const requestedSoroSlug = pathname === "/blog" ? url.searchParams.get("post")?.trim() : undefined;

  if (requestedSoroSlug) {
    const feed = feedOverride || await getSoroFeedSnapshot();
    const article = feed.articles.find((candidate) => candidate.slug === requestedSoroSlug);
    if (article) return { page: soroPage(article), known: true };

    if (feed.available) {
      return { page: { ...STATIC_PAGES[1] }, known: false };
    }

    // Fail open during a transient Soro outage. The embed can still render the
    // article client-side, and the query URL remains its canonical URL.
    return {
      page: {
        ...STATIC_PAGES[1],
        path: `/blog?post=${encodeURIComponent(requestedSoroSlug)}`,
        soroManaged: true,
      },
      known: true,
    };
  }

  const page = publishedPages().find((candidate) => candidate.path === pathname) || {
    ...STATIC_PAGES[0],
    path: pathname,
  };
  const known = !pathname.startsWith("/blog/") || publishedPages().some((candidate) => candidate.path === pathname);
  return { page, known };
}

export async function injectSeoHtml(
  template: string,
  requestUrl: string | URL,
  resolvedOverride?: ResolvedSeoRequest,
) {
  const { page } = resolvedOverride || await resolveSeoRequest(requestUrl);
  const canonical = `${SITE_URL}${page.path}`;
  const escapedCanonical = escapeHtml(canonical);
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const type = page.type || "website";
  const structuredData = page.type === "article"
    ? {
        "@context": "https://schema.org",
        "@type": page.schemaType || "Article",
        headline: page.title,
        description: page.description,
        mainEntityOfPage: canonical,
        url: canonical,
        datePublished: page.publishedAt,
        dateModified: page.updatedAt || page.publishedAt,
        ...(page.image ? { image: page.image } : {}),
        author: { "@type": "Organization", name: "PestFlow" },
        publisher: { "@type": "Organization", name: "PestFlow", url: SITE_URL },
      }
    : {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: page.title,
        description: page.description,
        url: canonical,
        isPartOf: { "@type": "WebSite", name: "PestFlow", url: SITE_URL },
      };

  const extraHead = [
    `<meta name="description" content="${description}" />`,
    `<meta name="robots" content="index,follow,max-image-preview:large" />`,
    `<link rel="canonical" href="${escapedCanonical}"${page.soroManaged ? ' data-soro="true"' : ""} />`,
    `<meta property="og:url" content="${escapedCanonical}" />`,
    ...(page.image ? [
      `<meta property="og:image" content="${escapeHtml(page.image)}" />`,
      `<meta property="og:image:alt" content="${title}" />`,
      `<meta name="twitter:image" content="${escapeHtml(page.image)}" />`,
    ] : []),
    `<script${page.soroManaged ? ' id="soro-blog-jsonld"' : ""} type="application/ld+json">${safeJson(structuredData)}</script>`,
  ].join("\n    ");

  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${type}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${description}" />`)
    .replace("</head>", `    ${extraHead}\n  </head>`);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function buildSitemapXml(feedOverride?: SoroFeedSnapshot) {
  const feed = feedOverride || await getSoroFeedSnapshot();
  const allPages = [
    ...publishedPages(),
    ...feed.articles.map(soroPage),
  ];
  const urls = allPages.map((page) => {
    const lastmod = page.updatedAt || page.publishedAt;
    return [
      "  <url>",
      `    <loc>${escapeXml(`${SITE_URL}${page.path}`)}</loc>`,
      ...(lastmod ? [`    <lastmod>${lastmod.slice(0, 10)}</lastmod>`] : []),
      "  </url>",
    ].join("\n");
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
