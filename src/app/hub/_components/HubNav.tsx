"use client";

import Image from "next/image";
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
  Megaphone,
  CheckSquare,
  Clock,
  FileSignature,
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
  { href: "/hub/ads", label: "Ads", icon: Megaphone },
  { href: "/hub/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/hub/time", label: "Time", icon: Clock },
  { href: "/hub/proposals", label: "Proposals", icon: FileSignature },
  { href: "/hub/settings", label: "Settings", icon: Settings, adminOnly: true },
];

type HubNavProps = {
  user: AppUser;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

function isActive(pathname: string, href: string) {
  if (href === "/hub") return pathname === "/hub";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HubNav({ user, collapsed, onToggle, mobileOpen = false, onCloseMobile }: HubNavProps) {
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
    <>
      {/* Mobile overlay — closes sidebar when tapped */}
      {onCloseMobile && (
        <div
          className={`hub-sidebar-overlay ${mobileOpen ? "hub-sidebar-overlay--open" : ""}`}
          onClick={onCloseMobile}
          onKeyDown={(e) => e.key === "Escape" && onCloseMobile()}
          role="button"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
      <aside
        className={`hub-sidebar ${collapsed ? "hub-sidebar--collapsed" : ""} ${mobileOpen ? "hub-sidebar--mobile-open" : ""}`}
      >
      {/* Logo area */}
      <div className="hub-sidebar__header">
        <Link href="/hub" className="hub-sidebar__logo">
          <span className="hub-sidebar__logo-mark hub-sidebar__logo-mark--img">
            <Image src="/ums-logo.svg" alt="UMS" width={20} height={20} className="h-5 w-5 object-contain" />
          </span>
          {!collapsed && (
            <span className="hub-sidebar__logo-text">
              UMS <span className="hub-sidebar__logo-accent">Hub</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => (mobileOpen ? onCloseMobile?.() : onToggle())}
          className="hub-sidebar__toggle hub-sidebar__toggle--mobile-close"
          aria-label={mobileOpen ? "Close menu" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {mobileOpen ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : collapsed ? (
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
              onClick={onCloseMobile}
            >
              <Icon className="hub-sidebar__link-icon" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="hub-sidebar__footer">
        <Link href="/" className="hub-sidebar__link hub-sidebar__link--muted" title={collapsed ? "Back to site" : undefined} onClick={onCloseMobile}>
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
          onClick={onCloseMobile}
        >
          <LogOut className="hub-sidebar__link-icon" />
          {!collapsed && <span>Log out</span>}
        </Link>
      </div>
    </aside>
    </>
  );
}
