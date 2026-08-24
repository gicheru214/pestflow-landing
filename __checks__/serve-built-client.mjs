import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { execFileSync } from "node:child_process";

const root = join(process.cwd(), "dist", "public");
const port = Number(process.env.PORT || 4173);
const sourceSha = process.env.REPLAY_SOURCE_SHA;

if (!sourceSha || !/^[a-f0-9]{40}$/.test(sourceSha)) {
  throw new Error("REPLAY_SOURCE_SHA must bind the regression to a full Git commit");
}
execFileSync("git", ["cat-file", "-e", `${sourceSha}^{commit}`], { stdio: "inherit" });
execFileSync("git", ["merge-base", "--is-ancestor", sourceSha, "HEAD"], { stdio: "inherit" });
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

createServer((request, response) => {
  const pathname = new URL(request.url || "/", "http://127.0.0.1").pathname;
  const relativePath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.(\/|\\|$))+/, "");
  const requestedFile = join(root, relativePath);
  const file = existsSync(requestedFile) && statSync(requestedFile).isFile()
    ? requestedFile
    : join(root, "index.html");
  response.setHeader("Content-Type", contentTypes[extname(file)] || "application/octet-stream");
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`built client from source lineage ${sourceSha} listening on http://127.0.0.1:${port}`);
});
