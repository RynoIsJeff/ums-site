import { Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EmptyState, type EmptyStateAction } from "./EmptyState";

type ComingSoonPlaceholderProps = {
  /** Feature name for title (e.g. "Campaign management" → "Campaign management coming soon") */
  feature: string;
  description: React.ReactNode;
  /** Optional icon - defaults to Clock for consistent "coming soon" look */
  icon?: LucideIcon;
  iconClassName?: string;
  supplemental?: React.ReactNode;
  footer?: React.ReactNode;
  primaryAction?: EmptyStateAction;
  secondaryActions?: EmptyStateAction[];
};

/**
 * Consistent "coming soon" placeholder for Hub pages (Campaigns, Insights, Messenger).
 * Uses shared EmptyState layout with standardized messaging.
 */
export function ComingSoonPlaceholder({
  feature,
  description,
  icon: Icon = Clock,
  iconClassName = "text-[var(--hub-muted)]",
  supplemental,
  footer,
  primaryAction,
  secondaryActions = [],
}: ComingSoonPlaceholderProps) {
  return (
    <EmptyState
      icon={Icon}
      iconClassName={iconClassName}
      title={`${feature} coming soon`}
      description={description}
      supplemental={supplemental}
      footer={footer}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
    />
  );
}
