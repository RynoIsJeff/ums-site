import Section from "@/components/Section";
import CtaBand from "@/components/CtaBand";
import Card from "@/components/ui/Card";
import { Megaphone, LineChart, Users } from "lucide-react";

export const metadata = {
  title: "Digital Marketing — UMS",
  description:
    "Paid, SEO, content, CRM. Only after the product is right.",
  openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=Digital%20Marketing&subtitle=Build%20%E2%80%A2%20Ship%20%E2%80%A2%20Grow",
    ],
  },
};

export default function MarketingPage() {
  const items = [
    {
      Icon: Megaphone,
      t: "Paid & Social",
      d: "Meta, TikTok, Google, YouTube, KOL with creative that converts.",
    },
    {
      Icon: LineChart,
      t: "SEO & Content",
      d: "Technical SEO, content systems, landing experiences that rank.",
    },
    {
      Icon: Users,
      t: "CRM & Funnels",
      d: "Email/SMS automation, onboarding, LTV-centric lifecycle.",
    },
  ];

  return (
    <main className="bg-white">
      <Section>
        <div className="container text-center">
          <span className="kicker">Go-to-Market</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">Digital Marketing</h1>
          <p className="mt-4 text-black/70 max-w-2xl mx-auto">
            You ship — then we scale. We don’t publish pricing because we scope per-project, per-channel and per-market.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3 text-left">
            {items.map(({ Icon, t, d }, i) => (
              <Card key={t} index={i}>
                <Icon className="h-5 w-5 mb-3" style={{ color: "var(--primary)" }} />
                <h3 className="font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-black/70">{d}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
