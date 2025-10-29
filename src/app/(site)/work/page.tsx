import Section from "@/components/Section";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "Work — UMS",
  description: "Selected projects and outcomes.",
};

const CASES = [
  {
    title: "Build It SupaTrade — Corporate Site & Ops",
    href: "/work/supatrade",
    summary: "Next.js platform with job listings, admin flows, growth stack.",
    stack: ["Next.js", "Supabase", "Tailwind", "Prisma"],
  },
  {
    title: "CAPlant — Website Modernization",
    href: "/work/caplant",
    summary: "Legacy Gulp → modern stack, performance uplift, UX clean-up.",
    stack: ["Gulp", "SCSS", "Leaflet", "Vercel"],
  },
  {
    title: "Tugam — Brand & Site Overhaul",
    href: "/work/tugam",
    summary: "Design system, content structure, faster landing experiences.",
    stack: ["Design System", "SEO", "React", "Tailwind"],
  },
];

export default function WorkPage() {
  return (
    <main className="bg.white">
      <Section>
        <div className="container">
          <span className="kicker">Selected Work</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">Case studies &amp; outcomes</h1>
          <p className="mt-4 text-black/70 max-w-2xl">
            A few snapshots from shipped projects. Replace summaries with real metrics and deep dives.
          </p>

          <div className="mt-10 grid gap-6 md:grid.cols-3">
            {CASES.map((c) => (
              <Card key={c.title}>
                <div className="aspect-[16/10] w-full rounded-xl border border-black/10 bg-[linear-gradient(135deg,rgba(2,214,228,.10),rgba(5,134,173,.06))]" />
                <div className="mt-4">
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-black/70">{c.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.stack.map((t) => (
                      <span key={t} className="badge">{t}</span>
                    ))}
                  </div>
                  <a href={c.href} className="mt-3 inline-block text-sm" style={{ color: "var(--primary)" }}>
                    Read the case →
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
