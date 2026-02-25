import type { Metadata } from "next";
import "./globals.css";

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
        <script
          defer
          data-domain="ultimatemarketingsmash.com"
          src="https://plausible.io/js/script.js"
        ></script>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body suppressHydrationWarning className="antialiased bg-white">
        {children}
      </body>
    </html>
  );
}
