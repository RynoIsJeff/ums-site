import Section from "@/components/Section";
import Card from "@/components/ui/Card";
import { notFound } from "next/navigation";

type Case = {
  slug: string;
  title: string;
  summary: string;
  hero?: string;
  stack: string[];
  outcomes: string[];
};

const CASES: Case[] = [
  {
    slug: "supatrade",
    title: "Build It SupaTrade — Corporate Site & Ops",
    summary: "Next.js platform with job listings, admin flows, growth stack.",
    hero: "/case-supatrade.jpg",
    stack: ["Next.js", "Supabase", "Tailwind", "Prisma"],
    outcomes: [
      "Admin workflows for HR & listings",
      "Faster page loads and clearer IA",
      "Instrumentation to guide iteration",
    ],
  },
  {
    slug: "caplant",
    title: "CAPlant — Website Modernization",
    summary: "Migration from legacy Gulp stack, perf uplift, UX clean-up.",
    hero: "/case-caplant.jpg",
    stack: ["Gulp", "SCSS", "Leaflet", "Vercel"],
    outcomes: [
      "Modern build pipeline & hosting",
      "Improved navigation & call-to-actions",
      "Better SEO foundations",
    ],
  },
  {
    slug: "tugam",
    title: "Tugam — Brand & Site Overhaul",
    summary: "Design system, content structure, faster landing experiences.",
    hero: "/case-tugam.jpg",
    stack: ["Design System", "SEO", "React", "Tailwind"],
    outcomes: [
      "Consistent, reusable components",
      "Clearer product story",
      "Reduced bounce across key pages",
    ],
  },
];

export async function generateStaticParams() {
  return CASES.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export default function CasePage({ params }: { params: { slug: string } }) {
  const item = CASES.find((c) => c.slug === params.slug);
  if (!item) return notFound();

  return (
    <main className="bg-white">
      <Section>
        <div className="container max-w-4xl">
          <p className="text-xs font-semibold tracking-widest text-ink/60 uppercase">Case study</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">{item.title}</h1>
          <p className="mt-4 text-ink/70">{item.summary}</p>

          <div className="mt-8">
            <div className="aspect-[16/9] w-full rounded-xl border border-black/10 bg-[linear-gradient(135deg,rgba(2,214,228,0.08),rgba(5,134,173,0.06))]" />
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card>
              <h3 className="font-semibold">Stack</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.stack.map((t) => (
                  <span key={t} className="inline-flex items-center rounded-full border border-black/5 bg-black/[0.02] px-3 py-1 text-xs text-ink/70">{t}</span>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="font-semibold">Outcomes</h3>
              <ul className="mt-3 list-disc pl-5 text-ink/70 space-y-1">
                {item.outcomes.map((o) => <li key={o}>{o}</li>)}
              </ul>
            </Card>
          </div>
        </div>
      </Section>
    </main>
  );
}
