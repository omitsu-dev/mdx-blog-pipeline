"use client";

import { ReactNode, useRef, useState } from "react";

export function CodeBlock({ children }: { children: ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  // Extract language from className (e.g., "language-tsx")
  const codeEl = children as React.ReactElement<{
    className?: string;
    children?: ReactNode;
  }>;
  const lang = codeEl?.props?.className?.replace("language-", "") ?? "";

  async function handleCopy() {
    const text = preRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
          <span className="inline-block h-3 w-3 rounded-full bg-yellow-500" />
          <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="flex items-center gap-3">
          {lang && (
            <span className="text-xs uppercase text-gray-500">{lang}</span>
          )}
          <button
            onClick={handleCopy}
            className="text-xs text-gray-500 opacity-0 transition-opacity hover:text-gray-300 group-hover:opacity-100"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
      <pre ref={preRef} className="overflow-x-auto p-4 text-sm text-gray-100">
        {children}
      </pre>
    </div>
  );
}
