import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

/**
 * Breadcrumb navigation: Hub > Clients > Acme Corp
 */
export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center gap-1.5 text-sm text-[var(--hub-muted)] ${className}`}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <span className="text-[var(--hub-muted)]/60" aria-hidden>
                ›
              </span>
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-[var(--hub-muted)] hover:text-[var(--hub-text)] hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast ? "font-medium text-[var(--hub-text)]" : "text-[var(--hub-muted)]"
                }
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
