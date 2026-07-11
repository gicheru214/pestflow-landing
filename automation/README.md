# PestFlow Daily Blog Automation

This repo publishes original PestFlow articles from `automation/pestflow-blog-topics.json`. The measured seed demand, live autocomplete findings, priority clusters, and publishing guardrails are recorded in `automation/pestflow-keyword-research.json`. Prewritten articles can also carry a future `publishedAt` timestamp; the blog, direct route, metadata, and sitemap expose them automatically when that timestamp arrives.

Required GitHub configuration:

- Secret: `OPENAI_API_KEY`
- Secret: `CHECKLY_API_KEY`
- Variable or secret: `CHECKLY_ACCOUNT_ID`
- Optional variable: `OPENAI_MODEL`, defaults to `gpt-4.1-mini`

Runtime flow:

1. `.github/workflows/daily-pestflow-blog.yml` wakes at 7 and 8 UTC, then only continues when the local hour in `America/Chicago` is 2 AM.
2. The current prewritten backlog publishes three articles per day through July 20, 2026, at 2 AM, 8 AM, and 2 PM Central. Future-dated articles remain absent from the blog, direct routes, metadata, and sitemap until their `publishedAt` time.
3. While that backlog exists, `scripts/generate-pestflow-blog.mjs` skips new generation so the site does not accidentally exceed the researched cadence. After the backlog ends, it picks the next three unpublished long-tail topics, pulls recent Google News RSS context, asks OpenAI for JSON article content, strips em and en dashes, and writes to `client/src/content/generated-blog-posts.json`.
4. The workflow runs `npm run check` and `npm run build`.
5. It commits and pushes the generated JSON to `main`, which lets Railway deploy the PestFlow landing site.
6. `scripts/wait-for-blog-deploy.mjs` waits until the production bundle at `https://pestflow.org` contains the new slugs.
7. Checkly runs `__checks__/pestflow-blog-production.spec.ts` against production and deploys the BrowserCheck monitor.

The generated posts render through `client/src/pages/blog/generated-post.tsx`, so new posts do not need new React route files.
