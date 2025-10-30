export default function CtaBand() {
  return (
    <section className="bg-white ums-bg-glow py-10">
      <div className="container rounded-2xl border border-black/[0.06] bg-[linear-gradient(135deg,rgba(2,214,228,0.08),rgba(5,134,173,0.06))] p-6 md:p-10">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="kicker">Let’s build something excellent</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold">
              Ready to turn your idea into a product — or upgrade what you’ve got?
            </h2>
            <p className="mt-2 text-black/70 max-w-2xl">
              No public pricing. We scope to your context and goals, then ship in milestones.
            </p>
          </div>
          <div className="flex gap-3">
            <a href="/contact" className="btn-primary">Start a project</a>
            <a href="/work" className="btn-outline">View our work</a>
          </div>
        </div>
      </div>
    </section>
  );
}
