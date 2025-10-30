import Section from "@/components/Section";
import CtaBand from "@/components/CtaBand";
import Card from "@/components/ui/Card";
import { notFound } from "next/navigation";

type Case = {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  outcomes: string[];
};

const CASES: Case[] = [
  {
    slug: "supatrade",
    title: "Build It SupaTrade — Corporate Site & Ops",
    summary: "Next.js platform with job listings, admin flows, growth stack.",
    stack: ["Next.js", "Supabase", "Tailwind", "Prisma"],
    outcomes: [
      "HR & job posting flow in one place",
      "Cleaner IA compared to legacy setup",
      "Modern stack ready for SupaTrade expansion",
    ],
  },
  {
    slug: "caplant",
    title: "CAPlant — Website Modernization",
    summary: "Migration from legacy Gulp stack, perf uplift, UX clean-up.",
    stack: ["Gulp", "SCSS", "Leaflet", "Vercel"],
    outcomes: [
      "Modern build & hosting pipeline",
      "Improved navigation & CTAs",
      "Better SEO foundations for plant hire keywords",
    ],
  },
  {
    slug: "tugam",
    title: "Tugam — Brand & Site Overhaul",
    summary: "Design system, content structure, and faster page loads.",
    stack: ["Design System", "SEO", "React", "Tailwind"],
    outcomes: [
      "Consistent, reusable components",
      "Clearer product story",
      "Reduced bounce on landing pages",
    ],
  },
];

export async function generateStaticParams() {
  return CASES.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: { params: { slug: string } }) {
  const item = CASES.find((c) => c.slug === params.slug);
  if (!item) return {};
  return {
    title: `${item.title} — UMS`,
    description: item.summary,
    openGraph: {
      images: [
        `https://ultimatemarketingsmash.com/og?title=${encodeURIComponent(
          item.title
        )}&subtitle=${encodeURIComponent("Case Study")}`,
      ],
    },
  };
}

export default function CasePage({ params }: { params: { slug: string } }) {
  const item = CASES.find((c) => c.slug === params.slug);
  if (!item) return notFound();

  return (
    <main className="bg-white">
      <Section>
        <div className="container max-w-4xl">
          <span className="kicker">Case study</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">{item.title}</h1>
          <p className="mt-4 text-black/70">{item.summary}</p>

          <div className="mt-8">
            <div className="aspect-[16/9] w-full rounded-xl border border-black/10 bg-[linear-gradient(135deg,rgba(2,214,228,0.10),rgba(5,134,173,0.06))]" />
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card index={0}>
              <h3 className="font-semibold">Stack</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.stack.map((t) => (
                  <span key={t} className="badge">
                    {t}
                  </span>
                ))}
              </div>
            </Card>
            <Card index={1}>
              <h3 className="font-semibold">Outcomes</h3>
              <ul className="mt-3 list-disc pl-5 text-black/70 space-y-1">
                {item.outcomes.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
