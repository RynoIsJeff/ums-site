export const metadata = {
  title: "Thanks — UMS",
  description: "We’ve received your message. We’ll be in touch shortly.",
};

export default function ThankYou() {
  return (
    <main className="bg-white">
      <section className="container py-20 md:py-28 text-center">
        <h1 className="text-4xl md:text-5xl font-bold">Thanks — we got it!</h1>
        <p className="mt-4 text-ink/70 max-w-xl mx-auto">
          We’ll review your message and get back to you with clear next steps.
        </p>
        <a href="/" className="mt-8 inline-block rounded-xl bg-[color:var(--primary)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
          Back to home
        </a>
      </section>
    </main>
  );
}
