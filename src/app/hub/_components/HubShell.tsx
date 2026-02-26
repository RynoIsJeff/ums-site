"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import type { AppUser } from "@/lib/auth";
import { HubNav } from "./HubNav";

type HubShellProps = {
  user: AppUser;
  children: React.ReactNode;
};

export function HubShell({ user, children }: HubShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="hub-shell">
      {/* Mobile header — visible only on small screens */}
      <header className="hub-mobile-header">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="hub-mobile-header__menu"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="hub-mobile-header__title">UMS Hub</span>
        <div className="hub-mobile-header__avatar">
          {(user.name?.[0] ?? user.email[0]).toUpperCase()}
        </div>
      </header>

      <HubNav
        user={user}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <div className="hub-content">
        <div className="hub-content__inner">{children}</div>
      </div>
    </div>
  );
}
