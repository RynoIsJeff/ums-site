const VARIANT_STYLES: Record<string, { bg: string; text: string }> = {
  // Invoice
  DRAFT: { bg: "bg-black/5", text: "text-(--hub-muted)" },
  SENT: { bg: "bg-amber-50", text: "text-amber-700" },
  PAID: { bg: "bg-green-50", text: "text-green-700" },
  OVERDUE: { bg: "bg-red-50", text: "text-red-700" },
  VOID: { bg: "bg-black/5", text: "text-(--hub-muted)" },
  // Task
  TODO: { bg: "bg-black/5", text: "text-(--hub-muted)" },
  IN_PROGRESS: { bg: "bg-amber-50", text: "text-amber-700" },
  DONE: { bg: "bg-green-50", text: "text-green-700" },
  CANCELLED: { bg: "bg-black/5", text: "text-(--hub-muted)" },
  // TaskOccurrence
  PENDING: { bg: "bg-black/5", text: "text-(--hub-muted)" },
  COMPLETED: { bg: "bg-green-50", text: "text-green-700" },
  SKIPPED: { bg: "bg-black/5", text: "text-(--hub-muted)" },
  // SocialPost
  PROCESSING: { bg: "bg-amber-50", text: "text-amber-700" },
  SCHEDULED: { bg: "bg-amber-50", text: "text-amber-700" },
  PUBLISHED: { bg: "bg-green-50", text: "text-green-700" },
  FAILED: { bg: "bg-red-50", text: "text-red-700" },
  // Client
  LEAD: { bg: "bg-black/5", text: "text-(--hub-muted)" },
  ACTIVE: { bg: "bg-green-50", text: "text-green-700" },
  PAUSED: { bg: "bg-amber-50", text: "text-amber-700" },
  CHURNED: { bg: "bg-black/5", text: "text-(--hub-muted)" },
};

function formatLabel(status: string): string {
  return status.replace(/_/g, " ");
}

type StatusBadgeProps = {
  status: string;
  /** Override display label (default: status with underscores replaced) */
  label?: string;
  /** Smaller badge for dense tables */
  size?: "sm" | "md";
};

/**
 * Shared status badge for DRAFT/SENT/PAID, TODO/IN_PROGRESS/DONE, etc.
 */
export function StatusBadge({
  status,
  label = formatLabel(status),
  size = "sm",
}: StatusBadgeProps) {
  const style = VARIANT_STYLES[status] ?? {
    bg: "bg-black/5",
    text: "text-(--hub-muted)",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium ${style.bg} ${style.text} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      }`}
    >
      {label}
    </span>
  );
}
