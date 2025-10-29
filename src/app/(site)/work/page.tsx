import Section from "@/components/Section";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "Work — UMS",
  description: "Selected projects and outcomes.",
};

const CASES = [
  {
    title: "Build It SupaTrade — Corporate Site & Ops",
    summary: "Next.js platform with job listings, admin flows, and growth stack.",
    stack: ["Next.js", "Supabase", "Tailwind", "Prisma"],
  },
  {
    title: "CAPlant — Website Modernization",
    summary: "Gulp → modern stack migration, performance uplift, UX clean-up.",
    stack: ["Gulp", "SCSS", "Leaflet", "Vercel"],
  },
  {
    title: "Tugam — Brand & Site Overhaul",
    summary: "Design system, content structure, and faster landing experiences.",
    stack: ["Design System", "SEO", "React", "Tailwind"],
  },
];

export default function WorkPage() {
  return (
    <main className="bg-white">
      <Section>
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold">Selected work</h1>
          <p className="mt-4 text-ink/70 max-w-2xl">
            A few snapshots from shipped projects. Replace summaries with real metrics and a deeper write-up per case.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {CASES.map((c) => (
              <Card key={c.title}>
                <div className="aspect-[16/10] w-full rounded-xl border border-black/10 bg-[linear-gradient(135deg,rgba(2,214,228,0.08),rgba(5,134,173,0.06))]" />
                <div className="mt-4">
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-ink/70">{c.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.stack.map((t) => (
                      <span key={t} className="inline-flex items-center rounded-full border border-black/5 bg-black/[0.02] px-3 py-1 text-xs text-ink/70">{t}</span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
