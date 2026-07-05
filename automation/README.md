# PestFlow Daily Blog Automation

This repo publishes three generated PestFlow blog posts from `automation/pestflow-blog-topics.json` on the daily GitHub Actions schedule.

Required GitHub configuration:

- Secret: `OPENAI_API_KEY`
- Secret: `CHECKLY_API_KEY`
- Variable or secret: `CHECKLY_ACCOUNT_ID`
- Optional variable: `OPENAI_MODEL`, defaults to `gpt-4.1-mini`

Runtime flow:

1. `.github/workflows/daily-pestflow-blog.yml` wakes at 7 and 8 UTC, then only continues when the local hour in `America/Chicago` is 2 AM.
2. `scripts/generate-pestflow-blog.mjs` picks the next three unpublished long-tail topics, pulls recent Google News RSS context, asks OpenAI for JSON article content, strips em and en dashes, and writes to `client/src/content/generated-blog-posts.json`.
3. The workflow runs `npm run check` and `npm run build`.
4. It commits and pushes the generated JSON to `main`, which lets Railway deploy the PestFlow landing site.
5. `scripts/wait-for-blog-deploy.mjs` waits until the production bundle at `https://pestflow.org` contains the new slugs.
6. Checkly runs `__checks__/pestflow-blog-production.spec.ts` against production and deploys the BrowserCheck monitor.

The generated posts render through `client/src/pages/blog/generated-post.tsx`, so new posts do not need new React route files.
