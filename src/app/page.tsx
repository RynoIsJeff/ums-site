import { Code2, Megaphone, ArrowRight, Cpu, LineChart, ShieldCheck, Wrench, Palette, Workflow, Users, MessageSquare } from "lucide-react";

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="badge">{children}</span>
);

const Card = ({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) => (
  <div className="card p-6">
    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="mt-2 text-sm text-ink/70">{desc}</p>
  </div>
);

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-white py-20 md:py-28">
        <div className="container grid items-center gap-12 md:grid-cols-2">
          <div>
            <Pill>Your success is our priority</Pill>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
              We design & build modern products — then help you grow them.
            </h1>
            <p className="mt-5 max-w-xl text-ink/70">
              UMS is an engineering-first studio for Web, App & Software development.
              Once your product is solid, our dedicated Digital Marketing arm scales it.
              We don’t publish pricing — every roadmap is tailored to your context.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#dev" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                <Code2 className="h-4 w-4" /> Explore Development
              </a>
              <a href="#marketing" className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-black/[0.02]">
                <Megaphone className="h-4 w-4" /> Explore Marketing
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-ink/60">
              {["Next.js","React","TypeScript","Tailwind","Prisma","Postgres","Supabase","Highcharts","Google Cloud","Stripe"].map(t=>(
                <span key={t} className="badge">{t}</span>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-black/[0.06] bg-gradient-to-br from-accent/10 to-primary/5 grid place-items-center">
              <div className="text-center">
                <Cpu className="mx-auto h-10 w-10 text-primary" />
                <p className="mt-3 text-sm text-ink/70">Drop in case-study reel or product shots here.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Development */}
      <section id="dev" className="bg-white py-20 md:py-28">
        <div className="container">
          <div className="text-center">
            <p className="mb-3 text-xs font-semibold tracking-widest text-ink/60 uppercase">Engineering First</p>
            <h2 className="text-3xl md:text-5xl font-bold">Web, App & Software Development</h2>
            <p className="mt-4 text-ink/70">Greenfield builds, upgrades, and rescues with maintainable, scalable foundations.</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card icon={Code2} title="Web & Platforms" desc="Next.js apps, portals, dashboards, e-commerce, and headless CMS with robust auth/data." />
            <Card icon={Wrench} title="Upgrades & Rescues" desc="Refactors, performance, accessibility, dependency audits, and CI/CD automation." />
            <Card icon={ShieldCheck} title="Security & QA" desc="Threat-aware architecture, API hardening, tests, telemetry, and on-call support." />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Card icon={Workflow} title="Process" desc="Lean rituals, tight feedback loops, milestone-based delivery and clear docs." />
            <Card icon={Palette} title="Design Systems" desc="Design-dev handoff, Tailwind tokens, shadcn/ui, and scalable UI components." />
            <Card icon={LineChart} title="Instrumentation" desc="Analytics, feature flags, and A/B testing to guide what to build next." />
          </div>
        </div>
      </section>

      {/* Marketing */}
      <section id="marketing" className="bg-white py-20 md:py-28">
        <div className="container">
          <div className="text-center">
            <p className="mb-3 text-xs font-semibold tracking-widest text-ink/60 uppercase">Go-to-Market</p>
            <h2 className="text-3xl md:text-5xl font-bold">Digital Marketing</h2>
            <p className="mt-4 text-ink/70">Once your product is right, we scale it across the channels that matter.</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card icon={Megaphone} title="Paid & Social" desc="Meta, TikTok, Google, YouTube and KOL with creative that converts." />
            <Card icon={LineChart} title="SEO & Content" desc="Technical SEO, content systems, and search-led landing experiences." />
            <Card icon={Users} title="CRM & Funnels" desc="Email/SMS automation, onboarding flows, and LTV-centric lifecycle." />
          </div>

          <p className="mt-10 text-center text-sm text-ink/60">
            We don’t publish pricing. Every engagement is scoped to your context. <a href="#contact" className="text-primary underline-offset-4 hover:underline">Start a conversation →</a>
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-white py-20 md:py-28">
        <div className="container grid gap-6 md:grid-cols-5">
          <div className="card md:col-span-3 p-6">
            <form className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm text-ink/80">Name</label>
                <input className="rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Your name" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-ink/80">Email</label>
                <input type="email" className="rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="you@company.com" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-ink/80">What do you need?</label>
                <select className="rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent">
                  <option>New build</option>
                  <option>Upgrade / Refactor</option>
                  <option>Rescue</option>
                  <option>Marketing / Growth</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-ink/80">Message</label>
                <textarea rows={5} className="rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="A few lines about scope, timing, and goals" />
              </div>
              <button className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-semibold text-white">
                <MessageSquare className="h-4 w-4" /> Send message
              </button>
              <p className="text-xs text-ink/60">No public pricing. We’ll tailor the engagement to your context.</p>
            </form>
          </div>

          <div className="md:col-span-2 grid gap-4">
            <div className="card p-5">
              <h4 className="font-semibold">Contact</h4>
              <div className="mt-3 space-y-2 text-sm text-ink/70">
                <p>Manager@ultimatemarketingsmash.com</p>
                <p>+27 79 490 5070</p>
                <p>447 Suikerbekkie Avenue, 3170, Pongola, KZN, South Africa</p>
              </div>
            </div>
            <div className="card p-5">
              <h4 className="font-semibold">What to expect</h4>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/70">
                <li>Fast response and clear next steps</li>
                <li>Milestone-based proposals (no boilerplate quotes)</li>
                <li>Engineering-first deliverables with growth baked in</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
