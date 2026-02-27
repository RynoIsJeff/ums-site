# Ultimate Marketing Smash — Marketing site + UMS Hub

This is a [Next.js](https://nextjs.org) project (App Router) with a public marketing site and an authenticated internal app (**UMS Hub**) at `/hub`.

**Node.js:** Node.js 20 or later (see `package.json` `engines`).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the marketing site. Use [http://localhost:3000/login](http://localhost:3000/login) for UMS Hub (after Supabase + DB setup).

## Supabase setup (UMS Hub)

UMS Hub uses **Supabase** for auth and Postgres.

1. **Create a Supabase project** at [supabase.com/dashboard](https://supabase.com/dashboard).

2. **Environment variables** — Copy `.env.example` to both `.env` and `.env.local`, then fill in:

   - **NEXT_PUBLIC_SUPABASE_URL** — Project URL (Project Settings → API).
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY** — anon/public key (Project Settings → API).
   - **DATABASE_URL** — Session pooler URI (IPv4-friendly for Vercel). Supabase: Settings → Database → Connection string → **Session** mode. Example: `...@xxx.pooler.supabase.com:5432/postgres`.
   Put these in `.env` (Prisma CLI reads `.env`). The seed script also reads `.env.local` if present.

3. **Create a user in Supabase Auth** (Authentication → Users → Add user) with the same email you will use for `HUB_BOOTSTRAP_EMAIL` (e.g. `admin@ultimatemarketingsmash.com`). Set a password.

4. **Apply migrations** (creates tables). Use **`migrate deploy`** only — it works with the pooler and does not need a direct connection. Do **not** use `migrate dev` (it requires a direct connection for the shadow DB).

   ```bash
   npm run prisma:generate
   npm run prisma:migrate:deploy
   ```

5. **Seed** (creates app User for that email + default service plans):

   ```bash
   npm run prisma:seed
   ```

6. **Log in** at `/login` with the Supabase user email and password. You should be redirected to `/hub`.

   **Adding new migrations later:** Create the migration SQL (e.g. with `npx prisma migrate diff --from-migrations-datamodel prisma/migrations --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/YYYYMMDD_name/migration.sql`), then run `npm run prisma:migrate:deploy` to apply.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate:deploy` | Apply migrations (use this with Supabase pooler; no direct connection needed) |
| `npm run prisma:seed` | Seed database |

## Social scheduling (Facebook)

At **Hub → Social** you can connect Facebook pages (Page ID + Page access token from [Meta for Developers](https://developers.facebook.com/) or Business Suite), create posts (draft or scheduled), and cancel them. A **worker** publishes scheduled posts at the chosen time.

- **Worker:** `GET` or `POST` `/api/cron/social-publish`. Call it every few minutes (e.g. Vercel Cron). If `CRON_SECRET` is set in the environment, send `Authorization: Bearer <CRON_SECRET>`.
- **Vercel:** Add `CRON_SECRET` in project env and use the `vercel.json` cron (runs every 5 minutes). Vercel sends the secret in the `Authorization` header when configured.

## Security and operations

See **[SECURITY.md](./SECURITY.md)** for:

- Environment variable checklist and security notes
- Backup and restore (pg_dump/pg_restore)
- Least privilege guidance (DB, Supabase, Hub RBAC)
- Security headers

## Client portal

When an invoice is marked **Sent**, a secure link is generated and included in the invoice email. Clients can view their invoice at `/portal/invoice/[token]` and optionally pay online via PayFast (when configured).

- **PayFast:** Set `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, and optionally `PAYFAST_PASSPHRASE` and `PAYFAST_MODE` (sandbox/live). See `.env.example`.

## Recurring invoices & payment reminders

- **Recurring invoices:** `GET /api/cron/recurring-invoices` creates draft invoices for clients with retainer + billing frequency (MONTHLY/QUARTERLY/ANNUAL). Cron: daily at 08:00.
- **Payment reminders:** `GET /api/cron/payment-reminders` sends reminder emails for SENT/OVERDUE invoices (due soon or overdue). Cron: daily at 09:00.

Both require `Authorization: Bearer <CRON_SECRET>` when `CRON_SECRET` is set.

## Deploy on Vercel

Set the same env vars in the Vercel project (Supabase URL, anon key, `DATABASE_URL` with the **Session pooler** URL). Add `CRON_SECRET` if you use crons. Add `RESEND_API_KEY` for invoice emails and reminders. Add `NEXT_PUBLIC_APP_URL` for correct portal links in emails. In your build command or a postinstall script, run `prisma generate` and `prisma migrate deploy` so the schema is applied using the pooler (no direct connection required).
