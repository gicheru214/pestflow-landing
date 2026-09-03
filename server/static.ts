import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { buildSitemapXml, injectSeoHtml, resolveSeoRequest, robotsTxt } from "./seo";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  const indexTemplate = fs.readFileSync(path.resolve(distPath, "index.html"), "utf8");

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(robotsTxt);
  });

  app.get("/sitemap.xml", async (_req, res, next) => {
    try {
      res.type("application/xml").send(await buildSitemapXml());
    } catch (error) {
      next(error);
    }
  });

  // Google Play may retain a previously submitted privacy-policy URL even
  // after the canonical page moves. Keep that public URL permanently valid
  // and redirect crawlers before the SPA fallback can render its 404 page.
  app.get("/privacy-policy", (_req, res) => {
    res.redirect(308, "/privacy");
  });

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", async (req, res, next) => {
    try {
      const requestUrl = new URL(req.originalUrl, "https://pestflow.org");
      const resolved = await resolveSeoRequest(requestUrl);
      const html = await injectSeoHtml(indexTemplate, requestUrl, resolved);
      res.status(resolved.known ? 200 : 404).type("html").send(html);
    } catch (error) {
      next(error);
    }
  });
}
