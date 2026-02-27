# Security

Security hardening, environment setup, backup/restore, and least-privilege guidance for UMS site + Hub.

---

## Environment checklist

Use this as a deployment checklist. Never commit `.env` or `.env.local`.

| Variable | Required | Visibility | Notes |
|----------|----------|------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (Hub) | Public | Supabase project URL. Safe to expose. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (Hub) | Public | Supabase anon key. Intended for client; rate-limited by Supabase. |
| `DATABASE_URL` | Yes (Hub) | Secret | Postgres connection string. Use **Session pooler** for Vercel. Never expose. |
| `HUB_BOOTSTRAP_EMAIL` | Yes (Hub) | Secret | Email for bootstrap admin. Must match Supabase Auth user. |
| `HUB_BOOTSTRAP_ROLE` | Yes (Hub) | Secret | `ADMIN` or `STAFF`. |
| `FORMSPREE_FORM_ID` | Yes (contact) | Public | Formspree form ID. Safe to expose. |
| `CRON_SECRET` | Optional | Secret | For `/api/cron/social-publish`. Use a long random value (e.g. `openssl rand -hex 32`). |
| `RESEND_API_KEY` | Optional | Secret | Resend.com API key. Enables invoice emails when marking as Sent. |
| `EMAIL_FROM` | Optional | — | From address for invoice emails. Defaults to company support email. Must be verified in Resend. |
| `SEED_SAMPLE_DATA` | Optional | — | `true` to seed demo data. Use `false` in production. |
| `NODE_ENV` | Auto | — | Set by Next.js/Vercel. |

**Production checklist**

- [ ] `DATABASE_URL` uses Session pooler, not direct connection
- [ ] `CRON_SECRET` set if using social publish cron
- [ ] `SEED_SAMPLE_DATA=false` in production
- [ ] Supabase project has Row Level Security (RLS) enabled where applicable
- [ ] Supabase Auth email confirmations enabled for new users (optional)

---

## Backup and restore

### Supabase managed backups

Supabase Pro plans include daily backups. Free tier: use point-in-time recovery if enabled, or manual dumps.

### Manual backup (pg_dump)

Requires PostgreSQL client tools (`pg_dump`) in PATH. Load `DATABASE_URL` from `.env` (e.g. `source .env` or use `dotenv`).

```bash
# Load DATABASE_URL (adjust for your shell)
# Bash: export $(grep -v '^#' .env | xargs)
# Or: set -a && source .env && set +a

# Full dump (schema + data)
pg_dump "$DATABASE_URL" --no-owner --no-acl -F c -f backup-$(date +%Y%m%d).dump

# Schema only
pg_dump "$DATABASE_URL" --no-owner --no-acl -s -f schema-$(date +%Y%m%d).sql
```

Use the **Session pooler** URL for `pg_dump`. If connection fails (e.g. pooler limits), use the **Direct** connection from Supabase Dashboard → Database → Connection string (Transaction mode, port 5432).

### Restore

```bash
# Restore from custom format dump
pg_restore --no-owner --no-acl -d "$DATABASE_URL" backup-YYYYMMDD.dump
```

**Important:** Test restores periodically. Store backups off-site and encrypted.

---

## Least privilege

### Database

- Use the **pooler** connection string for the app; avoid exposing direct DB credentials.
- Create a dedicated DB user for the app with only needed privileges (Supabase default `postgres` has full access; consider a restricted role for production).
- Prisma migrations run with full schema privileges; keep migration credentials separate from app runtime if possible.

### Supabase

- **Anon key** is for client-side auth. It is restricted by Supabase RLS and policies.
- Prefer server-side Supabase client (e.g. service role) only when necessary and never expose service role key to the client.
- Restrict Supabase API usage: Dashboard → Project Settings → API → restrict origins if needed.

### Hub access

- Hub routes require authenticated Supabase session.
- RBAC: `ADMIN` sees all; `STAFF` sees only assigned clients.
- Server actions use `requireHubAuth()` and `canAccessClient()` for authorization.

### CRON endpoint

- `/api/cron/social-publish` requires `Authorization: Bearer <CRON_SECRET>` when `CRON_SECRET` is set.
- Use a long, random secret. Rotate if compromised.

---

## Security headers

The app sets these HTTP headers on all responses:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `SAMEORIGIN` | Reduces clickjacking risk |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | Disables unnecessary browser features |

Configured in `next.config.ts`. Add Content-Security-Policy (CSP) only if you can tune it for your scripts and CDNs.

---

## Input validation and audit

- **Server actions:** Zod schemas validate all user input before DB access.
- **RBAC:** Client scoping enforced in queries; STAFF cannot access unassigned clients.
- **Audit:** `AuditLog` model exists for future login/CRUD audit trails.

---

## Reporting issues

Report security issues privately to the project maintainer. Do not open public issues for vulnerabilities.
