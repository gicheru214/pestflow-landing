import assert from "node:assert/strict";
import test from "node:test";
import { parseSoroArticles } from "./soro";

test("parseSoroArticles extracts and validates public embed metadata", () => {
  const source = `
    (function() {
      const SORO_ARTICLES = [
        {
          "id": "article-1",
          "title": "Routes & Growth",
          "slug": "routes-and-growth",
          "excerpt": "A useful guide for owners.",
          "isoDate": "2026-09-02T09:30:56.298+00:00",
          "image": "https://images.example/article.webp"
        },
        { "id": "missing-fields", "slug": "invalid" }
      ];
      var SORO_TOKEN = "public-token";
    })();
  `;

  assert.deepEqual(parseSoroArticles(source), [{
    id: "article-1",
    title: "Routes & Growth",
    slug: "routes-and-growth",
    excerpt: "A useful guide for owners.",
    isoDate: "2026-09-02T09:30:56.298+00:00",
    image: "https://images.example/article.webp",
  }]);
});

test("parseSoroArticles fails closed when the feed shape is missing", () => {
  assert.throws(
    () => parseSoroArticles("var OTHER_DATA = [];"),
    /article data was not present/,
  );
});
