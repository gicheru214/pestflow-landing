const DEFAULT_BASE_URL = "https://pestflow.org";
const DEFAULT_TIMEOUT_MS = 20 * 60 * 1000;
const DEFAULT_INTERVAL_MS = 30 * 1000;

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    baseUrl: process.env.BLOG_BASE_URL || DEFAULT_BASE_URL,
    slugs: (process.env.EXPECTED_BLOG_SLUGS || "").split(",").filter(Boolean),
    timeoutMs: Number(process.env.BLOG_DEPLOY_TIMEOUT_MS || DEFAULT_TIMEOUT_MS),
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg.startsWith("--slugs=")) {
      parsed.slugs = arg.split("=")[1].split(",").filter(Boolean);
    } else if (arg === "--slugs") {
      parsed.slugs = args[index + 1].split(",").filter(Boolean);
      index += 1;
    } else if (arg.startsWith("--base-url=")) {
      parsed.baseUrl = arg.split("=")[1];
    } else if (arg === "--base-url") {
      parsed.baseUrl = args[index + 1];
      index += 1;
    }
  }

  if (parsed.slugs.length === 0) {
    throw new Error("Pass at least one slug with --slugs or EXPECTED_BLOG_SLUGS.");
  }

  return parsed;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "cache-control": "no-cache",
      "user-agent": "PestFlowBlogDeployWaiter/1.0 (+https://pestflow.org)",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return response.text();
}

function assetUrlsFromHtml(baseUrl, html) {
  const urls = [];
  const assetPattern = /<(?:script|link)[^>]+(?:src|href)="([^"]*assets\/[^"]+\.(?:js|css))"/g;
  let match = assetPattern.exec(html);

  while (match) {
    urls.push(new URL(match[1], baseUrl).toString());
    match = assetPattern.exec(html);
  }

  return urls;
}

async function productionContainsSlugs(baseUrl, slugs) {
  const html = await fetchText(new URL("/blog", baseUrl).toString());
  const assets = assetUrlsFromHtml(baseUrl, html);

  for (const asset of assets) {
    const body = await fetchText(asset);
    if (slugs.every((slug) => body.includes(slug))) {
      return true;
    }
  }

  return false;
}

async function main() {
  const args = parseArgs();
  const startedAt = Date.now();

  while (Date.now() - startedAt < args.timeoutMs) {
    try {
      if (await productionContainsSlugs(args.baseUrl, args.slugs)) {
        console.log(`[blog-deploy] Production bundle contains ${args.slugs.join(", ")}.`);
        return;
      }
      console.log(`[blog-deploy] Waiting for Railway bundle to include ${args.slugs.join(", ")}.`);
    } catch (error) {
      console.log(`[blog-deploy] ${error.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, DEFAULT_INTERVAL_MS));
  }

  throw new Error(`Timed out waiting for production blog bundle to contain ${args.slugs.join(", ")}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
