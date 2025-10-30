export default function Loading() {
  return (
    <main className="bg-white">
      <section className="container py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full"
             style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }} />
        <p className="mt-4 text-black/60">Loading…</p>
      </section>
    </main>
  );
}
