"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Target, BarChart3 } from "lucide-react";

const TABS = [
  { href: "/hub/ads", label: "Overview", icon: LayoutDashboard },
  { href: "/hub/ads/accounts", label: "Ad accounts", icon: Building2 },
  { href: "/hub/ads/campaigns", label: "Campaigns", icon: Target },
  { href: "/hub/ads/insights", label: "Insights", icon: BarChart3 },
];

export function AdsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 rounded-xl border border-[var(--hub-border-light)] bg-white p-1 shadow-sm" aria-label="Ads sections">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          tab.href === "/hub/ads"
            ? pathname === "/hub/ads"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-[var(--hub-muted)] hover:bg-black/5 hover:text-[var(--hub-text)]"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
