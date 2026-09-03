export const SORO_EMBED_URL =
  "https://app.trysoro.com/api/embed/6ef964cf-c53d-45a7-8c8f-c00c065bee13";

const CACHE_TTL_MS = 15 * 60 * 1000;
const FETCH_TIMEOUT_MS = 5_000;
const ARTICLES_PATTERN = /\b(?:var|let|const)\s+SORO_ARTICLES\s*=\s*/;
const TOKEN_PATTERN = /\b(?:var|let|const)\s+SORO_TOKEN\b/;

export type SoroArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  isoDate: string;
  image?: string;
};

export type SoroFeedSnapshot = {
  articles: SoroArticle[];
  available: boolean;
};

type SoroCache = {
  articles: SoroArticle[];
  freshUntil: number;
};

let cache: SoroCache | undefined;
let pendingRequest: Promise<SoroFeedSnapshot> | undefined;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseSoroArticles(source: string): SoroArticle[] {
  const articleMatch = ARTICLES_PATTERN.exec(source);
  if (!articleMatch) {
    throw new Error("Soro article data was not present in the embed response");
  }

  const jsonStart = articleMatch.index + articleMatch[0].length;
  const tokenMatch = TOKEN_PATTERN.exec(source.slice(jsonStart));
  if (!tokenMatch) {
    throw new Error("Soro article data was not terminated as expected");
  }

  const tokenStart = jsonStart + tokenMatch.index;
  const serialized = source.slice(jsonStart, tokenStart).trim().replace(/;$/, "");
  const parsed: unknown = JSON.parse(serialized);
  if (!Array.isArray(parsed)) {
    throw new Error("Soro article data was not an array");
  }

  const seen = new Set<string>();
  return parsed.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const article = candidate as Record<string, unknown>;
    if (
      !isNonEmptyString(article.id) ||
      !isNonEmptyString(article.title) ||
      !isNonEmptyString(article.slug) ||
      !isNonEmptyString(article.excerpt) ||
      !isNonEmptyString(article.isoDate) ||
      seen.has(article.slug)
    ) {
      return [];
    }

    seen.add(article.slug);
    return [{
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      isoDate: article.isoDate,
      ...(isNonEmptyString(article.image) ? { image: article.image } : {}),
    }];
  });
}

async function refreshSoroArticles(): Promise<SoroFeedSnapshot> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(SORO_EMBED_URL, {
      headers: { accept: "application/javascript,text/javascript;q=0.9,*/*;q=0.8" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Soro embed request returned ${response.status}`);
    }

    const articles = parseSoroArticles(await response.text());
    cache = { articles, freshUntil: Date.now() + CACHE_TTL_MS };
    return { articles, available: true };
  } catch (error) {
    if (cache) {
      console.warn("Unable to refresh Soro articles; using the last successful feed", error);
      return { articles: cache.articles, available: true };
    }

    console.warn("Unable to load Soro articles for SEO metadata", error);
    return { articles: [], available: false };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getSoroFeedSnapshot(): Promise<SoroFeedSnapshot> {
  if (cache && cache.freshUntil > Date.now()) {
    return { articles: cache.articles, available: true };
  }

  if (!pendingRequest) {
    pendingRequest = refreshSoroArticles().finally(() => {
      pendingRequest = undefined;
    });
  }

  return pendingRequest;
}
