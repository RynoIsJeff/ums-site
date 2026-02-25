"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "billing", label: "Billing" },
  { id: "invoices", label: "Invoices" },
  { id: "social", label: "Social" },
  { id: "tasks", label: "Tasks" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ClientTabs({ clientId }: { clientId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get("tab") as TabId) || "overview";

  return (
    <nav className="flex gap-1 border-b border-black/10" aria-label="Client sections">
      {TABS.map((tab) => {
        const href = `${pathname}?tab=${tab.id}`;
        const isActive = current === tab.id;
        return (
          <Link
            key={tab.id}
            href={href}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
              isActive
                ? "border-black text-black"
                : "border-transparent text-black/60 hover:text-black"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
