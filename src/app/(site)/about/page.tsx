import Section from "@/components/Section";
import CtaBand from "@/components/CtaBand";

export const metadata = {
  title: "About — UMS",
  description: "UMS is a full-stack studio. Build right, then scale.",
  openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=About%20UMS&subtitle=Build%20%E2%80%A2%20Ship%20%E2%80%A2%20Grow",
    ],
  },
};

export default function AboutPage() {
  return (
    <main className="bg-white">
      <Section>
        <div className="container max-w-3xl">
          <span className="kicker">About</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">
            Ultimate Marketing <span style={{ color: "var(--primary)" }}>Smash</span>
          </h1>
          <p className="mt-4 text-black/70">
            We’re an engineering-first studio focused on performant web, app &amp; software development with a dedicated
            growth arm for SEO, analytics, and multi-channel digital marketing.
          </p>
          <ul className="mt-6 list-disc pl-5 text-black/70 space-y-2">
            <li>Milestone-based proposals, clear ownership, and fast feedback loops.</li>
            <li>Design systems, accessible components, and measured outcomes.</li>
            <li>No public pricing — every roadmap is tailored to your context.</li>
          </ul>
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
