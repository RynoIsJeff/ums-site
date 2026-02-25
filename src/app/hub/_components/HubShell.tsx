"use client";

import { useState } from "react";
import type { AppUser } from "@/lib/auth";
import { HubNav } from "./HubNav";

type HubShellProps = {
  user: AppUser;
  children: React.ReactNode;
};

export function HubShell({ user, children }: HubShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="hub-shell">
      <HubNav
        user={user}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div className="hub-content">
        <div className="hub-content__inner">{children}</div>
      </div>
    </div>
  );
}
