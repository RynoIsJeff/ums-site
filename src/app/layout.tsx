import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ultimate Marketing Smash — Build • Ship • Grow",
  description:
    "UMS is a full-stack studio for Web, App & Software development with a dedicated Digital Marketing arm. Build right, then scale.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased">
        <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/80 backdrop-blur">
          <div className="ums-stripe" />
          <div className="container flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <img src="/ums-logo.png" alt="UMS" className="h-9 w-9" />
              <div className="leading-tight">
                <span className="block text-sm font-bold tracking-wide">Ultimate Marketing Smash</span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-black/60">Build • Ship • Grow</span>
              </div>
            </a>

            <nav className="hidden gap-6 text-sm text-black/80 md:flex">
              <a href="/development" className="nav-link hover:text-black">Web & App Dev</a>
              <a href="/marketing" className="nav-link hover:text-black">Digital Marketing</a>
              <a href="/work" className="nav-link hover:text-black">Work</a>
              <a href="/about" className="nav-link hover:text-black">About</a>
              <a href="/contact" className="nav-link hover:text-black">Contact</a>
            </nav>

            <a href="/contact" className="btn-primary hidden md:inline-block">Start a Project</a>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t border-black/[0.06] bg-white py-12">
          <div className="container grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <img src="/ums-logo.png" alt="UMS" className="h-8 w-8" />
              <p className="text-sm text-black/70">Full-stack development & growth studio. Build right, then scale.</p>
            </div>
            <div>
              <div className="text-sm font-semibold">Build</div>
              <ul className="mt-3 space-y-2 text-sm text-black/70">
                <li>Web & Platforms</li><li>Upgrades & Rescues</li><li>Security & QA</li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold">Grow</div>
              <ul className="mt-3 space-y-2 text-sm text-black/70">
                <li>Paid & Social</li><li>SEO & Content</li><li>CRM & Funnels</li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold">Company</div>
              <ul className="mt-3 space-y-2 text-sm text-black/70">
                <li>About</li><li>Careers</li><li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="container mt-10 flex items-center justify-between text-xs text-black/60">
            <p>© {new Date().getFullYear()} Ultimate Marketing Smash (Pty) Ltd. All rights reserved.</p>
            <p>Built in South Africa</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
