export default function NotFound() {
  return (
    <main className="bg-white">
      <section className="container py-20 md:py-28 text-center">
        <h1 className="text-4xl md:text-5xl font-bold">Page not found</h1>
        <p className="mt-3 text-black/70">The page you’re looking for doesn’t exist or was moved.</p>
        <a href="/" className="btn-primary mt-6 inline-block">Back to home</a>
      </section>
    </main>
  );
}
