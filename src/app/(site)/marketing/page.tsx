import Section from "@/components/Section";
import CtaBand from "@/components/CtaBand";
import Card from "@/components/ui/Card";
import { Megaphone, LineChart, Users } from "lucide-react";

export const metadata = {
  title: "Digital Marketing — UMS",
  description:
    "Social media, Meta & Google Ads, e-commerce marketing and analytics — built around your goals.",
  openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=Digital%20Marketing&subtitle=Your%20success%20is%20our%20Priority",
    ],
  },
};

const SERVICES = [
  {
    Icon: Megaphone,
    t: "Paid & Social",
    d: "Meta, Instagram, Google Search & Display, YouTube, TikTok. Creatives that drive real reach, foot traffic and conversions.",
  },
  {
    Icon: LineChart,
    t: "Analytics & Reporting",
    d: "GA4, Meta insights, foot-traffic trends, e-commerce dashboards and monthly reporting you can actually use.",
  },
  {
    Icon: Users,
    t: "Content & Community",
    d: "Full content systems, scheduling, engagement management and community support across multiple brands or stores.",
  },
];

const PROCESS = [
  {
    title: "01 — Audit & quick wins",
    text: "We start by reviewing your current social channels, ad accounts and web presence. Then we implement fast improvements to stabilise performance.",
  },
  {
    title: "02 — Strategy & rollout",
    text: "We map out your content system, tone, posting structure, paid strategy and any required assets. Then we execute monthly with tight feedback loops.",
  },
  {
    title: "03 — Optimise & scale",
    text: "Consistent reporting, creative experiments, budget reviews and channel expansion — always tied to real goals like sales, leads or foot traffic.",
  },
];

export default function MarketingPage() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <Section>
        <div className="container max-w-4xl">
          <span className="kicker">Marketing</span>
          <h1 className="mt-2 text-[2.1rem] md:text-5xl font-bold">
            Digital marketing for brands that want results.
          </h1>
          <p className="mt-4 text-black/70">
            From multi-store retail groups to online brands — we manage social
            media, run paid ads and build content systems that your business can
            grow on. No public pricing, because every plan is scoped
            per-channel, per-market and per-goal.
          </p>

          {/* Who this is for */}
          <p className="mt-6 text-sm text-black/60">Who this is for:</p>
          <ul className="mt-1 text-sm text-black/70 list-disc pl-5 space-y-1">
            <li>
              Retail groups with multiple branches (SupaTrade, Build It, Engen).
            </li>
            <li>E-commerce stores needing ads + content working together.</li>
            <li>
              Brands that want predictable monthly marketing with real
              reporting.
            </li>
          </ul>
        </div>
      </Section>

      {/* SERVICES */}
      <Section>
        <div className="container max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-semibold">
            What we help you do
          </h2>
          <p className="mt-3 text-black/70 max-w-2xl">
            From content creation to full paid media management — we plug into
            your team the same way we do for SupaTrade, Engen Mbazwana and our
            e-commerce partners.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3 text-left">
            {SERVICES.map(({ Icon, t, d }, i) => (
              <Card key={t} index={i}>
                <div
                  className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "color-mix(in oklab, var(--primary) 12%, #ffffff)",
                  }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: "var(--primary)" }}
                  />
                </div>
                <h3 className="font-semibold text-lg">{t}</h3>
                <p className="mt-2 text-sm text-black/70">{d}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* PROCESS */}
      <Section>
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-semibold">How we work</h2>
          <p className="mt-3 text-black/70 max-w-2xl">
            Whether you&apos;re running a single store or multiple brands, our
            marketing framework keeps things consistent, measurable and easy for
            you to manage.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PROCESS.map((step, index) => (
              <Card key={step.title} index={index}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-black/70">{step.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* MINI CTA */}
      <Section>
        <div className="container max-w-3xl text-center">
          <h2 className="text-2xl font-semibold">
            Need help with your marketing plan or monthly content?
          </h2>
          <p className="mt-3 text-sm text-black/70">
            Send us your current profiles, a few recent posts, or a quick Loom
            walkthrough — we&apos;ll explain exactly what we would change,
            improve or scale next.
          </p>
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
