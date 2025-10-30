import Section from "@/components/Section";
import CtaBand from "@/components/CtaBand";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "Case Study — Tugam Game Farm",
  description:
    "How UMS launched TugamGameFarm.co.za fast on GoDaddy to get them online, and is now rebuilding it on the modern UMS stack for long-term growth.",
  openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=Tugam%20Game%20Farm&subtitle=Fast%20launch%20%E2%86%92%20Modern%20rebuild",
    ],
  },
};

export default function TugamCase() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <Section>
        <div className="container max-w-5xl">
          <span className="kicker">Case Study</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">Tugam Game Farm</h1>
          <p className="mt-4 text-black/70 max-w-3xl">
            Tugam needed to get online quickly with a professional website to showcase their game farm,
            accommodation and experiences. UMS first shipped a fast GoDaddy builder site to get them live,
            and is now rebuilding it using the same modern stack we used for CAPlant to make it easier to
            update, expand and market.
          </p>

          <div className="mt-8">
            <img
              src="/work/tugam-hero.png"
              alt="Tugam Game Farm website"
              className="w-full rounded-xl border border-black/10"
            />
          </div>
        </div>
      </Section>

      {/* PROJECT CONTEXT */}
      <Section>
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-semibold">Project Context</h2>
          <p className="mt-3 text-black/70">
            The goal was speed-to-live: Tugam needed a credible web presence fast — something they could
            point guests, hunters and partners to — without waiting for a full React/Next.js build. The
            first version was therefore done on GoDaddy’s website builder: fast to launch, clean and on-brand.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card index={0}>
              <h3 className="font-semibold text-lg">Client</h3>
              <p className="mt-2 text-sm text-black/70">
                Tugam Game Farm — accommodation, hunting &amp; farm experiences
              </p>
            </Card>
            <Card index={1}>
              <h3 className="font-semibold text-lg">Phase 1</h3>
              <p className="mt-2 text-sm text-black/70">
                GoDaddy builder site for quick go-live (TugamGameFarm.co.za)
              </p>
            </Card>
            <Card index={2}>
              <h3 className="font-semibold text-lg">Phase 2</h3>
              <p className="mt-2 text-sm text-black/70">
                Rebuild on UMS stack (Next.js + Tailwind), same approach as CAPlant
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* PHASE 1: FAST LAUNCH */}
      <Section>
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-semibold">Phase 1 — Fast Launch</h2>
          <p className="mt-3 text-black/70">
            We prioritised time-to-value: a neat hero, farm description, accommodation info, contact details,
            and a way for visitors to reach out. Using GoDaddy meant Tugam was live quickly, and could start
            sharing the link on social and with guests.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card index={0}>
              <h3 className="font-semibold">Why GoDaddy?</h3>
              <ul className="mt-3 list-disc pl-5 text-black/70 space-y-1">
                <li>Fast to ship, no custom infra to set up</li>
                <li>Budget-friendly for first version</li>
                <li>Good enough for “we exist” web presence</li>
              </ul>
            </Card>
            <Card index={1}>
              <h3 className="font-semibold">What we included</h3>
              <ul className="mt-3 list-disc pl-5 text-black/70 space-y-1">
                <li>Hero with farm intro</li>
                <li>About Tugam &amp; offering</li>
                <li>Contact / booking details</li>
              </ul>
            </Card>
          </div>
        </div>
      </Section>

      {/* PHASE 2: MODERN REBUILD */}
      <Section>
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-semibold">Phase 2 — Modern Rebuild (Current)</h2>
          <p className="mt-3 text-black/70">
            Now that Tugam is live and using the site, UMS is rebuilding it on the same stack as Civils Agri Plant.
            That gives Tugam a proper component-based site, easier updates, and better performance — and opens the door
            for marketing campaigns later.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Card index={0}>
              <h3 className="font-semibold">Tech stack</h3>
              <p className="mt-2 text-sm text-black/70">
                Next.js, Tailwind CSS, modern layout, image optimisation.
              </p>
            </Card>
            <Card index={1}>
              <h3 className="font-semibold">Content structure</h3>
              <p className="mt-2 text-sm text-black/70">
                Separate pages/sections for accommodation, farm info, animals/hunting, gallery.
              </p>
            </Card>
            <Card index={2}>
              <h3 className="font-semibold">Why rebuild?</h3>
              <p className="mt-2 text-sm text-black/70">
                Easier to scale content, better SEO, faster pages, consistent with other UMS sites.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* OUTCOME */}
      <Section>
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-semibold">Outcome</h2>
          <p className="mt-3 text-black/70">
            Tugam got online quickly without over-investing in v1, and now has a clear path to a fully custom,
            UMS-managed site that can grow with the business. This “launch fast → rebuild right” pattern is ideal for
            small tourism/agri brands that need to be visible immediately but still want a serious product later.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card index={0}>
              <h3 className="font-semibold">Immediate visibility</h3>
              <p className="mt-2 text-sm text-black/70">
                TugamGameFarm.co.za gave them a URL to send to visitors, hunters and partners.
              </p>
            </Card>
            <Card index={1}>
              <h3 className="font-semibold">Future-proofed</h3>
              <p className="mt-2 text-sm text-black/70">
                Rebuild on UMS stack means they can later add booking, galleries, or even a customer portal.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
