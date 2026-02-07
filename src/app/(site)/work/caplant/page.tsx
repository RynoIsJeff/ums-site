import Section from "@/components/Section";
import CtaBand from "@/components/CtaBand";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "Case Study — Civils Agri Plant",
  description:
    "How UMS designed, built and now hosts Civils Agri Plant’s website to showcase plant hire, sand & stone and bricks, with a clear lead funnel.",
  openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=Civils%20Agri%20Plant&subtitle=Plant%20Hire%20%E2%80%A2%20Sand%20%26%20Stone%20%E2%80%A2%20Bricks",
    ],
  },
};

export default function CivilsAgriPlantCase() {
  return (
    <main className="bg-white">
      <Section>
        <div className="container max-w-5xl">
          <span className="kicker">Case Study</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">
            Civils Agri Plant
          </h1>
          <p className="mt-4 text-black/70 max-w-3xl">
            Civils Agri Plant needed a modern, product-led website to showcase their construction and agriculture
            services — plant hire, sand &amp; stone, and bricks — and convert visitors into quote requests.
            UMS built the site, structured the services, and hosts it for them.
          </p>

          <div className="mt-8">
            <img
              src="/work/caplant-hero.png"
              alt="Civils Agri Plant website designed and developed by UMS"
              className="w-full rounded-xl border border-black/10"
            />
          </div>
        </div>
      </Section>

      <Section>
        <div className="container max-w-5xl">
          <h2 className="text-2xl font-semibold">Project Context</h2>
          <p className="mt-3 text-black/70">
            Civils Agri Plant serves the Western Cape construction and agriculture sector, offering
            material supply and earthmoving — but the business needed a site that clearly explained
            everything they do (plant hire, sand &amp; stone, bricks) and made it easy for people to
            reach out. The previous online presence didn’t fully reflect the breadth of services or
            make lead generation easy.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card index={0}>
              <h3 className="font-semibold text-lg">Client</h3>
              <p className="mt-2 text-sm text-black/70">
                Civils Agri Plant, Paarl, Western Cape, South Africa
              </p>
            </Card>
            <Card index={1}>
              <h3 className="font-semibold text-lg">Scope</h3>
              <p className="mt-2 text-sm text-black/70">
                Website design &amp; build, service pages, quote/contact flow, hosting.
              </p>
            </Card>
            <Card index={2}>
              <h3 className="font-semibold text-lg">Delivered by</h3>
              <p className="mt-2 text-sm text-black/70">
                Ultimate Marketing Smash (UMS)
              </p>
            </Card>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container max-w-5xl">
          <h2 className="text-2xl font-semibold">What UMS Built</h2>
          <p className="mt-3 text-black/70">
            We built a clean, sectional website that matches Civils Agri Plant’s actual service tree — so the
            pages people visit most (“Plant Hire”, “Sand &amp; Stone”, “Bricks”) are now direct entries
            from the nav and not hidden under generic content. Each service page is written to convert:
            headline, what we supply, and a clear contact/quote action.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card index={0}>
              <h3 className="font-semibold">Service-First Navigation</h3>
              <ul className="mt-3 list-disc pl-5 text-black/70 space-y-1">
                <li>Top-level: Home, Plant Hire, Sand &amp; Stone, Bricks, Gallery, About, Contact</li>
                <li>Matches their real-world offering and phone/email inquiries</li>
                <li>“Get a Quote” visible across pages</li>
              </ul>
            </Card>

            <Card index={1}>
              <h3 className="font-semibold">Lead Capture &amp; Contact</h3>
              <ul className="mt-3 list-disc pl-5 text-black/70 space-y-1">
                <li>Contact page with address, phone and email</li>
                <li>Form to request advice or a quotation</li>
                <li>Built to be hosted and managed by UMS ongoing</li>
              </ul>
            </Card>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container max-w-5xl">
          <h2 className="text-2xl font-semibold">Hosting &amp; Ongoing Management</h2>
          <p className="mt-3 text-black/70">
            UMS hosts the Civils Agri Plant website and keeps content, links and contact details up to date.
            The client doesn’t have to manage servers or updates — they send changes to UMS and we ship.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Card index={0}>
              <h3 className="font-semibold">Reliable hosting</h3>
              <p className="mt-2 text-sm text-black/70">
                Managed by UMS; domain points to the UMS-hosted site.
              </p>
            </Card>
            <Card index={1}>
              <h3 className="font-semibold">Easy content changes</h3>
              <p className="mt-2 text-sm text-black/70">
                Add new products (e.g. new brick ranges or stone) without redesign.
              </p>
            </Card>
            <Card index={2}>
              <h3 className="font-semibold">Consistent credit</h3>
              <p className="mt-2 text-sm text-black/70">
                Site shows “Designed &amp; Developed by Ultimate Marketing Smash”.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container max-w-5xl">
          <h2 className="text-2xl font-semibold">Outcome</h2>
          <p className="mt-3 text-black/70">
            Civils Agri Plant now has a modern, mobile-friendly site that actually reflects how the business
            sells: materials + services + contact. It’s structured for future growth — more products,
            more service pages, and more media in the gallery — without rebuilding the whole thing.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card index={0}>
              <h3 className="font-semibold">Business clarity</h3>
              <p className="mt-2 text-sm text-black/70">
                Visitors immediately see the core offerings — Plant Hire, Sand &amp; Stone, Bricks.
              </p>
            </Card>
            <Card index={1}>
              <h3 className="font-semibold">Marketing-ready</h3>
              <p className="mt-2 text-sm text-black/70">
                Because the structure is clean, UMS can now run traffic to specific services when needed.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
