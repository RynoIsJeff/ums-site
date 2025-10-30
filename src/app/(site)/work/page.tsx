import Section from "@/components/Section";
import CtaBand from "@/components/CtaBand";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "Work — UMS",
  description: "Selected projects and outcomes.",
  openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=Selected%20Work&subtitle=Case%20studies%20%26%20outcomes",
    ],
  },
};

const CASES = [
  {
    slug: "supatrade",
    title: "SupaTrade Build It Group",
    summary:
      "From a one-store social-media trial to a full-scale digital partnership across five Build It branches and multiple brands — achieving over 2500% growth in engagement since 2022.",
    stack: ["Social Strategy", "Content Systems", "Analytics", "Upcoming HR Platform"],
    status: "Active + Upcoming Project",
    highlight: "2500% engagement growth",
    logo: "/client-logo/supatrade.png",
  },
  {
    slug: "caplant",
    title: "Civils Agri Plant (CAPlant)",
    summary:
      "UMS designed, built and now hosts Civils Agri Plant’s full website — showcasing their Plant Hire, Sand & Stone and Brick divisions with clear service pages and a lead-driven contact funnel.",
    stack: ["Website Build", "Service Pages", "Contact & Quote", "Hosted by UMS"],
    status: "Completed & Managed",
    highlight: "Live on caplant.co.za",
    logo: "/client-logo/caplant.png",
  },
  {
    slug: "tugam",
    title: "Tugam Game Farm",
    summary:
      "Fast v1 on GoDaddy to get TugamGameFarm.co.za live, now being rebuilt on the same modern UMS stack as CAPlant for better performance and easier updates.",
    stack: ["GoDaddy v1", "Next.js Rebuild", "Accommodation Pages", "UMS Managed"],
    status: "Live (rebuild in progress)",
    highlight: "Launch fast → Rebuild right",
    logo: "/client-logo/tugam.png",
  },
];

export default function WorkPage() {
  return (
    <main className="bg-white">
      <Section>
        <div className="container">
          <span className="kicker">Selected Work</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">
            Case studies &amp; outcomes
          </h1>
          <p className="mt-4 text-black/70 max-w-2xl">
            A snapshot of key projects we’ve built, scaled, or modernized — from multi-store retail
            groups to construction and agri/tourism. Each one shows the “build right → grow” mindset.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {CASES.map((c, i) => (
              <Card key={c.slug} index={i}>
                {/* logo block */}
                <div className="flex h-60 items-center justify-center rounded-xl border border-black/10 bg-white mb-4">
                  {c.logo ? (
                    <img
                      src={c.logo}
                      alt={c.title}
                      className="max-h-42 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-sm text-black/40">Client logo</span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-black/70">{c.summary}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.stack.map((t) => (
                      <span key={t} className="badge">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-black/60">
                    <span>{c.status}</span>
                    {c.highlight && (
                      <span className="font-semibold text-[var(--primary)]">
                        {c.highlight}
                      </span>
                    )}
                  </div>

                  <a
                    href={`/work/${c.slug}`}
                    className="mt-3 inline-block text-sm"
                    style={{ color: "var(--primary)" }}
                  >
                    Read the case →
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
