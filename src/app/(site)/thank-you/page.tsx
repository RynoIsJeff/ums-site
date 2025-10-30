export const metadata = {
  title: "Thanks — UMS",
  description: "We’ve received your message. We’ll be in touch shortly.",
  openGraph: {
    images: [
      "https://ultimatemarketingsmash.com/og?title=Thanks%20for%20reaching%20out&subtitle=We%27ll%20reply%20shortly",
    ],
  },
};

export default function ThankYou() {
  return (
    <main className="bg-white">
      <section className="container py-20 md:py-28 text-center">
        <h1 className="text-4xl md:text-5xl font-bold">Thanks — we got it!</h1>
        <p className="mt-4 text-black/70 max-w-xl mx-auto">
          We’ll review your message and get back to you with next steps.
        </p>
        <a href="/" className="btn-primary mt-8 inline-block">
          Back to home
        </a>
      </section>
    </main>
  );
}
