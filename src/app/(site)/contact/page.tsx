import Section from "@/components/Section";

export const metadata = {
  title: "Contact — UMS",
  description: "Start a project. No public pricing — every roadmap is tailored to your context.",
};

export default function ContactPage() {
  return (
    <main className="bg-white">
      <Section>
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold">Start a project</h1>
          <p className="mt-4 text-ink/70 max-w-2xl">
            Tell us about your idea, upgrade, or rescue. We’ll reply with next steps — no boilerplate quotes.
            We don’t publish pricing; every roadmap is tailored to your context.
          </p>

          <form className="mt-8 grid gap-4 max-w-xl">
            <input className="rounded-xl border border-black/10 px-3 py-2 text-sm" placeholder="Name" />
            <input type="email" className="rounded-xl border border-black/10 px-3 py-2 text-sm" placeholder="Email" />
            <select className="rounded-xl border border-black/10 px-3 py-2 text-sm">
              <option>New build</option><option>Upgrade / Refactor</option><option>Rescue</option><option>Marketing / Growth</option>
            </select>
            <textarea rows={6} className="rounded-xl border border-black/10 px-3 py-2 text-sm" placeholder="Scope, timing, goals" />
            <button className="rounded-xl bg-[color:var(--primary)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
              Send message
            </button>
            <p className="text-xs text-ink/60">No public pricing. We’ll tailor the engagement to your context.</p>
          </form>
        </div>
      </Section>
    </main>
  );
}
