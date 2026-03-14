import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";

/**
 * rehype plugin: add target="_blank" and rel attributes to external links.
 *
 * Affiliate domains get rel="noopener noreferrer sponsored" (Google-recommended).
 * Other external links get rel="noopener noreferrer".
 */

const AFFILIATE_HOSTS = ["amzn.to", "go.nordvpn.net"];

export default function rehypeExternalLinks() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "a") return;

      const href = node.properties?.href;
      if (typeof href !== "string" || !href.startsWith("http")) return;

      node.properties = node.properties ?? {};
      node.properties.target = "_blank";

      try {
        const host = new URL(href).hostname;
        const isAffiliate = AFFILIATE_HOSTS.some(
          (h) => host === h || host.endsWith(`.${h}`)
        );
        node.properties.rel = isAffiliate
          ? "noopener noreferrer sponsored"
          : "noopener noreferrer";
      } catch {
        node.properties.rel = "noopener noreferrer";
      }
    });
  };
}
