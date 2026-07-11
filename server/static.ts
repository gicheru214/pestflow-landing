import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { buildSitemapXml, injectSeoHtml, isKnownBlogPath, robotsTxt } from "./seo";

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

  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml").send(buildSitemapXml());
  });

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    const pathname = new URL(req.originalUrl, "https://pestflow.org").pathname.replace(/\/$/, "") || "/";
    const status = isKnownBlogPath(pathname) ? 200 : 404;
    res.status(status).type("html").send(injectSeoHtml(indexTemplate, pathname));
  });
}
