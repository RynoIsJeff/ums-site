import Link from "next/link";

const TABS = [
  { key: "invoices", href: "/hub/invoices", label: "Invoices" },
  { key: "quotes", href: "/hub/invoices/quotes", label: "Quotes" },
] as const;

type Props = {
  /** Which tab is the current page. */
  active: (typeof TABS)[number]["key"];
  className?: string;
};

/** Invoices ↔ Quotes switcher shown at the top of both list pages. */
export function BillingDocTabs({ active, className = "" }: Props) {
  return (
    <nav
      className={`flex items-center gap-1 border-b border-(--hub-border-light) ${className}`}
      aria-label="Invoices and quotes"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${
              isActive
                ? "border-(--primary) text-(--hub-text)"
                : "border-transparent text-(--hub-muted) hover:text-(--hub-text)"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
