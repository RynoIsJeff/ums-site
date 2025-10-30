"use client";

import { motion } from "framer-motion";

type CardProps = {
  children: React.ReactNode;
  index?: number; // 👈 this is the key
};

export default function Card({ children, index = 0 }: CardProps) {
  return (
    <motion.div
      className="card-accent p-6"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: index * 0.06 }}
    >
      {children}
    </motion.div>
  );
}
