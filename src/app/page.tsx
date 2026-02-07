import Section from "@/components/Section";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import CtaBand from "@/components/CtaBand";
import { Code2, Megaphone, TrendingUp, Globe, Zap } from "lucide-react";

export const metadata = {
  title: "Ultimate Marketing Smash — Web, App & Digital Marketing",
  description:
    "UMS is a South African, founder-led studio building modern web & software products and running digital marketing for local and international brands.",
  openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=Ultimate%20Marketing%20Smash&subtitle=Web%2C%20App%20%26%20Digital%20Marketing",
    ],
  },
};

const HOME_CASES = [
  {
    slug: "supatrade",
    logo: "/client-logo/supatrade.png",
    title: "SupaTrade Build It Group",
    metric: "2500% engagement growth",
    summary:
      "From a single-store trial to a full multi-store, multi-brand digital rollout.",
  },
  {
    slug: "caplant",
    logo: "/client-logo/caplant.png",
    title: "Civils Agri Plant",
    metric: "Built & hosted by UMS",
    summary:
      "Service-first website for Plant Hire, Sand & Stone and Bricks — built and managed by UMS.",
  },
  {
    slug: "tugam",
    logo: "/client-logo/tugam.png",
    title: "Tugam Cattle & Game Farm",
    metric: "Custom site on Vercel",
    summary:
      "Full static site: accommodation, cattle, hunting, venue hire and contact — built and hosted by UMS.",
  },
];

export default function Home() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="bg-white ums-bg-glow py-14 md:py-16">
        <div className="container max-w-6xl grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="kicker">Your success is our Priority</span>
            <h1 className="mt-4 text-[2.25rem] leading-tight md:text-6xl md:leading-[1.1] font-extrabold tracking-tight">
              Web, app &amp; digital marketing for brands that want results.
            </h1>
            <p className="mt-5 max-w-xl text-black/70">
              We build and upgrade websites, apps and platforms — and we run
              digital marketing for local and international brands. From
              multi-store retail groups to e-commerce, we start where you are
              and move you forward.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/development"
                className="btn-primary inline-flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <Code2 className="h-5 w-5" />
                <span>Explore Development</span>
              </a>
              <a
                href="/marketing"
                className="btn-outline inline-flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <Megaphone className="h-5 w-5" />
                <span>Explore Marketing</span>
              </a>
            </div>

            {/* Trusted-by logos */}
            <div className="mt-7">
              <p className="text-xs font-semibold tracking-wide text-black/50 uppercase">
                Trusted by teams like
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-start md:justify-between gap-6 md:gap-10">
                <img
                  src="/client-logo/buildit.png"
                  alt="Build It SupaTrade"
                  className="h-12 md:h-16 xl:h-20 w-auto object-contain"
                />
                <img
                  src="/client-logo/engen.jpg"
                  alt="Engen Mbazwana"
                  className="h-12 md:h-16 xl:h-20 w-auto object-contain"
                />
                <img
                  src="/client-logo/steers.jpg"
                  alt="Steers Mbazwana"
                  className="h-12 md:h-16 xl:h-20 w-auto object-contain"
                />
                <img
                  src="/client-logo/debonairs.png"
                  alt="Debonairs Pizza Mbazwana"
                  className="h-12 md:h-16 xl:h-20 w-auto object-contain"
                />
                <img
                  src="/client-logo/supatrade.png"
                  alt="SupaTrade Build It Group"
                  className="h-12 md:h-16 xl:h-20 w-auto object-contain"
                />
                <img
                  src="/client-logo/caplant.png"
                  alt="Civils Agri Plant"
                  className="h-12 md:h-16 xl:h-20 w-auto object-contain"
                />
                <img
                  src="/client-logo/tugam.png"
                  alt="Tugam Cattle & Game Farm"
                  className="h-12 md:h-16 xl:h-20 w-auto object-contain"
                />
              </div>
            </div>

            {/* Capabilities */}
            <div className="mt-4">
              <p className="text-xs font-semibold tracking-wide text-black/50 uppercase">
                What we help with
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-black/60">
                {[
                  "Websites & web apps",
                  "Job portals & HR flows",
                  "Booking & enquiry funnels",
                  "Social media management",
                  "Meta & Instagram Ads",
                  "Google Search & Display",
                  "E-commerce campaigns",
                  "Analytics & reporting",
                ].map((t, idx) => (
                  <Badge
                    key={t}
                    className={idx > 5 ? "hidden sm:inline-flex" : ""}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Right side: stats / proof strip */}
          <div className="rounded-2xl border border-black/6 bg-white shadow-[0_8px_30px_rgba(3,3,3,0.06)] overflow-hidden p-6 md:p-8">
            <p className="text-xs font-semibold tracking-wide text-black/50 uppercase mb-6">
              Results that speak
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-[linear-gradient(135deg,rgba(2,214,228,0.12),rgba(5,134,173,0.08))] p-3">
                  <TrendingUp className="h-6 w-6" style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: "var(--primary)" }}>2500%</p>
                  <p className="mt-1 text-sm text-black/70">engagement growth (SupaTrade)</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-[linear-gradient(135deg,rgba(2,214,228,0.12),rgba(5,134,173,0.08))] p-3">
                  <Globe className="h-6 w-6" style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: "var(--primary)" }}>Web &amp; app</p>
                  <p className="mt-1 text-sm text-black/70">sites built and hosted by UMS</p>
                </div>
              </div>
              <div className="flex items-start gap-4 sm:col-span-2">
                <div className="rounded-xl bg-[linear-gradient(135deg,rgba(2,214,228,0.12),rgba(5,134,173,0.08))] p-3">
                  <Zap className="h-6 w-6" style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: "var(--primary)" }}>Local &amp; international</p>
                  <p className="mt-1 text-sm text-black/70">From Pongola to multi-store rollouts and e‑commerce campaigns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <Section>
        <div className="container max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-semibold">What we do</h2>
          <p className="mt-3 text-black/70 max-w-2xl">
            UMS is both a build partner and a marketing partner. Some clients
            need one, some need both — we plug in where it makes the most sense
            for your stage.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Development */}
            <div className="card-accent p-6">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                <h3 className="font-semibold text-lg">
                  Web, app &amp; software
                </h3>
              </div>
              <p className="mt-2 text-sm text-black/70">
                Modern, fast builds using Next.js, React and Tailwind — or quick
                builder sites when speed matters more than complexity.
              </p>
              <ul className="mt-3 text-sm text-black/70 space-y-1 list-disc pl-5">
                <li>New websites &amp; web apps</li>
                <li>Rescues &amp; rebuilds of existing sites</li>
                <li>Job portals, HR tools &amp; internal dashboards</li>
                <li>Hosting, maintenance &amp; content updates</li>
              </ul>
            </div>

            {/* Marketing */}
            <div className="card-accent p-6">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                <h3 className="font-semibold text-lg">
                  Digital marketing &amp; growth
                </h3>
              </div>
              <p className="mt-2 text-sm text-black/70">
                Always grounded in real numbers — from local foot traffic to
                e-commerce ROAS and international campaigns.
              </p>
              <ul className="mt-3 text-sm text-black/70 space-y-1 list-disc pl-5">
                <li>Social media for single &amp; multi-store brands</li>
                <li>Meta &amp; Google Ads, including e-commerce</li>
                <li>Content &amp; creative systems that scale</li>
                <li>Reporting, optimisation &amp; ongoing support</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* RECENT RESULTS */}
      <Section>
        <div className="container max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-semibold">Recent results</h2>
          <p className="mt-3 text-black/70 max-w-2xl">
            A few examples of how we combine product thinking and marketing to
            get real-world outcomes.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {HOME_CASES.map((c, i) => (
              <Card key={c.slug} index={i}>
                <div className="flex h-16 items-center mb-3">
                  <img
                    src={c.logo}
                    alt={c.title}
                    className="max-h-12 w-auto object-contain"
                  />
                </div>

                <h3 className="font-semibold text-sm">{c.title}</h3>
                <p className="mt-1 text-xs font-semibold text-(--primary)">
                  {c.metric}
                </p>
                <p className="mt-1 text-xs text-black/70">{c.summary}</p>
                <a
                  href={`/work/${c.slug}`}
                  className="mt-3 inline-block text-xs"
                  style={{ color: "var(--primary)" }}
                >
                  View case study →
                </a>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
