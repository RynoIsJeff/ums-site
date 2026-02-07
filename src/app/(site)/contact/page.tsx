import Section from "@/components/Section";
import CtaBand from "@/components/CtaBand";
import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact — UMS",
  description: "Start a project. No public pricing — every roadmap is tailored to your context.",
  openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=Start%20a%20project&subtitle=Your%20success%20is%20our%20Priority",
    ],
  },
};

export default function ContactPage() {
  return (
    <main className="bg-white">
      <Section>
        <div className="container max-w-5xl">
          <span className="kicker">Let’s talk</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">Start a project</h1>
          <p className="mt-4 text-black/70 max-w-2xl">
            Tell us about your idea, upgrade, or rescue. We’ll reply with next steps — no boilerplate quotes.
          </p>

          <ContactClient />
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
