export type BlogCategory = "Pricing" | "Operations" | "Marketing" | "Templates";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  readTime: string;
  category: BlogCategory;
  updated: string;
  excerpt: string;
};

export type BlogSource = {
  title: string;
  url: string;
  source?: string;
  publishedAt?: string;
};

export type GeneratedBlogSection =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "heading";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "callout";
      title: string;
      body?: string;
      items?: string[];
    }
  | {
      type: "quote";
      text: string;
    }
  | {
      type: "table";
      headers: string[];
      rows: string[][];
    };

export type GeneratedBlogLink = {
  label: string;
  href: string;
};

export type GeneratedBlogPost = BlogPost & {
  author: string;
  publishedAt: string;
  sourceLinks: BlogSource[];
  internalLinks: GeneratedBlogLink[];
  sections: GeneratedBlogSection[];
};
