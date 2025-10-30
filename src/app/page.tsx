import Badge from "@/components/ui/Badge";
import CtaBand from "@/components/CtaBand";
import { Code2, Megaphone, Cpu } from "lucide-react";

export const metadata = {
  title: "Ultimate Marketing Smash — Build • Ship • Grow",
  description:
    "UMS is an engineering-first studio for Web, App & Software development with a dedicated Digital Marketing arm.",
  openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=Ultimate%20Marketing%20Smash&subtitle=Build%20%E2%80%A2%20Ship%20%E2%80%A2%20Grow",
    ],
  },
};

export default function Home() {
  return (
    <>
      <section className="bg-white py-20 md:py-28 ums-bg-glow">
        <div className="container grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="kicker">Build • Ship • Grow</span>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
              We design &amp; build modern products — then help you grow them.
            </h1>
            <p className="mt-5 max-w-xl text-black/70">
              Build or upgrade your web/app/software first, then plug into our digital marketing unit.
              No public pricing — every scope is tailored.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="/development" className="btn-primary inline-flex items-center gap-2">
                <Code2 className="h-5 w-5" /> Explore Development
              </a>
              <a href="/marketing" className="btn-outline inline-flex items-center gap-2">
                <Megaphone className="h-5 w-5" /> Explore Marketing
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-black/60">
              {[
                "Next.js",
                "React",
                "TypeScript",
                "Tailwind",
                "Prisma",
                "Postgres",
                "Supabase",
                "Highcharts",
                "Google Cloud",
                "Stripe",
              ].map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(3,3,3,0.06)] overflow-hidden">
            {/* replace with /ums-intro.mp4 later */}
            <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-black/[0.06] bg-[linear-gradient(135deg,rgba(2,214,228,0.10),rgba(5,134,173,0.06))] grid place-items-center">
              <div className="text-center px-6">
                <Cpu className="mx-auto h-10 w-10" style={{ color: "var(--primary)" }} />
                <p className="mt-3 text-sm text-black/70">
                  Swap this block for your autoplay UMS intro video.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
