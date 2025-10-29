// src/app/(site)/contact/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Section from "@/components/Section";

export default function ContactPage() {
  const [state, setState] = useState<"idle"|"sending"|"ok"|"err">("idle");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending"); setErr("");
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      intent: (form.elements.namedItem("intent") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      // honeypot:
      company: (form.elements.namedItem("company") as HTMLInputElement)?.value || "",
    };
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.ok) {
      setState("ok");
      router.push("/thank-you");
      return;
    }
    setErr(json.error || "Something went wrong");
    setState("err");
  }

  return (
    <main className="bg-white">
      <Section>
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold">Start a project</h1>
          <p className="mt-4 text-ink/70 max-w-2xl">
            Tell us about your idea, upgrade, or rescue. We’ll reply with next steps — no boilerplate quotes.
            We don’t publish pricing; every roadmap is tailored to your context.
          </p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-4 max-w-xl">
            <input name="name" className="rounded-xl border border-black/10 px-3 py-2 text-sm" placeholder="Name" required />
            <input name="email" type="email" className="rounded-xl border border-black/10 px-3 py-2 text-sm" placeholder="Email" required />
            <input name="company" className="hidden" tabIndex={-1} autoComplete="off" />
            <select name="intent" className="rounded-xl border border-black/10 px-3 py-2 text-sm" defaultValue="New build">
              <option>New build</option><option>Upgrade / Refactor</option><option>Rescue</option><option>Marketing / Growth</option>
            </select>
            <textarea name="message" rows={6} className="rounded-xl border border-black/10 px-3 py-2 text-sm" placeholder="Scope, timing, goals" required />
            <button disabled={state==="sending"} className="rounded-xl bg-[color:var(--primary)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
              {state==="sending" ? "Sending..." : "Send message"}
            </button>
            {state==="ok" && <p className="text-sm text-green-700">Thanks — we’ll be in touch shortly.</p>}
            {state==="err" && <p className="text-sm text-red-700">{err}</p>}
            <p className="text-xs text-ink/60">No public pricing. We’ll tailor the engagement to your context.</p>
          </form>
        </div>
      </Section>
    </main>
  );
}
