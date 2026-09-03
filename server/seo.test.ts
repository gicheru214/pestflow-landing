import assert from "node:assert/strict";
import test from "node:test";
import { buildSitemapXml, injectSeoHtml, resolveSeoRequest } from "./seo";
import type { SoroFeedSnapshot } from "./soro";

const TEMPLATE = `<!doctype html>
<html>
  <head>
    <title>Default</title>
    <meta property="og:title" content="Default" />
    <meta property="og:description" content="Default" />
    <meta property="og:type" content="website" />
    <meta name="twitter:title" content="Default" />
    <meta name="twitter:description" content="Default" />
  </head>
  <body><div id="root"></div></body>
</html>`;

const FEED: SoroFeedSnapshot = {
  available: true,
  articles: [{
    id: "article-1",
    title: "Routes & Growth",
    slug: "routes-and-growth",
    excerpt: "A useful guide for owners.",
    isoDate: "2026-09-02T09:30:56.298+00:00",
    image: "https://images.example/article.webp",
  }],
};

test("Soro deep links receive server-rendered article SEO without duplicate canonicals", async () => {
  const requestUrl = "https://pestflow.org/blog?post=routes-and-growth";
  const resolved = await resolveSeoRequest(requestUrl, FEED);
  const html = await injectSeoHtml(TEMPLATE, requestUrl, resolved);

  assert.equal(resolved.known, true);
  assert.match(html, /<title>Routes &amp; Growth \| PestFlow<\/title>/);
  assert.match(html, /<meta name="description" content="A useful guide for owners\." \/>/);
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/pestflow\.org\/blog\?post=routes-and-growth" data-soro="true" \/>/,
  );
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.match(html, /<meta property="og:type" content="article" \/>/);
  assert.match(html, /<meta property="og:image" content="https:\/\/images\.example\/article\.webp" \/>/);
  assert.match(html, /<script id="soro-blog-jsonld" type="application\/ld\+json">/);
  assert.match(html, /"@type":"BlogPosting"/);
  assert.match(html, /"mainEntityOfPage":"https:\/\/pestflow\.org\/blog\?post=routes-and-growth"/);
});

test("the sitemap includes published Soro deep links and dates", async () => {
  const xml = await buildSitemapXml(FEED);

  assert.match(xml, /<loc>https:\/\/pestflow\.org\/blog\?post=routes-and-growth<\/loc>/);
  assert.match(xml, /<lastmod>2026-09-02<\/lastmod>/);
});

test("an unknown Soro slug is a 404 when the feed is available", async () => {
  const resolved = await resolveSeoRequest(
    "https://pestflow.org/blog?post=does-not-exist",
    FEED,
  );

  assert.equal(resolved.known, false);
  assert.equal(resolved.page.path, "/blog");
});

test("the normal blog index retains its own canonical", async () => {
  const requestUrl = "https://pestflow.org/blog";
  const resolved = await resolveSeoRequest(requestUrl, FEED);
  const html = await injectSeoHtml(TEMPLATE, requestUrl, resolved);

  assert.equal(resolved.known, true);
  assert.match(html, /<link rel="canonical" href="https:\/\/pestflow\.org\/blog" \/>/);
  assert.doesNotMatch(html, /data-soro/);
});
