import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "My Blog",
    template: "%s | My Blog",
  },
  description: "A blog built with Next.js and MDX",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <header className="border-b border-gray-200 dark:border-gray-800">
          <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
            <a href="/" className="text-xl font-bold">
              My Blog
            </a>
          </nav>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-12">{children}</main>
        <footer className="mt-16 border-t border-gray-200 py-8 text-center text-sm text-gray-500 dark:border-gray-800">
          &copy; {new Date().getFullYear()} My Blog
        </footer>
      </body>
    </html>
  );
}
