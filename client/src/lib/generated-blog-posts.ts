import generatedPosts from "@/content/generated-blog-posts.json";
import type { GeneratedBlogPost } from "@/lib/blog-types";

export const GENERATED_BLOG_POSTS = generatedPosts as GeneratedBlogPost[];

export function getGeneratedPostBySlug(slug: string): GeneratedBlogPost | undefined {
  return GENERATED_BLOG_POSTS.find((post) => post.slug === slug);
}
