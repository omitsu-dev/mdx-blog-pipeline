import type { ReactNode } from "react";

type CalloutType = "info" | "tip" | "warn" | "danger";

const styles: Record<CalloutType, { accent: string; bg: string; label: string }> = {
  info: { accent: "#3b82f6", bg: "#eff6ff", label: "INFO" },
  tip: { accent: "#22c55e", bg: "#f0fdf4", label: "TIP" },
  warn: { accent: "#f59e0b", bg: "#fffbeb", label: "WARNING" },
  danger: { accent: "#ef4444", bg: "#fef2f2", label: "DANGER" },
};

export function Callout({
  type = "info",
  children,
}: {
  type?: CalloutType;
  children: ReactNode;
}) {
  const s = styles[type] ?? styles.info;

  return (
    <div
      className="my-6 rounded-lg border p-4"
      style={{
        borderColor: s.accent,
        borderTopWidth: "3px",
        backgroundColor: s.bg,
      }}
    >
      <p
        className="mb-2 text-xs font-bold tracking-widest"
        style={{ color: s.accent, fontFamily: "monospace" }}
      >
        {s.label}
      </p>
      <div className="text-sm leading-relaxed text-gray-800">{children}</div>
    </div>
  );
}
