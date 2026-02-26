import Link from "next/link";
import type { LucideIcon } from "lucide-react";

function ActionIcon({ icon }: { icon?: LucideIcon }) {
  if (!icon) return null;
  const Icon = icon;
  return <Icon className="h-4 w-4" />;
}

export type EmptyStateAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
  external?: boolean;
  /** Use Meta blue for Meta-specific actions (e.g. Open Ads Manager, View on Facebook) */
  meta?: boolean;
  icon?: LucideIcon;
};

type EmptyStateProps = {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description: React.ReactNode;
  /** Optional supplemental line (e.g. "You have 2 ad accounts connected.") */
  supplemental?: React.ReactNode;
  /** Optional footer (e.g. "In the meantime, use...") */
  footer?: React.ReactNode;
  primaryAction?: EmptyStateAction;
  secondaryActions?: EmptyStateAction[];
  className?: string;
};

export function EmptyState({
  icon: Icon,
  iconClassName = "text-[var(--hub-muted)]",
  title,
  description,
  supplemental,
  footer,
  primaryAction,
  secondaryActions = [],
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--hub-border-light)] bg-white p-12 text-center shadow-sm ${className}`}
    >
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/5`}
      >
        <Icon className={`h-8 w-8 ${iconClassName}`} />
      </div>
      <h2 className="mt-6 text-lg font-semibold text-[var(--hub-text)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--hub-muted)]">{description}</p>
      {supplemental && (
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--hub-muted)]">{supplemental}</p>
      )}
      {(primaryAction || secondaryActions.length > 0) && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {primaryAction &&
            (primaryAction.external ? (
              <a
                href={primaryAction.href}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${
                  primaryAction.variant === "secondary"
                    ? "border border-[var(--hub-border-light)] bg-white text-[var(--hub-text)] hover:bg-black/5"
                    : primaryAction.meta
                      ? "bg-[var(--meta-blue)] text-white hover:bg-[var(--meta-blue-hover)]"
                      : "bg-[var(--primary)] text-white hover:opacity-90"
                }`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ActionIcon icon={primaryAction.icon} />
                {primaryAction.label}
              </a>
            ) : (
              <Link
                href={primaryAction.href}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${
                  primaryAction.variant === "secondary"
                    ? "border border-[var(--hub-border-light)] bg-white hover:bg-black/5"
                    : primaryAction.meta
                      ? "bg-[var(--meta-blue)] text-white hover:bg-[var(--meta-blue-hover)]"
                      : "bg-[var(--primary)] text-white hover:opacity-90"
                }`}
              >
                <ActionIcon icon={primaryAction.icon} />
                {primaryAction.label}
              </Link>
            ))}
          {secondaryActions.map((action) =>
            action.external ? (
              <a
                key={action.href}
                href={action.href}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--hub-border-light)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--hub-text)] hover:bg-black/5"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ActionIcon icon={action.icon} />
                {action.label}
              </a>
            ) : (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--hub-border-light)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--hub-text)] hover:bg-black/5"
              >
                <ActionIcon icon={action.icon} />
                {action.label}
              </Link>
            )
          )}
        </div>
      )}
      {footer && (
        <div className="mt-6 text-xs text-[var(--hub-muted)]">{footer}</div>
      )}
    </div>
  );
}
