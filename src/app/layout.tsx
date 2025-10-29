import type { Metadata } from "next";
import "./globals.css";
import { Facebook, Instagram, Linkedin } from "lucide-react";

export const metadata: Metadata = {
  title: "Ultimate Marketing Smash — Build • Ship • Grow",
  description:
    "UMS is a full-stack studio for Web, App & Software development with a dedicated Digital Marketing arm. Build right, then scale.",
};

const SOCIALS = {
  facebook: "https://facebook.com/your-page",   // TODO: replace with real URL
  instagram: "https://instagram.com/your-handle", // TODO: replace with real URL
  linkedin: "https://www.linkedin.com/company/your-company/", // TODO: replace
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased">
        <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/80 backdrop-blur">
          <div className="ums-stripe" />
          <div className="container flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              {/* Use icon-only logo in /public/ums-logo.png if desired */}
              <img src="/ums-logo.png" alt="UMS" className="h-9 w-9" />
              <div className="leading-tight">
                <span className="block text-sm font-bold tracking-wide">
                  {/* Color only the word “Smash” */}
                  <span>Ultimate Marketing </span>
                  <span style={{ color: "var(--primary)" }}>Smash</span>
                </span>
                {/* SWAP: Header tagline becomes “Your success is our Priority” */}
                <span className="block text-[10px] uppercase tracking-[0.2em] text-black/60">
                  Your success is our Priority
                </span>
              </div>
            </a>

            <nav className="hidden items-center gap-6 text-sm text-black/80 md:flex">
              <a href="/development" className="nav-link hover:text-black">Web &amp; App Dev</a>
              <a href="/marketing" className="nav-link hover:text-black">Digital Marketing</a>
              <a href="/work" className="nav-link hover:text-black">Work</a>
              <a href="/about" className="nav-link hover:text-black">About</a>
              <a href="/contact" className="nav-link hover:text-black">Contact</a>
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              {/* Social icons in header */}
              <a href={SOCIALS.facebook} aria-label="Facebook" className="p-1.5 rounded-md hover:bg-black/[0.06]">
                <Facebook className="h-5 w-5" style={{ color: "var(--primary)" }} />
              </a>
              <a href={SOCIALS.instagram} aria-label="Instagram" className="p-1.5 rounded-md hover:bg-black/[0.06]">
                <Instagram className="h-5 w-5" style={{ color: "var(--primary)" }} />
              </a>
              <a href={SOCIALS.linkedin} aria-label="LinkedIn" className="p-1.5 rounded-md hover:bg-black/[0.06]">
                <Linkedin className="h-5 w-5" style={{ color: "var(--primary)" }} />
              </a>

              <a href="/contact" className="btn-primary">Start a Project</a>
            </div>
          </div>
        </header>

        {/* global section divider at very top of page content */}
        <div className="ums-stripe" />

        <main>{children}</main>

        <footer className="border-t border-black/[0.06] bg.white py-12">
          <div className="container grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <img src="/ums-logo.png" alt="UMS" className="h-8 w-8" />
              <p className="text-sm text-black/70">
                Full-stack development &amp; growth studio. Build right, then scale.
              </p>
              <div className="mt-2 flex items-center gap-2">
                {/* Social icons in footer */}
                <a href={SOCIALS.facebook} aria-label="Facebook" className="p-1.5 rounded-md hover:bg-black/[0.06]">
                  <Facebook className="h-5 w-5" style={{ color: "var(--primary)" }} />
                </a>
                <a href={SOCIALS.instagram} aria-label="Instagram" className="p-1.5 rounded-md hover:bg.black/[0.06]">
                  <Instagram className="h-5 w-5" style={{ color: "var(--primary)" }} />
                </a>
                <a href={SOCIALS.linkedin} aria-label="LinkedIn" className="p-1.5 rounded-md hover:bg-black/[0.06]">
                  <Linkedin className="h-5 w-5" style={{ color: "var(--primary)" }} />
                </a>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">Build</div>
              <ul className="mt-3 space-y-2 text-sm text-black/70">
                <li>Web &amp; Platforms</li>
                <li>Upgrades &amp; Rescues</li>
                <li>Security &amp; QA</li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold">Grow</div>
              <ul className="mt-3 space-y-2 text-sm text-black/70">
                <li>Paid &amp; Social</li>
                <li>SEO &amp; Content</li>
                <li>CRM &amp; Funnels</li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold">Company</div>
              <ul className="mt-3 space-y-2 text-sm text-black/70">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="container mt-10 flex items-center justify-between text-xs text-black/60">
            {/* SWAP: footer can keep the original line or remain minimal */}
            <p>© {new Date().getFullYear()} Ultimate Marketing Smash (Pty) Ltd. All rights reserved.</p>
            <p>Built • Ship • Grow</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
