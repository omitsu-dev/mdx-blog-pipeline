import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeExternalLinks from "@/lib/rehype-external-links";
import { getAllSlugs, getArticle } from "@/lib/content";
import { Callout } from "@/components/Callout";
import { CodeBlock } from "@/components/CodeBlock";

type Props = {
  params: Promise<{ slug: string }>;
};

const mdxComponents = {
  Callout,
  pre: ({ children }: { children: React.ReactNode }) => (
    <CodeBlock>{children}</CodeBlock>
  ),
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const article = getArticle(slug);
    return {
      title: article.title,
      description: article.description,
    };
  } catch {
    return {};
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;

  let article;
  try {
    article = getArticle(slug);
  } catch {
    notFound();
  }

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <header className="mb-8 not-prose">
        <h1 className="text-3xl font-bold">{article.title}</h1>
        <p className="mt-2 text-sm text-gray-500">
          {article.date} · {article.readingTime}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <MDXRemote
        source={article.content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug, rehypeExternalLinks],
          },
        }}
      />
    </article>
  );
}
