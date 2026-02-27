"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, ImageIcon, MessageCircle } from "lucide-react";

const TABS = [
  { href: "/hub/social", label: "Planner", icon: Calendar },
  { href: "/hub/social/pages", label: "Pages", icon: ImageIcon },
  { href: "/hub/social/messenger", label: "Messenger", icon: MessageCircle },
];

export function SocialNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 rounded-xl border border-(--hub-border-light) bg-white p-1 shadow-sm" aria-label="Social sections">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          tab.href === "/hub/social"
            ? pathname === "/hub/social" || pathname.startsWith("/hub/social/calendar") || pathname.startsWith("/hub/social/posts")
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-(--primary) text-white shadow-sm"
                : "text-(--hub-muted) hover:bg-black/5 hover:text-(--hub-text)"
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
