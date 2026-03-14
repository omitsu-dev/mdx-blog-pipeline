import Link from "next/link";
import { getAllArticles } from "@/lib/content";

export default function HomePage() {
  const articles = getAllArticles();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Posts</h1>
      {articles.length === 0 ? (
        <p className="text-gray-500">
          No posts yet. Add <code>.mdx</code> files to{" "}
          <code>content/posts/</code>.
        </p>
      ) : (
        <ul className="space-y-6">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/blog/${article.slug}`}
                className="group block space-y-1"
              >
                <h2 className="text-xl font-semibold group-hover:underline">
                  {article.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {article.date} · {article.readingTime}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {article.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
