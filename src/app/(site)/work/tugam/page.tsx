import Section from "@/components/Section";
import CtaBand from "@/components/CtaBand";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "Case Study — Tugam Cattle & Game Farm",
  description:
    "How UMS launched TugamGameFarm.co.za fast on GoDaddy, then built a full custom static site (Gulp/SCSS/Bootstrap) on Vercel — accommodation, cattle, hunting, venue hire and contact.",
  openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=Tugam%20Cattle%20%26%20Game%20Farm&subtitle=Launch%20fast%20%E2%86%92%20Build%20right",
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
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">Tugam Cattle & Game Farm</h1>
          <p className="mt-4 text-black/70 max-w-3xl">
            Tugam needed a professional website to showcase their game farm in Pongola, KwaZulu-Natal — accommodation,
            venue hire, Ankole cattle and hunting experiences. UMS first shipped a fast GoDaddy builder site to get them
            live, then built a full custom static site (Gulp/HTML/SCSS, Bootstrap) deployed on Vercel.
          </p>

          <div className="mt-8">
            <img
              src="/work/tugam-hero.png"
              alt="Tugam Cattle & Game Farm website"
              className="w-full rounded-xl border border-black/10"
            />
          </div>
        </div>
      </Section>

      {/* PROJECT CONTEXT */}
      <Section>
        <div className="container max-w-5xl">
          <h2 className="text-2xl font-semibold">Project Context</h2>
          <p className="mt-3 text-black/70">
            The goal was speed-to-live first: Tugam needed a credible web presence fast — something they could
            point guests, hunters and partners to. Phase 1 used GoDaddy’s website builder for a quick go-live.
            Phase 2 was a full custom build: static HTML/SCSS, Gulp, Bootstrap 4, deployed on Vercel — with dedicated
            pages for accommodation (and lodge galleries), cattle, hunting, venue hire and contact (including a
            serverless contact form).
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card index={0}>
              <h3 className="font-semibold text-lg">Client</h3>
              <p className="mt-2 text-sm text-black/70">
                Tugam Cattle & Game Farm — accommodation, venue hire, Ankole cattle &amp; hunting, Pongola
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
                Custom static site (Gulp, SCSS, Bootstrap) on Vercel — built &amp; maintained by UMS
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* PHASE 1: FAST LAUNCH */}
      <Section>
        <div className="container max-w-5xl">
          <h2 className="text-2xl font-semibold">Phase 1 — Fast Launch</h2>
          <p className="mt-3 text-black/70">
            We prioritised time-to-value: a neat hero, farm description, accommodation info, contact details,
            and a way for visitors to reach out. Using GoDaddy meant Tugam was live quickly and could start
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

      {/* PHASE 2: CUSTOM STATIC SITE */}
      <Section>
        <div className="container max-w-5xl">
          <h2 className="text-2xl font-semibold">Phase 2 — Custom Static Site (Live)</h2>
          <p className="mt-3 text-black/70">
            UMS built a full custom site for Tugam Cattle & Game Farm: static HTML with Gulp partials, SCSS, Bootstrap 4,
            jQuery, Slick, Colorbox, Shuffle and Leaflet for maps. The site is built from source, deployed on Vercel
            (GitHub → auto-deploy), and includes a serverless contact form (Vercel serverless function) so enquiries
            go to the client.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Card index={0}>
              <h3 className="font-semibold">Tech stack</h3>
              <p className="mt-2 text-sm text-black/70">
                Gulp, HTML partials, SCSS → CSS, Bootstrap 4, jQuery, Slick, Colorbox, Shuffle, Leaflet. Deploy: Vercel.
              </p>
            </Card>
            <Card index={1}>
              <h3 className="font-semibold">Pages &amp; content</h3>
              <p className="mt-2 text-sm text-black/70">
                Home, About, Accommodation (with lodge galleries — Ankole Kraal, Giraffe, Impala, Kudu, Matumi, Nyala, Zebra),
                Cattle, Hunting, Venue, Contact, Privacy, Terms.
              </p>
            </Card>
            <Card index={2}>
              <h3 className="font-semibold">Contact form</h3>
              <p className="mt-2 text-sm text-black/70">
                Contact form submits to /api/contact (Vercel serverless). Env vars for SMTP and TO_EMAIL; enquiries to client.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* OUTCOME */}
      <Section>
        <div className="container max-w-5xl">
          <h2 className="text-2xl font-semibold">Outcome</h2>
          <p className="mt-3 text-black/70">
            Tugam got online quickly with Phase 1, then received a full custom site that reflects their real offering:
            accommodation, cattle, hunting, venue hire and clear contact. The “launch fast → build right” pattern gave
            them immediate visibility and a serious, maintainable product — live on TugamGameFarm.co.za and maintained by UMS.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card index={0}>
              <h3 className="font-semibold">Immediate visibility</h3>
              <p className="mt-2 text-sm text-black/70">
                TugamGameFarm.co.za gave them a URL to send to visitors, hunters and partners from day one.
              </p>
            </Card>
            <Card index={1}>
              <h3 className="font-semibold">Full custom site</h3>
              <p className="mt-2 text-sm text-black/70">
                Phase 2 delivers dedicated pages, lodge galleries, map, contact form and Vercel hosting — all maintained by UMS.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
