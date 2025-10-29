import type { Metadata } from "next";
import "./globals.css";
import NavClient from "@/components/NavClient";

export const metadata: Metadata = {
  title: "Ultimate Marketing Smash — Build • Ship • Grow",
  description:
    "UMS is a full-stack studio for Web, App & Software development with a dedicated Digital Marketing arm. Build right, then scale.",
  openGraph: {
    images: ["https://ultimatemarketingsmash.com/og?title=Ultimate%20Marketing%20Smash&subtitle=Build%20%E2%80%A2%20Ship%20%E2%80%A2%20Grow"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Plausible Analytics (privacy friendly) */}
        <script
          defer
          data-domain="ultimatemarketingsmash.com"
          src="https://plausible.io/js/script.js"
        ></script>

        {/* Manifest & icons (served from /public) */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>

      <body suppressHydrationWarning className="antialiased">
        <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/80 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <img src="/ums-logo.png" alt="UMS" className="h-9 w-9" />
              <div className="leading-tight">
                <span className="block text-sm font-bold tracking-wide">
                  <span>Ultimate Marketing </span>
                  <span style={{ color: "var(--primary)" }}>Smash</span>
                </span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-black/60">
                  Your success is our Priority
                </span>
              </div>
            </a>

            <NavClient />
          </div>
        </header>

        <main>{children}</main>

        {/* Single blue divider before footer on every page */}
        <div className="ums-stripe" />

        <footer className="border-t border-black/[0.06] bg-white py-12">
          <div className="container grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <img src="/ums-logo.png" alt="UMS" className="h-8 w-8" />
              <p className="text-sm text-black/70">
                Full-stack development &amp; growth studio. Build right, then scale.
              </p>
              {/* Socials duplicated in footer for convenience */}
              <div className="mt-2 flex items-center gap-2">
                <a href="https://facebook.com/your-page" aria-label="Facebook" className="p-1.5 rounded-md hover:bg-black/[0.06]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" style={{ color: "var(--primary)" }}>
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.5l.5-4H14V7a1 1 0 0 1 1-1h3z" strokeWidth="2"></path>
                  </svg>
                </a>
                <a href="https://instagram.com/your-handle" aria-label="Instagram" className="p-1.5 rounded-md hover:bg-black/[0.06]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" style={{ color: "var(--primary)" }}>
                    <rect x="2" y="2" width="20" height="20" rx="5" strokeWidth="2"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth="2"></path>
                    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" strokeWidth="2"></line>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/your-company/" aria-label="LinkedIn" className="p-1.5 rounded-md hover:bg-black/[0.06]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" style={{ color: "var(--primary)" }}>
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-14h4v2" strokeWidth="2"></path>
                    <rect x="2" y="9" width="4" height="12" strokeWidth="2"></rect>
                    <circle cx="4" cy="4" r="2" strokeWidth="2"></circle>
                  </svg>
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
            <p>© {new Date().getFullYear()} Ultimate Marketing Smash (Pty) Ltd. All rights reserved.</p>
            <p>Build • Ship • Grow</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
