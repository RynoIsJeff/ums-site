import Section from "@/components/Section";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "Work — UMS",
  description: "Selected projects and outcomes.",
};

const CASES = [
  { slug: "supatrade", title: "Build It SupaTrade — Corporate Site & Ops", summary: "Next.js platform with job listings, admin flows, and growth stack.", stack: ["Next.js","Supabase","Tailwind","Prisma"] },
  { slug: "caplant", title: "CAPlant — Website Modernization", summary: "Migration from legacy Gulp stack, performance uplift, UX clean-up.", stack: ["Gulp","SCSS","Leaflet","Vercel"] },
  { slug: "tugam", title: "Tugam — Brand & Site Overhaul", summary: "Design system, content structure, faster landing experiences.", stack: ["Design System","SEO","React","Tailwind"] },
];

export default function WorkPage() {
  return (
    <main className="bg-white">
      <Section>
        <div className="container">
          <span className="kicker">Selected Work</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">Case studies & outcomes</h1>
          <p className="mt-4 text-black/70 max-w-2xl">
            A few snapshots from shipped projects. Replace with deeper write-ups and real metrics.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {CASES.map((c) => (
              <Card key={c.slug}>
                <div className="aspect-[16/10] w-full rounded-xl border border-black/10 bg-[linear-gradient(135deg,rgba(2,214,228,0.08),rgba(5,134,173,0.06))]" />
                <div className="mt-4">
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-black/70">{c.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.stack.map((t) => (
                      <span key={t} className="badge">{t}</span>
                    ))}
                  </div>
                  <a href={`/work/${c.slug}`} className="mt-3 inline-block text-sm" style={{ color: "var(--primary)" }}>
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
