"use client";

import { motion } from "framer-motion";

export default function Section({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white ums-bg-glow py-16 md:py-24 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </section>
  );
}
