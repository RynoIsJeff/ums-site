import Section from "@/components/Section";

export const metadata = {
  title: "About — UMS",
  description: "UMS is a full-stack studio. Build right, then scale.",
};

export default function AboutPage() {
  return (
    <main className="bg-white">
      <Section>
        <div className="container max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold">About UMS</h1>
          <p className="mt-4 text-ink/70">
            We’re an engineering-first studio focused on performant web, app & software development with a dedicated
            growth arm for SEO, analytics, and multi-channel digital marketing. Based in South Africa, shipping globally.
          </p>
          <ul className="mt-6 list-disc pl-5 text-ink/70 space-y-2">
            <li>Milestone-based proposals, clear ownership, and fast feedback loops.</li>
            <li>Design systems, accessible components, and measured outcomes.</li>
            <li>No public pricing — every roadmap is tailored to your context.</li>
          </ul>
        </div>
      </Section>
    </main>
  );
}
