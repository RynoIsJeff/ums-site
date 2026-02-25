"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppUser } from "@/lib/auth";
import { canAccessSettings } from "@/lib/rbac";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Wallet,
  Share2,
  CheckSquare,
  Settings,
  ArrowLeft,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

const HUB_LINKS: {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}[] = [
  { href: "/hub", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hub/clients", label: "Clients", icon: Users },
  { href: "/hub/billing", label: "Billing", icon: CreditCard },
  { href: "/hub/invoices", label: "Invoices", icon: FileText },
  { href: "/hub/payments", label: "Payments", icon: Wallet },
  { href: "/hub/social", label: "Social", icon: Share2 },
  { href: "/hub/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/hub/settings", label: "Settings", icon: Settings, adminOnly: true },
];

type HubNavProps = {
  user: AppUser;
  collapsed: boolean;
  onToggle: () => void;
};

function isActive(pathname: string, href: string) {
  if (href === "/hub") return pathname === "/hub";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HubNav({ user, collapsed, onToggle }: HubNavProps) {
  const pathname = usePathname();
  const scope = {
    role: user.role,
    userId: user.id,
    assignedClientIds: user.assignedClientIds,
  };
  const links = HUB_LINKS.filter(
    (link) => !link.adminOnly || canAccessSettings(scope)
  );

  return (
    <aside
      className={`hub-sidebar ${collapsed ? "hub-sidebar--collapsed" : ""}`}
    >
      {/* Logo area */}
      <div className="hub-sidebar__header">
        <Link href="/hub" className="hub-sidebar__logo">
          <span className="hub-sidebar__logo-mark">H</span>
          {!collapsed && (
            <span className="hub-sidebar__logo-text">
              UMS <span className="hub-sidebar__logo-accent">Hub</span>
            </span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="hub-sidebar__toggle"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="hub-sidebar__nav" aria-label="Hub navigation">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`hub-sidebar__link ${active ? "hub-sidebar__link--active" : ""}`}
              aria-current={active ? "page" : undefined}
              title={collapsed ? link.label : undefined}
            >
              <Icon className="hub-sidebar__link-icon" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="hub-sidebar__footer">
        <Link href="/" className="hub-sidebar__link hub-sidebar__link--muted" title={collapsed ? "Back to site" : undefined}>
          <ArrowLeft className="hub-sidebar__link-icon" />
          {!collapsed && <span>Back to site</span>}
        </Link>

        <div className="hub-sidebar__divider" />

        {/* User */}
        <div className="hub-sidebar__user">
          <div className="hub-sidebar__avatar">
            {(user.name?.[0] ?? user.email[0]).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="hub-sidebar__user-info">
              <span className="hub-sidebar__user-name">
                {user.name ?? user.email.split("@")[0]}
              </span>
              <span className="hub-sidebar__user-role">{user.role}</span>
            </div>
          )}
        </div>

        <Link
          href="/logout"
          className="hub-sidebar__link hub-sidebar__link--muted"
          title={collapsed ? "Log out" : undefined}
        >
          <LogOut className="hub-sidebar__link-icon" />
          {!collapsed && <span>Log out</span>}
        </Link>
      </div>
    </aside>
  );
}
