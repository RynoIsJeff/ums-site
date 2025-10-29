import { Code2, Megaphone, Cpu } from "lucide-react";
import Badge from "@/components/ui/Badge";

export default function Home() {
  return (
    <>
      {/* Hero with blue glow */}
      <section className="bg-white py-20 md:py-28 ums-bg-glow">
        <div className="container grid items-center gap-12 md:grid-cols-2">
          <div>
            {/* SWAP: hero eyebrow now shows “Build • Ship • Grow” */}
            <span className="kicker">Build • Ship • Grow</span>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
              We design &amp; build modern products — then help you grow them.
            </h1>
            <p className="mt-5 max-w-xl text-black/70">
              UMS is an engineering-first studio for Web, App &amp; Software development.
              Once your product is solid, our dedicated Digital Marketing arm scales it.
              We don’t publish pricing — every roadmap is tailored to your context.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="/development" className="btn-primary">
                <span className="inline-flex items-center gap-2">
                  <Code2 className="h-5 w-5" /> Explore Development
                </span>
              </a>
              <a href="/marketing" className="btn-outline">
                <span className="inline-flex items-center gap-2">
                  <Megaphone className="h-5 w-5" /> Explore Marketing
                </span>
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-black/60">
              {["Next.js","React","TypeScript","Tailwind","Prisma","Postgres","Supabase","Highcharts","Google Cloud","Stripe"].map(t => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border.black/[0.06] bg-[linear-gradient(135deg,rgba(2,214,228,0.10),rgba(5,134,173,0.06))] grid place-items-center">
              <div className="text-center">
                <Cpu className="mx-auto h-10 w-10" style={{ color: "var(--primary)" }} />
                <p className="mt-3 text-sm text-black/70">Swap for a case-study reel or product shots.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section divider visible under hero on home */}
      <div className="ums-stripe" />
    </>
  );
}
