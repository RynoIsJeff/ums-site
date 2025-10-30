"use client";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { SOCIALS } from "@/lib/site";

export default function NavClient() {
  const path = usePathname();
  const linkClass = (href: string) =>
    `nav-link hover:text-black ${path === href ? "text-black font-semibold" : "text-black/80"}`;

  return (
    <>
      <nav className="hidden items-center gap-6 text-sm md:flex">
        <a href="/development" className={linkClass("/development")}>Web &amp; App Dev</a>
        <a href="/marketing" className={linkClass("/marketing")}>Digital Marketing</a>
        <a href="/work" className={linkClass("/work")}>Work</a>
        <a href="/about" className={linkClass("/about")}>About</a>
        <a href="/contact" className={linkClass("/contact")}>Contact</a>
      </nav>

      <div className="hidden items-center gap-3 md:flex">
        <a href={SOCIALS.facebook} aria-label="Facebook" className="p-1.5 rounded-md hover:bg-black/[0.06]">
          <Facebook className="h-5 w-5" style={{ color: "var(--primary)" }} />
        </a>
        <a href={SOCIALS.instagram} aria-label="Instagram" className="p-1.5 rounded-md hover:bg-black/[0.06]">
          <Instagram className="h-5 w-5" style={{ color: "var(--primary)" }} />
        </a>
        <a href={SOCIALS.linkedin} aria-label="LinkedIn" className="p-1.5 rounded-md hover:bg-black/[0.06]">
          <Linkedin className="h-5 w-5" style={{ color: "var(--primary)" }} />
        </a>

        <a href="/contact" className="btn-primary">Start a Project</a>
      </div>
    </>
  );
}
