#!/usr/bin/env node

/**
 * MDX Article Linter
 *
 * Checks:
 *  1. frontmatter    — Required fields (title, description, tags, date)
 *  2. callout-count  — Max 4 Callouts per article
 *  3. broken-bold    — **bold**CJK needs a space before CJK
 *  4. unclosed-fence — Unclosed ``` code blocks
 *  5. last-h2        — Last H2 must be "Wrapping Up"
 *  6. tag-case       — Tags must match canonical-tags.json casing
 *  7. tag-unknown    — Tags not in canonical-tags.json (info, non-blocking)
 *
 * Usage:
 *   node scripts/lint-articles.mjs              # Check all articles
 *   node scripts/lint-articles.mjs --fix-tags   # Auto-fix tag casing
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content/posts");
const TAGS_PATH = path.join(ROOT, "lib/canonical-tags.json");

const fixTags = process.argv.includes("--fix-tags");

// Load canonical tags
const canonicalTags = JSON.parse(fs.readFileSync(TAGS_PATH, "utf-8"));
const tagLookup = Object.fromEntries(
  Object.entries(canonicalTags).map(([k, v]) => [k.toLowerCase(), v])
);

const CJK_RANGE = /[\u3000-\u9fff\uf900-\ufaff\ufe30-\ufe4f]/;
const BOLD_CJK_PATTERN =
  /(\*\*[^\s*][^*]*?\*\*)([^\s,.)}\]!?;:、。）」』】*])/g;

const issues = [];

function addIssue(file, rule, message, severity = "error") {
  issues.push({ file: path.relative(ROOT, file), rule, message, severity });
}

function lintFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");

  // Parse frontmatter
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    addIssue(filePath, "frontmatter", "No frontmatter found");
    return;
  }

  const fm = fmMatch[1];
  const body = raw.slice(fmMatch[0].length);

  // Rule 1: Required fields
  for (const field of ["title", "description", "tags", "date"]) {
    if (!fm.includes(`${field}:`)) {
      addIssue(filePath, "frontmatter", `Missing required field: ${field}`);
    }
  }

  // Rule 2: Callout count
  const calloutMatches = body.match(/<Callout[\s>]/g) || [];
  if (calloutMatches.length > 4) {
    addIssue(
      filePath,
      "callout-count",
      `${calloutMatches.length} Callouts (max 4)`
    );
  }

  // Rule 3: Broken bold (CJK)
  const lines = body.split("\n");
  let inCodeBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock || line.trim().startsWith("<")) continue;

    if (BOLD_CJK_PATTERN.test(line) && CJK_RANGE.test(line)) {
      addIssue(
        filePath,
        "broken-bold",
        `Line ${i + 1}: **bold** directly followed by CJK — add a space`
      );
    }
    BOLD_CJK_PATTERN.lastIndex = 0;
  }

  // Rule 4: Unclosed fence
  let fenceCount = 0;
  inCodeBlock = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      fenceCount++;
      inCodeBlock = !inCodeBlock;
    }
  }
  if (fenceCount % 2 !== 0) {
    addIssue(filePath, "unclosed-fence", "Odd number of ``` — check for unclosed code blocks");
  }

  // Rule 5: Last H2
  const h2s = lines.filter(
    (l) => l.startsWith("## ") && !l.startsWith("### ")
  );
  if (h2s.length > 0) {
    const lastH2 = h2s[h2s.length - 1].replace("## ", "").trim();
    if (lastH2 !== "Wrapping Up") {
      addIssue(
        filePath,
        "last-h2",
        `Last H2 is "${lastH2}" — expected "Wrapping Up"`
      );
    }
  }

  // Rule 6 & 7: Tag validation
  const tagsMatch = fm.match(/tags:\s*\[(.*?)\]/s);
  if (tagsMatch) {
    const tagStr = tagsMatch[1];
    const tags = tagStr.match(/"([^"]+)"/g)?.map((t) => t.replace(/"/g, "")) ?? [];

    for (const tag of tags) {
      const key = tag.toLowerCase();
      const canonical = tagLookup[key];

      if (!canonical) {
        addIssue(filePath, "tag-unknown", `Unknown tag: "${tag}"`, "info");
      } else if (tag !== canonical) {
        addIssue(
          filePath,
          "tag-case",
          `Tag "${tag}" should be "${canonical}"`
        );

        if (fixTags) {
          const fixed = raw.replace(
            new RegExp(`"${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, "g"),
            `"${canonical}"`
          );
          fs.writeFileSync(filePath, fixed, "utf-8");
        }
      }
    }
  }
}

// Run
if (!fs.existsSync(CONTENT_DIR)) {
  console.log("No content/posts/ directory found. Nothing to lint.");
  process.exit(0);
}

const files = fs
  .readdirSync(CONTENT_DIR)
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => path.join(CONTENT_DIR, f));

if (files.length === 0) {
  console.log("No .mdx files found in content/posts/.");
  process.exit(0);
}

for (const file of files) {
  lintFile(file);
}

// Report
const errors = issues.filter((i) => i.severity === "error");
const infos = issues.filter((i) => i.severity === "info");

if (issues.length === 0) {
  console.log(`✓ ${files.length} files checked. 0 issues.`);
} else {
  console.log(`\n${errors.length} errors, ${infos.length} info in ${files.length} files:\n`);

  for (const issue of issues) {
    const icon = issue.severity === "error" ? "✗" : "ℹ";
    console.log(`  ${icon} [${issue.rule}] ${issue.file}`);
    console.log(`    ${issue.message}\n`);
  }

  if (fixTags) {
    const tagFixes = issues.filter((i) => i.rule === "tag-case");
    if (tagFixes.length > 0) {
      console.log(`Fixed ${tagFixes.length} tag casing issues.`);
    }
  }

  if (errors.length > 0) process.exit(1);
}
