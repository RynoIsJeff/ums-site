/**
 * Prisma CLI configuration.
 *
 * Connection strategy
 * ───────────────────
 * Two environment variables drive Prisma's connection behaviour:
 *
 *   DATABASE_URL  — Supabase Transaction pooler (port 6543, pgbouncer=true, connection_limit=1)
 *                   Used by Prisma Client at runtime (Next.js app, Vercel serverless).
 *
 *   DIRECT_URL    — Supabase direct connection (port 5432, no pooler)
 *                   Used exclusively by the Prisma CLI for migrate / introspect / db push.
 *                   Defined as `directUrl` in prisma/schema.prisma so Prisma CLI reads it
 *                   automatically. Not required on Vercel — local dev only.
 *
 * How it works
 * ────────────
 * `import "dotenv/config"` below loads both variables from .env before any Prisma CLI
 * command runs.  schema.prisma then routes them:
 *
 *   datasource db {
 *     url       = env("DATABASE_URL")   // → Prisma Client (runtime)
 *     directUrl = env("DIRECT_URL")     // → Prisma CLI   (migrations)
 *   }
 *
 * No adapter override is needed; defineConfig handles schema path and migration settings only.
 */
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
