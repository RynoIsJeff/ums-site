"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <main className="bg-white">
          <section className="container py-20 md:py-28 text-center">
            <h1 className="text-4xl md:text-5xl font-bold">Something went wrong</h1>
            <p className="mt-3 text-black/70">{error?.message || "An unexpected error occurred."}</p>
            <button onClick={reset} className="btn-primary mt-6">Try again</button>
          </section>
        </main>
      </body>
    </html>
  );
}
