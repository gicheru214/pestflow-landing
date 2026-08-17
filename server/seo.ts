import generatedPosts from "../client/src/content/generated-blog-posts.json";
import scheduledPosts from "../client/src/content/scheduled-blog-posts.json";
import scheduledPhaseTwoPosts from "../client/src/content/scheduled-blog-posts-phase-two.json";

const SITE_URL = "https://pestflow.org";

type SeoPage = {
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
  publishedAt?: string;
  updatedAt?: string;
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

export function getSeoPage(pathname: string) {
  return publishedPages().find((page) => page.path === pathname) || {
    ...STATIC_PAGES[0],
    path: pathname,
  };
}

export function isKnownBlogPath(pathname: string) {
  return !pathname.startsWith("/blog/") || publishedPages().some((page) => page.path === pathname);
}

export function injectSeoHtml(template: string, pathname: string) {
  const page = getSeoPage(pathname);
  const canonical = `${SITE_URL}${page.path}`;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const type = page.type || "website";
  const structuredData = page.type === "article"
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: page.title,
        description: page.description,
        mainEntityOfPage: canonical,
        datePublished: page.publishedAt,
        dateModified: page.updatedAt || page.publishedAt,
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
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<script type="application/ld+json">${safeJson(structuredData)}</script>`,
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

export function buildSitemapXml() {
  const urls = publishedPages().map((page) => {
    const lastmod = page.updatedAt || page.publishedAt;
    return [
      "  <url>",
      `    <loc>${SITE_URL}${page.path}</loc>`,
      ...(lastmod ? [`    <lastmod>${lastmod.slice(0, 10)}</lastmod>`] : []),
      "  </url>",
    ].join("\n");
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
