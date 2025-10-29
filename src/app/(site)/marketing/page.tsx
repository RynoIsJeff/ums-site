import Section from "@/components/Section";
import Card from "@/components/ui/Card";
import { Megaphone, LineChart, Users } from "lucide-react";

export const metadata = {
  title: "Digital Marketing — UMS",
  description: "Paid, SEO, CRM. Once your product is solid, we scale it across the right channels.",
    openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=Digital%20Marketing&subtitle=Your%20success%20is%20our%20Priority",
    ],
  },
};

export default function MarketingPage() {
  const items = [
    { Icon: Megaphone, t: "Paid & Social", d: "Meta, TikTok, Google, YouTube, KOL with creative that converts." },
    { Icon: LineChart, t: "SEO & Content", d: "Technical SEO, content systems, search-led landing experiences." },
    { Icon: Users, t: "CRM & Funnels", d: "Email/SMS automation, onboarding flows, LTV-centric lifecycle." },
  ];
  return (
    <main className="bg-white">
      <Section>
        <div className="container text-center">
          <span className="kicker">Go-to-Market</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">Digital Marketing</h1>
          <p className="mt-4 text-black/70 max-w-2xl mx-auto">
            Once your product is right, we scale it across the channels that matter. We don’t publish pricing — every
            engagement is scoped to your context.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3 text-left">
            {items.map(({ Icon, t, d }) => (
              <Card key={t}>
                <Icon className="h-5 w-5 mb-3" style={{ color: "var(--primary)" }} />
                <h3 className="font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-black/70">{d}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
