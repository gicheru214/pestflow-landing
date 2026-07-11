import generatedPosts from "@/content/generated-blog-posts.json";
import scheduledPosts from "@/content/scheduled-blog-posts.json";
import scheduledPhaseTwoPosts from "@/content/scheduled-blog-posts-phase-two.json";
import type { GeneratedBlogPost } from "@/lib/blog-types";

const ALL_GENERATED_BLOG_POSTS = [
  ...generatedPosts,
  ...scheduledPosts,
  ...scheduledPhaseTwoPosts,
] as GeneratedBlogPost[];

function isPublished(post: GeneratedBlogPost, now = Date.now()) {
  const publishTime = Date.parse(post.publishedAt);
  return Number.isFinite(publishTime) && publishTime <= now;
}

export const GENERATED_BLOG_POSTS = ALL_GENERATED_BLOG_POSTS
  .filter((post) => isPublished(post))
  .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));

export function getGeneratedPostBySlug(slug: string): GeneratedBlogPost | undefined {
  return GENERATED_BLOG_POSTS.find((post) => post.slug === slug);
}
