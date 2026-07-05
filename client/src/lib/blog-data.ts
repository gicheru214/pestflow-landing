import type { BlogPost } from "@/lib/blog-types";
import { GENERATED_BLOG_POSTS } from "@/lib/generated-blog-posts";

const STATIC_BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-much-does-pest-control-cost",
    title: "How Much Does Pest Control Cost? (2026 Pricing Guide)",
    description:
      "Real pest control prices in 2026: general pest, termites, bed bugs, rodents, and mosquitos — broken down by region, contract type, and one-time vs recurring.",
    keyword: "how much does pest control cost",
    readTime: "9 min read",
    category: "Pricing",
    updated: "May 2026",
    excerpt:
      "Average general pest service runs $125–$300 for the initial and $100–$180 per quarterly visit. Here is what every pest costs to treat in 2026 — and where the contracts get expensive.",
  },
  {
    slug: "pest-control-pricing-chart",
    title: "Pest Control Pricing Chart by Service Type (Owner Edition)",
    description:
      "What to charge for general pest, German roach clean-outs, bed bug heat, termites, mosquito misting, rodent exclusion, and wildlife — pricing benchmarks from real PCOs.",
    keyword: "pest control pricing chart",
    readTime: "11 min read",
    category: "Pricing",
    updated: "May 2026",
    excerpt:
      "Stop guessing at quotes. This is the pricing chart we wish every new owner had — minimum stops, per-linear-foot termite rates, and what the veterans charge for the jobs rookies underbid.",
  },
  {
    slug: "how-to-start-a-pest-control-business",
    title: "How to Start a Pest Control Business in 2026 (Step-by-Step)",
    description:
      "Licensing, startup costs, first equipment, and how to land your first 50 accounts. A founder's guide to launching a pest control business that actually makes money.",
    keyword: "how to start a pest control business",
    readTime: "14 min read",
    category: "Operations",
    updated: "May 2026",
    excerpt:
      "You can start a pest control business for under $6,200 — if you avoid the $40k truck mistake every rookie makes. Here is the licensing path, the startup gear list, and the 50-account playbook.",
  },
  {
    slug: "pest-control-marketing-ideas",
    title: "12 Pest Control Marketing Ideas That Actually Work in 2026",
    description:
      "Google LSAs, door hangers, route-density referrals, Nextdoor, and the marketing channels real pest control owners are spending on in 2026.",
    keyword: "pest control marketing ideas",
    readTime: "10 min read",
    category: "Marketing",
    updated: "May 2026",
    excerpt:
      "LSAs at $15–$50 per lead. Door hangers on the 20 nearest neighbors after every stop. Nextdoor referrals that close higher than Facebook leads. The marketing tactics PCOs are actually winning with in 2026.",
  },
  {
    slug: "pest-control-estimate-template",
    title: "The Pest Control Estimate Template Owners Actually Use",
    description:
      "Free pest control estimate template with every field you need: scope, exclusions, warranty, deposit, expiration, and the lines that prevent every common dispute.",
    keyword: "pest control estimate template",
    readTime: "7 min read",
    category: "Templates",
    updated: "May 2026",
    excerpt:
      "Steal the estimate template that saved us 14 arguments last year. Includes the expiration line, the deposit math, and the one sentence that protects you from scope creep on every termite job.",
  },
  {
    slug: "pest-control-invoice-template",
    title: "Pest Control Invoice Template (Free Download + What to Include)",
    description:
      "Free pest control invoice template with EPA reg numbers, applicator license, late fee policy, card surcharge language, and ACH options — built for state compliance.",
    keyword: "pest control invoice template",
    readTime: "8 min read",
    category: "Templates",
    updated: "May 2026",
    excerpt:
      "Card on file before the tech leaves the driveway. Net 30 builds AR you will never collect. This is the invoice template — and the payment policy — that PCOs use to keep cash flowing.",
  },
];

export const BLOG_POSTS: BlogPost[] = [...GENERATED_BLOG_POSTS, ...STATIC_BLOG_POSTS];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getRelatedPosts(slug: string, count = 3): BlogPost[] {
  return BLOG_POSTS.filter((post) => post.slug !== slug).slice(0, count);
}

export type { BlogPost };
