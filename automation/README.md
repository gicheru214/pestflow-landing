# PestFlow Prewritten Blog Schedule

PestFlow does not need an OpenAI API key or a daily content-generation job. The owner-only software keyword universe lives in `automation/pestflow-software-keywords.json`, and the complete scheduled backlog is committed to the repository before publication.

Current publishing plan:

- The existing July 11 backlog publishes ten owner-software guides during the Central business day.
- `scripts/build-prewritten-pestflow-backlog.mjs` builds forty additional canonical guides into `client/src/content/scheduled-blog-posts-phase-two.json`.
- Those forty guides publish at ten per Central day from July 12 through July 15.
- The forty canonical pages cover all 120 researched keywords through primary and secondary keyword mapping. Closely related query variants share one page to prevent keyword cannibalization.
- Each prewritten article must contain at least 600 words, include a live-workflow test, implementation guidance, risk checks, complete-cost questions, internal links, and a clear owner decision rule.
- Future-dated pages return `404` and remain absent from the blog and sitemap until their `publishedAt` time.
- `https://pestflow.org/sitemap.xml` updates automatically as each page becomes eligible for publication. Search Console only needs the root sitemap submitted once.

Run `npm run blog:build-backlog` after changing the canonical article plan. The GitHub workflow rebuilds the backlog, confirms the generated JSON is committed, typechecks the site, and runs the production build. It does not generate, commit, or publish content through an external AI API.
