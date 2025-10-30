import Section from "@/components/Section";
import CtaBand from "@/components/CtaBand";

export const metadata = {
  title: "About — UMS",
  description:
    "Ultimate Marketing Smash (UMS) is a South African, founder-led full-stack studio working with local and international brands on web, software and digital marketing.",
  openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=About%20UMS&subtitle=Your%20success%20is%20our%20Priority",
    ],
  },
};

export default function AboutPage() {
  return (
    <main className="bg-white">
      {/* INTRO */}
      <Section>
        <div className="container max-w-4xl">
          <span className="kicker">About</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">
            Ultimate Marketing <span style={{ color: "var(--primary)" }}>Smash</span>
          </h1>
          <p className="mt-4 text-black/70">
            UMS is a South African, founder-led digital &amp; product studio. We build modern websites
            and apps, we run performance marketing, and we support growing businesses that need both —
            locally and internationally.
          </p>
          <p className="mt-3 text-black/70">
            Sometimes we start with the build. Sometimes we start with traffic. The point is:{" "}
            <strong>we start where you are</strong> and move you forward.
          </p>
        </div>
      </Section>

      {/* WHO WE ARE */}
      <Section>
        <div className="container max-w-5xl grid gap-10 md:grid-cols-[1.4fr,0.9fr] items-start">
          <div>
            <h2 className="text-2xl font-semibold">Who we are</h2>
            <p className="mt-3 text-black/70">
              UMS was started by <strong>Ryno van der Walt</strong> in 2021, working hands-on with real
              South African businesses — hardware, construction, fuel, agri, tourism. Over time, we added
              e-commerce and international work to the mix, so today we operate as a full-stack partner:
              <strong> product + marketing</strong>.
            </p>
            <p className="mt-3 text-black/70">
              We’re comfortable inside a store that needs Facebook content every week — and we’re just as
              comfortable auditing an e-commerce funnel or shipping a Next.js app.
            </p>
            <p className="mt-3 text-black/70">
              And because a lot of businesses already have a website, we don’t force a rebuild. If your
              current assets are good enough, we’ll run ads, social and SEO on top of them — and schedule
              upgrades later.
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/60 p-6 shadow-[0_10px_40px_rgba(3,3,3,0.04)]">
            <h3 className="text-sm font-semibold tracking-wide text-black/70 uppercase">
              Quick profile
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-black/75">
              <li>
                <strong>Founded:</strong> 2021
              </li>
              <li>
                <strong>Base:</strong> Pongola, South Africa (serving KZN, SA &amp; remote/global)
              </li>
              <li>
                <strong>Founder &amp; CEO:</strong> Ryno van der Walt
              </li>
              <li>
                <strong>What we do:</strong> Web/App/Software + Digital Marketing
              </li>
              <li>
                <strong>Slogan:</strong> YOUR SUCCESS IS OUR PRIORITY
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* HOW WE WORK */}
      <Section>
        <div className="container max-w-5xl">
          <h2 className="text-2xl font-semibold">How we work</h2>
          <p className="mt-3 text-black/70">
            We like to keep it practical. There are three typical entry points:
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="card-accent p-6">
              <span className="text-xs font-semibold text-black/40 tracking-wide">01</span>
              <h3 className="mt-2 text-lg font-semibold">Build / Upgrade</h3>
              <p className="mt-2 text-sm text-black/70">
                New website, web app, platform or a rescue of an existing one. Next.js, React, Tailwind, Supabase,
                Vercel. This is where we make your brand look modern.
              </p>
            </div>
            <div className="card-accent p-6">
              <span className="text-xs font-semibold text-black/40 tracking-wide">02</span>
              <h3 className="mt-2 text-lg font-semibold">Market / Grow</h3>
              <p className="mt-2 text-sm text-black/70">
                Social media, content, Meta &amp; Google Ads, e-commerce ads, landing pages. If your current site is
                good enough, we’ll start here immediately.
              </p>
            </div>
            <div className="card-accent p-6">
              <span className="text-xs font-semibold text-black/40 tracking-wide">03</span>
              <h3 className="mt-2 text-lg font-semibold">Maintain</h3>
              <p className="mt-2 text-sm text-black/70">
                Hosting, updates, content edits, rolling campaigns, monthly reporting. This is where most of our long
                client relationships sit.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* SECTORS & STACK */}
      <Section>
        <div className="container max-w-5xl grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">Sectors we’ve worked in</h2>
            <p className="mt-3 text-black/70">
              Our portfolio spans local, regional and international brands:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-black/75">
              <li>• Hardware &amp; building supply (SupaTrade Build It Group)</li>
              <li>• Construction / Civils / Plant hire (Civils Agri Plant)</li>
              <li>• Fuel, convenience &amp; QSR (Engen Mbazwana, Steers, Debonairs)</li>
              <li>• Agri / Game farms / Tourism (Tugam Game Farm)</li>
              <li>• E-commerce brands running digital ads</li>
              <li>• International clients needing a remote dev/marketing team</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">Tech &amp; tooling we prefer</h2>
            <p className="mt-3 text-black/70">
              We stay close to modern JS so everything is easy to maintain.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-black/70">
              <span className="badge">Next.js</span>
              <span className="badge">React</span>
              <span className="badge">TypeScript</span>
              <span className="badge">Tailwind</span>
              <span className="badge">Supabase</span>
              <span className="badge">Prisma</span>
              <span className="badge">Vercel</span>
              <span className="badge">Resend</span>
              <span className="badge">Highcharts</span>
              <span className="badge">Meta &amp; Google Ads</span>
            </div>
          </div>
        </div>
      </Section>

      {/* NO PUBLIC PRICING */}
      <Section>
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-semibold">No public pricing — on purpose</h2>
          <p className="mt-3 text-black/70">
            A hardware store with 5 branches is not the same as a one-location café. An international
            e-commerce brand with 5 ad accounts is not the same as a local service business.
          </p>
          <p className="mt-3 text-black/70">
            That’s why we scope per client and usually break it into milestones — strategy, build, launch,
            optimisation. You only pay for what you actually need.
          </p>
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
