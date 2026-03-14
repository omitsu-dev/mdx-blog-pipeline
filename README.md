![CI](https://github.com/omitsu-dev/mdx-blog-pipeline/actions/workflows/ci.yml/badge.svg)

# mdx-blog-pipeline

Minimal MDX blog pipeline with Next.js App Router — rehype/remark plugins, custom components, and article linter.

Built from the architecture behind [32blog.com](https://32blog.com) (120+ articles, 3 languages).

## Features

- **File-based MDX** — drop `.mdx` files in `content/posts/` and they're live
- **next-mdx-remote** — Server Component rendering with RSC support
- **rehype/remark plugins** — GFM tables, auto heading IDs, external link handling
- **Custom components** — Callout alerts, terminal-style code blocks with copy button
- **Article linter** — 7 automated quality checks with `npm run lint`
- **Tag system** — canonical tag registry with auto-fix for casing mismatches
- **Tailwind CSS v4** — utility-first styling with dark mode

## Quick Start

```bash
git clone https://github.com/omitsu-dev/mdx-blog-pipeline.git
cd mdx-blog-pipeline
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Post list (home)
│   └── blog/[slug]/
│       └── page.tsx            # Article page (MDXRemote)
├── components/
│   ├── Callout.tsx             # Alert component (info/tip/warn/danger)
│   └── CodeBlock.tsx           # Terminal-style code block + copy
├── content/
│   └── posts/                  # Your MDX articles go here
│       └── getting-started.mdx
├── lib/
│   ├── content.ts              # Article loader (gray-matter + reading-time)
│   ├── rehype-external-links.ts # Auto rel="noopener" + affiliate detection
│   └── canonical-tags.json     # Tag registry for linter
└── scripts/
    └── lint-articles.mjs       # Article quality checker
```

## Writing Articles

Create `content/posts/my-post.mdx`:

```mdx
---
title: "My Post Title"
description: "A short description for SEO"
tags: ["Next.js", "TypeScript"]
date: "2026-03-14"
---

Your content here. Use standard markdown plus custom components.

<Callout type="tip">
This is a helpful tip.
</Callout>
```

### Available Components

| Component | Usage |
|-----------|-------|
| `<Callout type="info\|tip\|warn\|danger">` | Alert boxes with colored accent |

Code blocks are automatically wrapped in a terminal-style component with language label and copy button.

## Linter

```bash
npm run lint          # Check all articles
npm run lint:fix      # Auto-fix tag casing
```

### Rules

| Rule | Check |
|------|-------|
| `frontmatter` | Required fields: title, description, tags, date |
| `callout-count` | Max 4 per article |
| `broken-bold` | `**bold**` followed by CJK needs a space |
| `unclosed-fence` | All code blocks must be closed |
| `last-h2` | Last H2 must be "Wrapping Up" |
| `tag-case` | Tags match `canonical-tags.json` (auto-fixable) |
| `tag-unknown` | Unknown tags (info only, non-blocking) |

## Customization

### Add a rehype/remark plugin

Edit `app/blog/[slug]/page.tsx`:

```typescript
mdxOptions: {
  remarkPlugins: [remarkGfm, yourRemarkPlugin],
  rehypePlugins: [rehypeSlug, rehypeExternalLinks, yourRehypePlugin],
}
```

### Add a custom MDX component

1. Create the component in `components/`
2. Add it to `mdxComponents` in `app/blog/[slug]/page.tsx`
3. Use it in any `.mdx` file

### Add canonical tags

Edit `lib/canonical-tags.json`:

```json
{
  "your-tag": "Your Tag"
}
```

## Tech Stack

| Package | Version |
|---------|---------|
| Next.js | 16.x |
| next-mdx-remote | 5.x |
| React | 19.x |
| Tailwind CSS | 4.x |
| remark-gfm | 4.x |
| rehype-slug | 6.x |
| gray-matter | 4.x |

## Related Articles

- [MDX Blog Pipeline Deep Dive](https://32blog.com/en/nextjs/nextjs-mdx-blog-setup-guide) — Full walkthrough of the architecture

## License

[MIT](LICENSE)
