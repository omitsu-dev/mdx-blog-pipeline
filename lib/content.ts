import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const CONTENT_DIR = path.join(process.cwd(), "content/posts");

export type ArticleMeta = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  readingTime: string;
};

export type Article = ArticleMeta & {
  content: string;
};

export function getAllSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getArticle(slug: string): Article {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    tags: data.tags ?? [],
    date: data.date ?? "",
    readingTime: stats.text,
    content,
  };
}

export function getAllArticles(): ArticleMeta[] {
  return getAllSlugs()
    .map((slug) => {
      const { content, ...meta } = getArticle(slug);
      return meta;
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}
