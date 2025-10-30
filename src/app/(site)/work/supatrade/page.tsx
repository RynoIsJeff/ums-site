import Section from "@/components/Section";
import CtaBand from "@/components/CtaBand";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "Case Study — SupaTrade Build It Group",
  description:
    "How Ultimate Marketing Smash helped Build It SupaTrade grow social engagement by 2500% and expand across five stores and multiple brands.",
  openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=SupaTrade%20Build%20It%20Group&subtitle=2500%25%20Growth%20in%20Social%20Engagement",
    ],
  },
};

export default function SupaTradeCase() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <Section>
        <div className="container max-w-5xl">
          <span className="kicker">Case Study</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">
            SupaTrade Build It Group
          </h1>
          <p className="mt-4 text-black/70 max-w-3xl">
            How Ultimate Marketing Smash transformed SupaTrade’s regional social media
            presence into a multi-brand digital ecosystem spanning five Build It stores,
            Engen Mbazwana, Steers Mbazwana and Debonairs Mbazwana — achieving
            over <strong>2500% growth</strong> in social engagement since 2022.
          </p>

          <div className="mt-8">
            <img
              src="/work/supatrade-hero.png"
              alt="SupaTrade Build It social and brand visuals"
              className="w-full rounded-xl border border-black/10"
            />
          </div>
        </div>
      </Section>

      {/* OVERVIEW */}
      <Section>
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-semibold">Background</h2>
          <p className="mt-3 text-black/70">
            In August 2022, Ultimate Marketing Smash approached SupaTrade Build It Pongola
            with a proposal to revitalise their social media presence. The engagement began
            as a one-store trial in September 2022. Within a few months, measurable growth
            and consistent content performance convinced SupaTrade to extend the partnership
            to all five Build It branches and their new Engen, Steers and Debonairs outlets
            in Mbazwana.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card index={0}>
              <h3 className="font-semibold text-lg">Client</h3>
              <p className="mt-2 text-sm text-black/70">
                SupaTrade Build It Group — Pongola, Ulundi, Mkuze, Manguzi, Mbazwana
              </p>
            </Card>
            <Card index={1}>
              <h3 className="font-semibold text-lg">Engagement</h3>
              <p className="mt-2 text-sm text-black/70">
                Full social media strategy, creative direction, community management and
                monthly reporting for Build It and associated brands.
              </p>
            </Card>
            <Card index={2}>
              <h3 className="font-semibold text-lg">Duration</h3>
              <p className="mt-2 text-sm text-black/70">
                September 2022 — Present (ongoing)
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* RESULTS */}
      <Section>
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-semibold">Results</h2>
          <p className="mt-3 text-black/70">
            Since taking over SupaTrade’s social media channels, UMS has achieved
            consistent month-on-month growth in reach, engagement, and in-store campaign
            participation. Compared to metrics recorded under the previous manager,
            engagement has increased by more than <strong>2500%</strong>.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card index={0}>
              <h3 className="font-semibold">Audience Growth</h3>
              <ul className="mt-3 list-disc pl-5 text-black/70 space-y-1">
                <li>5 Build It pages unified under one creative system</li>
                <li>Over 2500% increase in engagement since 2022</li>
                <li>Continuous month-on-month audience expansion</li>
              </ul>
            </Card>

            <Card index={1}>
              <h3 className="font-semibold">Operational Impact</h3>
              <ul className="mt-3 list-disc pl-5 text-black/70 space-y-1">
                <li>Streamlined campaign rollout across multiple regions</li>
                <li>Consistent brand tone and visual identity</li>
                <li>Improved coordination with local store teams</li>
              </ul>
            </Card>
          </div>
        </div>
      </Section>

      {/* UPCOMING PROJECT */}
      <Section>
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-semibold">Upcoming — SupaTrade HR Management Platform</h2>
          <p className="mt-3 text-black/70">
            In 2025, UMS identified a gap in SupaTrade’s internal hiring process and proposed
            a dedicated HR Management web platform to centralise recruitment and applicant
            tracking. SupaTrade has approved the concept, with full project development
            scheduled for <strong>2026</strong>.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card index={0}>
              <h3 className="font-semibold">Goals</h3>
              <ul className="mt-3 list-disc pl-5 text-black/70 space-y-1">
                <li>Streamline internal hiring across all stores</li>
                <li>Public job listings &amp; candidate management</li>
                <li>Integration with Supabase + Next.js Admin</li>
              </ul>
            </Card>
            <Card index={1}>
              <h3 className="font-semibold">Status</h3>
              <p className="mt-3 text-black/70">
                In planning phase — to commence 2026.  
                Designed, built and maintained by Ultimate Marketing Smash.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
