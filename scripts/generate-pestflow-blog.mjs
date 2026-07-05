import { appendFile, readFile, writeFile } from "node:fs/promises";
import Parser from "rss-parser";

const TOPICS_PATH = "automation/pestflow-blog-topics.json";
const POSTS_PATH = "client/src/content/generated-blog-posts.json";
const DEFAULT_COUNT = 3;
const DEFAULT_MODEL = "gpt-4.1-mini";
const DEFAULT_AUTHOR = "PestFlow Field Notes";
const BLOG_BASE_URL = process.env.BLOG_BASE_URL || "https://pestflow.org";

const parser = new Parser();

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { count: DEFAULT_COUNT, dryRun: false };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--dry-run") {
      parsed.dryRun = true;
    } else if (arg.startsWith("--count=")) {
      parsed.count = Number(arg.split("=")[1]);
    } else if (arg === "--count") {
      parsed.count = Number(args[index + 1]);
      index += 1;
    }
  }

  if (!Number.isFinite(parsed.count) || parsed.count < 1 || parsed.count > 10) {
    throw new Error("--count must be a number from 1 to 10");
  }

  return parsed;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanString(value) {
  return String(value ?? "")
    .replace(/\s*[—–]\s*/g, " - ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanDeep(value) {
  if (typeof value === "string") {
    return cleanString(value);
  }

  if (Array.isArray(value)) {
    return value.map(cleanDeep);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, cleanDeep(child)]));
  }

  return value;
}

function monthYear(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(date);
}

function estimateReadTime(sections) {
  const text = sections
    .map((section) => {
      if (section.type === "table") {
        return [...section.headers, ...section.rows.flat()].join(" ");
      }
      if (section.type === "list") {
        return section.items.join(" ");
      }
      if (section.type === "callout") {
        return [section.title, section.body, ...(section.items || [])].filter(Boolean).join(" ");
      }
      return section.text;
    })
    .join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(6, Math.ceil(words / 210))} min read`;
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  return (data.output || [])
    .flatMap((item) => item.content || [])
    .map((part) => part.text || part.content || "")
    .join("\n");
}

function parseModelJson(text) {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`OpenAI did not return a JSON object. First 300 chars: ${trimmed.slice(0, 300)}`);
  }

  return JSON.parse(trimmed.slice(start, end + 1));
}

function normalizeSourceUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    return "";
  }
}

async function fetchRss(query) {
  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", `${query} when:14d`);
  url.searchParams.set("hl", "en-US");
  url.searchParams.set("gl", "US");
  url.searchParams.set("ceid", "US:en");

  const response = await fetch(url, {
    headers: {
      "user-agent": "PestFlowBlogBot/1.0 (+https://pestflow.org)",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`RSS fetch failed for ${query}: ${response.status}`);
  }

  return parser.parseString(await response.text());
}

async function researchTopic(topic) {
  const queries = topic.researchQueries?.length
    ? topic.researchQueries
    : [topic.keyword, `${topic.keyword} pest control business`, "pest control industry news"];
  const seen = new Set();
  const sources = [];

  for (const query of queries.slice(0, 4)) {
    try {
      const feed = await fetchRss(query);
      for (const item of (feed.items || []).slice(0, 4)) {
        const url = normalizeSourceUrl(item.link);
        if (!url || seen.has(url)) {
          continue;
        }
        seen.add(url);
        sources.push({
          title: cleanString(item.title),
          url,
          source: cleanString(item.creator || item.source || feed.title || "Google News"),
          publishedAt: item.isoDate || item.pubDate || "",
          snippet: cleanString(item.contentSnippet || item.content || ""),
        });
      }
    } catch (error) {
      console.warn(`[research] ${error.message}`);
    }
  }

  return sources.slice(0, 8);
}

function buildInternalLinks(topic) {
  const links = [
    { label: "Start a PestFlow trial", href: "/onboarding" },
    { label: "Read the pest control pricing chart", href: "/blog/pest-control-pricing-chart" },
  ];

  if (topic.category === "Marketing") {
    links[1] = { label: "Compare more pest control marketing plays", href: "/blog/pest-control-marketing-ideas" };
  } else if (topic.category === "Templates") {
    links[1] = { label: "Use the pest control invoice template", href: "/blog/pest-control-invoice-template" };
  } else if (topic.keyword.includes("gorilladesk")) {
    links[1] = { label: "Compare PestFlow with GorillaDesk", href: "/competitors/gorilladesk" };
  } else if (topic.keyword.includes("fieldroutes")) {
    links[1] = { label: "Compare PestFlow with FieldRoutes", href: "/competitors/fieldroutes" };
  }

  return links;
}

function validatePostDraft(draft) {
  const requiredStrings = ["title", "description", "excerpt"];
  for (const key of requiredStrings) {
    if (!draft[key] || typeof draft[key] !== "string") {
      throw new Error(`OpenAI response is missing ${key}`);
    }
  }

  if (!Array.isArray(draft.sections) || draft.sections.length < 9) {
    throw new Error("OpenAI response must include at least 9 sections");
  }

  for (const section of draft.sections) {
    if (!["paragraph", "heading", "list", "callout", "quote", "table"].includes(section.type)) {
      throw new Error(`Unknown section type: ${section.type}`);
    }
  }
}

async function askOpenAI(topic, sources) {
  const system = [
    "You write PestFlow blog posts for pest control company owners.",
    "Style: direct, human, field-aware, specific, a little punchy, never robotic.",
    "Do not use em dashes. Do not use en dashes. Use commas, colons, periods, or short hyphens instead.",
    "Do not claim fake proprietary data, fake interviews, or fake quotes.",
    "Use the live source links only as context and rewrite all ideas in your own words.",
    "Every post should make an owner want to tighten operations and try PestFlow.",
    "Return only valid JSON.",
  ].join(" ");

  const user = {
    task: "Write one new PestFlow blog post.",
    today: new Date().toISOString().slice(0, 10),
    targetReader: "Owner-operator or manager of a pest control company in the United States.",
    topic,
    pestflowContext: {
      product:
        "PestFlow is pest control business software for route boards, technician GPS, recurring billing, invoices, customer portal, review requests, and owner visibility.",
      baseUrl: BLOG_BASE_URL,
      conversionGoal: "Get qualified pest control owners to click into PestFlow or keep reading the blog.",
    },
    sources: sources.map(({ title, url, source, publishedAt, snippet }) => ({
      title,
      url,
      source,
      publishedAt,
      snippet,
    })),
    outputShape: {
      title: "Compelling SEO title under 68 characters.",
      description: "Meta description under 155 characters.",
      excerpt: "Two sentence blog-card excerpt written like a human.",
      sections: [
        { type: "paragraph", text: "Opening with a concrete owner pain." },
        { type: "callout", title: "The short version", items: ["3 to 5 direct takeaways."] },
        { type: "heading", text: "H2 text" },
        { type: "paragraph", text: "Useful field-aware advice." },
        { type: "list", items: ["Specific steps, checks, or examples."] },
        { type: "table", headers: ["Column", "Column"], rows: [["Cell", "Cell"]] },
      ],
    },
    requirements: [
      "Include 10 to 14 sections.",
      "Include one callout near the top.",
      "Include one practical table.",
      "Mention PestFlow naturally in 2 or 3 places, mostly as the system of record or follow-through tool.",
      "No em dashes, no en dashes, no AI phrasing such as 'in today's fast-paced world'.",
      "Do not include markdown fences.",
    ],
  };

  const payload = {
    model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
    input: [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify(user) },
    ],
    max_output_tokens: 6500,
    temperature: 0.76,
  };

  let response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok && response.status === 400) {
    const firstError = await response.text();
    if (firstError.toLowerCase().includes("temperature")) {
      delete payload.temperature;
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } else {
      throw new Error(`OpenAI request failed: ${response.status} ${firstError}`);
    }
  }

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const draft = cleanDeep(parseModelJson(extractOutputText(data)));
  validatePostDraft(draft);
  return draft;
}

function buildPost(topic, draft, sources) {
  const slug = topic.slug || slugify(topic.keyword);
  const post = {
    slug,
    title: cleanString(draft.title),
    description: cleanString(draft.description),
    keyword: topic.keyword,
    readTime: estimateReadTime(draft.sections),
    category: topic.category,
    updated: monthYear(),
    excerpt: cleanString(draft.excerpt),
    author: DEFAULT_AUTHOR,
    publishedAt: new Date().toISOString(),
    sourceLinks: sources.slice(0, 5).map(({ title, url, source, publishedAt }) => ({
      title,
      url,
      source,
      publishedAt,
    })),
    internalLinks: buildInternalLinks(topic),
    sections: draft.sections,
  };

  const serialized = JSON.stringify(post);
  if (/[—–]/.test(serialized)) {
    throw new Error(`Generated post still contains an em or en dash: ${slug}`);
  }

  return post;
}

async function writeGithubOutput(values) {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }

  await appendFile(
    process.env.GITHUB_OUTPUT,
    Object.entries(values)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n") + "\n",
  );
}

async function main() {
  const args = parseArgs();
  const topicsFile = JSON.parse(await readFile(TOPICS_PATH, "utf8"));
  const existingPosts = JSON.parse(await readFile(POSTS_PATH, "utf8"));
  const existingSlugs = new Set(existingPosts.map((post) => post.slug));
  const nextTopics = topicsFile.topics
    .map((topic) => ({ ...topic, slug: topic.slug || slugify(topic.keyword) }))
    .filter((topic) => !existingSlugs.has(topic.slug))
    .slice(0, args.count);

  if (nextTopics.length === 0) {
    console.log("No unpublished PestFlow blog topics remain.");
    await writeGithubOutput({ published_count: 0, published_slugs: "" });
    return;
  }

  if (!process.env.OPENAI_API_KEY && !args.dryRun) {
    throw new Error("OPENAI_API_KEY is required to generate PestFlow blog posts.");
  }

  const newPosts = [];
  for (const topic of nextTopics) {
    console.log(`[blog] Researching ${topic.keyword}`);
    const sources = await researchTopic(topic);

    if (args.dryRun) {
      console.log(`[blog] Would publish ${topic.slug} with ${sources.length} fresh source links.`);
      continue;
    }

    console.log(`[blog] Asking OpenAI to write ${topic.slug}`);
    const draft = await askOpenAI(topic, sources);
    newPosts.push(buildPost(topic, draft, sources));
  }

  if (!args.dryRun && newPosts.length > 0) {
    await writeFile(POSTS_PATH, JSON.stringify([...newPosts, ...existingPosts], null, 2) + "\n");
  }

  const slugs = newPosts.map((post) => post.slug);
  console.log(`[blog] Published ${newPosts.length} post(s): ${slugs.join(", ")}`);
  await writeGithubOutput({
    published_count: newPosts.length,
    published_slugs: slugs.join(","),
    primary_slug: slugs[0] || "",
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
