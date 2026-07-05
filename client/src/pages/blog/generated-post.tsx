import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import { BlogLayout } from "@/components/blog/blog-layout";
import { getGeneratedPostBySlug } from "@/lib/generated-blog-posts";
import NotFound from "@/pages/not-found";
import type { GeneratedBlogSection } from "@/lib/blog-types";

type GeneratedBlogPostPageProps = {
  slug: string;
};

function SectionBlock({ section }: { section: GeneratedBlogSection }) {
  if (section.type === "paragraph") {
    return <p>{section.text}</p>;
  }

  if (section.type === "heading") {
    return <h2>{section.text}</h2>;
  }

  if (section.type === "list") {
    return (
      <ul>
        {section.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (section.type === "callout") {
    return (
      <div className="callout">
        <div className="callout-title">{section.title}</div>
        {section.body ? <p>{section.body}</p> : null}
        {section.items?.length ? (
          <ul>
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  if (section.type === "quote") {
    return <blockquote>{section.text}</blockquote>;
  }

  return (
    <table>
      <thead>
        <tr>
          {section.headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {section.rows.map((row) => (
          <tr key={row.join("|")}>
            {row.map((cell, index) => (
              <td key={`${cell}-${index}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function GeneratedBlogPostPage({ slug }: GeneratedBlogPostPageProps) {
  const post = getGeneratedPostBySlug(slug);

  if (!post) {
    return <NotFound />;
  }

  return (
    <BlogLayout post={post}>
      {post.sections.map((section, index) => (
        <SectionBlock key={`${section.type}-${index}`} section={section} />
      ))}

      {post.internalLinks.length > 0 && (
        <div className="callout">
          <div className="callout-title">Use this inside PestFlow</div>
          <ul>
            {post.internalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {post.sourceLinks.length > 0 && (
        <>
          <h2>Sources watched for this update</h2>
          <p>
            These links were used as fresh context for the piece. PestFlow does not copy their text,
            and every recommendation above is rewritten for pest control owners.
          </p>
          <ul>
            {post.sourceLinks.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title}
                  <ExternalLink className="ml-1 inline h-3.5 w-3.5 align-[-2px]" />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </BlogLayout>
  );
}
