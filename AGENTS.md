# AGENTS.md

## Cursor Cloud specific instructions

This is a single-service Next.js 16 marketing site (`ums-site`). No database, no Docker, no external services required.

### Quick reference

| Action | Command |
|---|---|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` (ESLint 9, warnings only — no errors) |
| Build | `npm run build` |
| Prod server | `npm run start` |

### Node version

The project requires Node >= 20 (pinned in `.nvmrc`). The VM update script handles `nvm use 20` automatically before `npm install`.

### Environment variables

Copy `.env.example` to `.env.local`. The only variable is `FORMSPREE_FORM_ID` for the contact form — the app starts and works fine without it (the API route returns `{"ok":true}` gracefully).

### Caveats

- There are no automated tests in this project. Validation is done via lint + build + manual testing.
- ESLint currently produces ~15 warnings (all `@next/next/no-img-element`); these are pre-existing and not errors.
- The contact form (`/contact`) submits to `/api/contact` which proxies to Formspree. Without a valid `FORMSPREE_FORM_ID`, the form still submits successfully from the client side (redirects to `/thank-you`) but the server-side proxy to Formspree will fail silently.
