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
  heroImage?: string;
};

const CASES: Case[] = [
  {
    slug: "supatrade",
    title: "SupaTrade Build It Group",
    summary:
      "From a one-store social-media trial in Sept 2022 to a full multi-store, multi-brand rollout (5 Build It stores + Mbazwana Engen/Steers/Debonairs) with more than 2500% growth in social engagement. Upcoming: HR Management platform (2026).",
    stack: [
      "Social Strategy",
      "Content System",
      "Multi-Store Rollout",
      "Analytics & Reporting",
      "Upcoming HR Platform (2026)",
    ],
    outcomes: [
      "2500% growth vs previous social media manager",
      "Scaled from 1 store (Pongola) to 5 stores + Mbazwana brands",
      "Consistent brand & campaign execution across regions",
      "Identified hiring-process gap → proposed HR platform for 2026",
    ],
    heroImage: "/work/supatrade-hero.png",
  },
  {
    slug: "caplant",
    title: "Civils Agri Plant",
    summary:
      "UMS designed, built and now hosts Civils Agri Plant’s website to showcase Plant Hire, Sand & Stone and Bricks — structured around their real services, with a clear lead/contact funnel.",
    stack: [
      "Website Build",
      "Service-First Navigation",
      "Contact & Quote Flow",
      "Hosted by UMS",
      "SEO-Ready Structure",
    ],
    outcomes: [
      "Modern, mobile-friendly site reflecting actual offering",
      "Service pages for Plant Hire, Sand & Stone, Bricks",
      "Ongoing hosting & content updates handled by UMS",
      "Marketing-ready structure for future campaigns",
    ],
    heroImage: "/work/caplant-hero.png",
  },
  {
    slug: "tugam",
    title: "Tugam Cattle & Game Farm",
    summary:
      "Phase 1: fast GoDaddy site to get TugamGameFarm.co.za live. Phase 2: full custom static site (Gulp/HTML/SCSS, Bootstrap) on Vercel — accommodation, cattle, hunting, venue hire and contact.",
    stack: [
      "GoDaddy v1 (fast launch)",
      "Custom static site (Gulp, SCSS, Bootstrap)",
      "Vercel deploy & contact API",
      "UMS Managed",
    ],
    outcomes: [
      "Immediate online presence (Phase 1) to share with guests and hunters",
      "Full site: Accommodation, Cattle, Hunting, Venue, Contact with form",
      "Lodge galleries, Leaflet map, serverless contact form",
      "Live on TugamGameFarm.co.za (Vercel)",
    ],
    heroImage: "/work/tugam-hero.png",
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
        item.heroImage
          ? `https://ultimatemarketingsmash.com${item.heroImage}`
          : `https://ultimatemarketingsmash.com/og?title=${encodeURIComponent(
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
        <div className="container max-w-5xl">
          <span className="kicker">Case study</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">{item.title}</h1>
          <p className="mt-4 text-black/70">{item.summary}</p>

          <div className="mt-8">
            {item.heroImage ? (
              <img
                src={item.heroImage}
                alt={item.title}
                className="w-full rounded-xl border border-black/10"
              />
            ) : (
              <div className="aspect-16/9 w-full rounded-xl border border-black/10 bg-[linear-gradient(135deg,rgba(2,214,228,0.10),rgba(5,134,173,0.06))]" />
            )}
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card index={0}>
              <h3 className="font-semibold">Stack / Services</h3>
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
