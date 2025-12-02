import Section from "@/components/Section";
import CtaBand from "@/components/CtaBand";
import Card from "@/components/ui/Card";
import {
  Code2,
  Wrench,
  ShieldCheck,
  Workflow,
  Palette,
  LineChart,
} from "lucide-react";

export const metadata = {
  title: "Web, App & Software Development — UMS",
  description:
    "Modern websites, apps and internal tools for brands that want results. New builds, rescues and upgrades — built on a stack that can grow with you.",
  openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=Web%2C%20App%20%26%20Software%20Development&subtitle=Your%20success%20is%20our%20Priority",
    ],
  },
};

const OFFERINGS = [
  {
    Icon: Code2,
    t: "Websites & platforms",
    d: "Next.js marketing sites, portals, dashboards and simple web apps — fast, modern and easy to update.",
  },
  {
    Icon: Wrench,
    t: "Upgrades & rescues",
    d: "If your current site is slow, dated or hard to manage, we rebuild it on a stack that’s easier to grow.",
  },
  {
    Icon: ShieldCheck,
    t: "Stable, secure builds",
    d: "Solid foundations: performance, basic security, backups and monitoring so you’re not flying blind.",
  },
  {
    Icon: Workflow,
    t: "Job portals & internal tools",
    d: "From HR flows to store-level dashboards — tools that your team will actually use, not ignore.",
  },
  {
    Icon: Palette,
    t: "Design & components",
    d: "Clean, consistent UI that fits your brand, with reusable components instead of one-off pages.",
  },
  {
    Icon: LineChart,
    t: "Built to be measured",
    d: "Analytics, goals and basic funnels wired in so your marketing has something real to work with.",
  },
];

const PROCESS_STEPS = [
  {
    title: "01 — Discovery & audit",
    text: "We look at what you have today (if anything), what’s working, what’s not and where you want to go. For existing sites, we audit structure, content and performance.",
  },
  {
    title: "02 — Scope & plan",
    text: "We agree on a practical v1: what we ship first, what can wait, and how it fits with your team and budget. No public price grid — everything is scoped to your reality.",
  },
  {
    title: "03 — Design, build & launch",
    text: "We design, develop and ship in tight feedback loops. We handle launch, DNS and basic training so you’re confident using what we’ve built.",
  },
];

export default function DevPage() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <Section>
        <div className="container max-w-4xl">
          <span className="kicker">Development</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">
            Web, app &amp; software development built to grow with you.
          </h1>
          <p className="mt-4 text-black/70">
            Some clients come to us with nothing but an idea. Others already
            have a website or internal tool that&apos;s holding them back. We
            build and modernise websites, apps and platforms on a modern stack —
            so your marketing and operations have something solid to stand on.
          </p>
        </div>
      </Section>

      {/* HOW WE CAN PLUG IN */}
      <Section>
        <div className="container max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-semibold">
            How we can plug into your team
          </h2>
          <p className="mt-3 text-black/70 max-w-2xl">
            We don&apos;t force you into a one-size-fits-all package. You might
            need a fresh build, a rebuild of something that&apos;s already live,
            or a focused internal tool for your staff — we scope around that.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {OFFERINGS.map(({ Icon, t, d }, i) => (
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
                <h3 className="text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-black/70">{d}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* PROCESS */}
      <Section>
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-semibold">
            What working with UMS looks like
          </h2>
          <p className="mt-3 text-black/70 max-w-2xl">
            Clear steps, no disappearing devs, and builds that connect with your
            marketing, HR or operations — not just your codebase.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PROCESS_STEPS.map((step, index) => (
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

      <CtaBand />
    </main>
  );
}
