// src/app/(site)/marketing/page.tsx
import { Megaphone, LineChart, Users } from "lucide-react";

export default function MarketingPage() {
  return (
    <main className="bg-white">
      <section className="container py-16 md:py-24 text-center">
        <p className="text-xs font-semibold tracking-widest text-ink/60 uppercase">Go-to-Market</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold">Digital Marketing</h1>
        <p className="mt-4 text-ink/70 max-w-2xl mx-auto">
          Once your product is solid, we scale it across the channels that matter. No public pricing — every engagement is scoped to your context.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3 text-left">
          <div className="card p-6"><Megaphone className="h-5 w-5 text-[color:var(--primary)] mb-3"/><h3 className="font-semibold">Paid & Social</h3><p className="mt-1 text-sm text-ink/70">Meta, TikTok, Google, YouTube, KOL with creative that converts.</p></div>
          <div className="card p-6"><LineChart className="h-5 w-5 text-[color:var(--primary)] mb-3"/><h3 className="font-semibold">SEO & Content</h3><p className="mt-1 text-sm text-ink/70">Technical SEO, content systems, search-led landing experiences.</p></div>
          <div className="card p-6"><Users className="h-5 w-5 text-[color:var(--primary)] mb-3"/><h3 className="font-semibold">CRM & Funnels</h3><p className="mt-1 text-sm text-ink/70">Email/SMS automation, onboarding flows, LTV-centric lifecycle.</p></div>
        </div>
      </section>
    </main>
  );
}
