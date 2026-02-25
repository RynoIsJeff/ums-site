# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js 16 project with two parts: a **public marketing site** and an authenticated **UMS Hub** (`/hub`) backed by Supabase + Prisma/PostgreSQL. See `README.md` for full setup docs and scripts table.

### Quick reference

| Action | Command |
|---|---|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` (ESLint 9) |
| Build | `npm run build` |
| Generate Prisma client | `npm run prisma:generate` |
| Apply DB migrations | `npm run prisma:migrate:deploy` |
| Seed DB | `npm run prisma:seed` |

### Node version

Requires Node >= 20 (pinned in `.nvmrc`). The VM update script handles `nvm use 20` automatically before `npm install`.

### Environment variables

Copy `.env.example` to both `.env` and `.env.local`. The marketing site works without any real values. The Hub (`/hub/*`, `/login`) requires valid Supabase and `DATABASE_URL` credentials — see `README.md` § "Supabase setup".

### Two-part architecture

- **Marketing site** (`/`, `/about`, `/work`, `/contact`, etc.): fully static, no DB needed, works out of the box.
- **UMS Hub** (`/hub/*`): server-rendered, requires Supabase auth + Postgres via Prisma. Without credentials the dev server still starts and the marketing site works, but Hub pages will error at runtime when they try to query the DB.

### Caveats

- No automated test suite — validation is lint + build + manual testing.
- ESLint produces ~28 warnings (pre-existing `no-img-element` and unused-vars); zero errors.
- After `npm install`, always run `npx prisma generate` so the Prisma client is up to date.
- Use `prisma migrate deploy` (not `migrate dev`) with Supabase pooler — `migrate dev` needs a direct connection for the shadow DB.
