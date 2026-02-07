"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Linkedin, Menu, X } from "lucide-react";
import { SOCIALS } from "@/lib/site";

const NAV_ITEMS = [
  { href: "/development", label: "Web & App Dev" },
  { href: "/marketing", label: "Digital Marketing" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavClient() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) =>
    [
      "nav-link text-sm transition-colors hover:text-black",
      isActive(pathname, href) ? "text-black font-semibold" : "text-black/80",
    ].join(" ");

  return (
    <>
      {/* DESKTOP NAV LINKS */}
      <nav className="hidden items-center gap-6 md:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(item.href)}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* DESKTOP SOCIALS + CTA */}
      <div className="hidden items-center gap-3 md:flex">
        <a
          href={SOCIALS.facebook}
          aria-label="Facebook"
          target="_blank"
          rel="noreferrer"
          className="rounded-md p-1.5 hover:bg-black/6"
        >
          <Facebook className="h-5 w-5" style={{ color: "var(--primary)" }} />
        </a>
        <a
          href={SOCIALS.instagram}
          aria-label="Instagram"
          target="_blank"
          rel="noreferrer"
          className="rounded-md p-1.5 hover:bg-black/6"
        >
          <Instagram className="h-5 w-5" style={{ color: "var(--primary)" }} />
        </a>
        <a
          href={SOCIALS.linkedin}
          aria-label="LinkedIn"
          target="_blank"
          rel="noreferrer"
          className="rounded-md p-1.5 hover:bg-black/6"
        >
          <Linkedin className="h-5 w-5" style={{ color: "var(--primary)" }} />
        </a>

        <Link href="/contact" className="btn-primary">
          Start a Project
        </Link>
      </div>

      {/* MOBILE: MENU TOGGLE BUTTON */}
      <div className="md:hidden">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-black/10 p-2 text-black/70"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* MOBILE: SLIDE-DOWN PANEL (FULL WIDTH) */}
      {open && (
        <div className="fixed inset-x-0 top-14 z-40 border-t border-black/5 bg-white/95 backdrop-blur md:hidden">
          <div className="container py-3">
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                    isActive(pathname, item.href)
                      ? "bg-black/3 text-black font-semibold"
                      : "text-black/70 hover:bg-black/2"
                  }`}
                  aria-current={
                    isActive(pathname, item.href) ? "page" : undefined
                  }
                  onClick={() => setOpen(false)}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-4 flex items-center justify-between gap-4">
              {/* Mobile socials */}
              <div className="flex items-center gap-3 text-black/60">
                <a
                  href={SOCIALS.facebook}
                  aria-label="Facebook"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md p-1.5 hover:bg-black/6"
                >
                  <Facebook
                    className="h-4 w-4"
                    style={{ color: "var(--primary)" }}
                  />
                </a>
                <a
                  href={SOCIALS.instagram}
                  aria-label="Instagram"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md p-1.5 hover:bg-black/6"
                >
                  <Instagram
                    className="h-4 w-4"
                    style={{ color: "var(--primary)" }}
                  />
                </a>
                <a
                  href={SOCIALS.linkedin}
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md p-1.5 hover:bg-black/6"
                >
                  <Linkedin
                    className="h-4 w-4"
                    style={{ color: "var(--primary)" }}
                  />
                </a>
              </div>

              {/* Mobile CTA */}
              <Link
                href="/contact"
                className="inline-flex flex-1 justify-center rounded-full border border-(--primary) px-3 py-1.5 text-xs font-semibold text-(--primary) hover:bg-(--primary) hover:text-white transition-colors"
                onClick={() => setOpen(false)}
              >
                Start a Project
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
