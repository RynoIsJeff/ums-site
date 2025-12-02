import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import NavClient from "@/components/NavClient";
import { SOCIALS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ultimate Marketing Smash — Web, App & Digital Marketing",
  description:
    "UMS is a South African, founder-led studio building modern web & software products and running digital marketing for local and international brands.",
  openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=Ultimate%20Marketing%20Smash&subtitle=Web%2C%20App%20%26%20Digital%20Marketing",
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

      <body suppressHydrationWarning className="antialiased bg-white">
        {/* HEADER */}
        <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/80 backdrop-blur">
          <div className="container max-w-6xl flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="UMS home"
            >
              <img src="/ums-logo.svg" alt="UMS" className="h-9 w-9" />
              <div className="leading-tight">
                <span className="block text-sm font-bold tracking-wide">
                  <span>Ultimate Marketing </span>
                  <span style={{ color: "var(--primary)" }}>Smash</span>
                </span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-black/60">
                  Your success is our Priority
                </span>
              </div>
            </Link>

            <NavClient />
          </div>
        </header>

        <main>{children}</main>

        {/* Single blue divider before footer on every page */}
        <div className="ums-stripe" />

        {/* FOOTER */}
        <footer className="border-t border-black/[0.06] bg-white py-12">
          <div className="container max-w-6xl grid gap-8 md:grid-cols-4">
            {/* Brand & socials */}
            <div className="space-y-3">
              <Link href="/" aria-label="UMS home">
                <img src="/ums-logo.svg" alt="UMS" className="h-8 w-8" />
              </Link>
              <p className="text-sm text-black/70">
                Web, app &amp; digital marketing for brands that want results.
                Based in Pongola, working with clients across South Africa and
                remote.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={SOCIALS.facebook}
                  aria-label="Facebook"
                  className="rounded-md p-1.5 hover:bg-black/[0.06]"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    style={{ color: "var(--primary)" }}
                  >
                    <path
                      d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.5l.5-4H14V7a1 1 0 0 1 1-1h3z"
                      strokeWidth="2"
                    ></path>
                  </svg>
                </a>
                <a
                  href={SOCIALS.instagram}
                  aria-label="Instagram"
                  className="rounded-md p-1.5 hover:bg-black/[0.06]"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    style={{ color: "var(--primary)" }}
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      strokeWidth="2"
                    ></rect>
                    <path
                      d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
                      strokeWidth="2"
                    ></path>
                    <line
                      x1="17.5"
                      y1="6.5"
                      x2="17.5"
                      y2="6.5"
                      strokeWidth="2"
                    ></line>
                  </svg>
                </a>
                <a
                  href={SOCIALS.linkedin}
                  aria-label="LinkedIn"
                  className="rounded-md p-1.5 hover:bg-black/[0.06]"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    style={{ color: "var(--primary)" }}
                  >
                    <path
                      d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-14h4v2"
                      strokeWidth="2"
                    ></path>
                    <rect
                      x="2"
                      y="9"
                      width="4"
                      height="12"
                      strokeWidth="2"
                    ></rect>
                    <circle cx="4" cy="4" r="2" strokeWidth="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            {/* Development */}
            <div>
              <div className="text-sm font-semibold">Development</div>
              <ul className="mt-3 space-y-2 text-sm text-black/70">
                <li>Websites &amp; web apps</li>
                <li>Job portals &amp; HR tools</li>
                <li>Dashboards &amp; internal tools</li>
              </ul>
            </div>

            {/* Marketing */}
            <div>
              <div className="text-sm font-semibold">Marketing</div>
              <ul className="mt-3 space-y-2 text-sm text-black/70">
                <li>Social media &amp; content</li>
                <li>Meta &amp; Google Ads</li>
                <li>Analytics &amp; reporting</li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="text-sm font-semibold">Company</div>
              <ul className="mt-3 space-y-2 text-sm text-black/70">
                <li>
                  <Link href="/about" className="hover:text-black">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/work" className="hover:text-black">
                    Work &amp; case studies
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-black">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="container max-w-6xl mt-10 flex flex-col gap-2 items-start justify-between text-xs text-black/60 md:flex-row md:items-center">
            <p>
              © {new Date().getFullYear()} Ultimate Marketing Smash (Pty) Ltd.
              All rights reserved.
            </p>
            <p>YOUR SUCCESS IS OUR PRIORITY</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
