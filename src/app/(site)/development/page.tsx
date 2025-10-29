import { Code2, Wrench, ShieldCheck, Workflow, Palette, LineChart } from "lucide-react";
import Section from "@/components/Section";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "Web, App & Software Development — UMS",
  description: "Engineering-first builds, upgrades, and rescues. Maintainable, scalable, measurable.",
};

export default function DevPage() {
  const items = [
    { Icon: Code2, t: "Web & Platforms", d: "Next.js apps, portals, dashboards, e-commerce, headless CMS." },
    { Icon: Wrench, t: "Upgrades & Rescues", d: "Refactors, performance, accessibility, dependency audits, CI/CD." },
    { Icon: ShieldCheck, t: "Security & QA", d: "API hardening, tests, telemetry, Sentry, on-call support." },
    { Icon: Workflow, t: "Process", d: "Milestone-based delivery, tight feedback loops, clear docs." },
    { Icon: Palette, t: "Design Systems", d: "Tokens, shadcn/ui, accessible components that scale." },
    { Icon: LineChart, t: "Instrumentation", d: "Analytics, flags, A/B tests to guide the roadmap." },
  ];
  return (
    <main className="bg-white">
      <Section>
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold">Web, App & Software Development</h1>
          <p className="mt-4 text-ink/70 max-w-2xl">
            Greenfield builds, upgrades, and rescues with maintainable, scalable foundations. We scope per-project;
            no public pricing.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {items.map(({ Icon, t, d }) => (
              <Card key={t}>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--primary)]/10">
                  <Icon className="h-5 w-5 text-[color:var(--primary)]" />
                </div>
                <h3 className="text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-ink/70">{d}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
