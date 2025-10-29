import Section from "@/components/Section";
import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact — UMS",
  description: "Start a project. No public pricing — every roadmap is tailored to your context.",
};

export default function ContactPage() {
  return (
    <main className="bg-white">
      <Section>
        <div className="container">
          <span className="kicker">Let’s talk</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">Start a project</h1>
          <p className="mt-4 text-black/70 max-w-2xl">
            Tell us about your idea, upgrade, or rescue. We’ll reply with next steps — no boilerplate quotes.
            We don’t publish pricing; every roadmap is tailored to your context.
          </p>

          {/* Client-side form */}
          <ContactClient />
        </div>
      </Section>
    </main>
  );
}
