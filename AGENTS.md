# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Captain Prospect CRM is a single Next.js (App Router) application for B2B sales prospecting. It uses PostgreSQL via Prisma ORM, NextAuth v4 for authentication, and Tailwind CSS v4 for styling. See `docs/MANUAL_SETUP.md` for full env var documentation and `docs/CRM-OVERVIEW.md` for product details.

### Required services

| Service | How to start |
|---------|-------------|
| PostgreSQL | `sudo pg_ctlcluster 16 main start` |
| Next.js dev server | `npm run dev` (runs on port 3000) |

Redis and Socket.IO are optional; the app degrades gracefully without them.

### Database setup caveats

- The migration history is incremental on top of a base schema that was initially created with `prisma db push`. Use `npx prisma db push` (not `prisma migrate deploy`) to set up a fresh local database.
- Seed data: `npx tsx prisma/seed.ts` creates test users, permissions, a client, a mission, and sample data.
- **Environment variable override**: the repository may have injected `DATABASE_URL`/`DIRECT_URL` secrets pointing to a remote Supabase instance. To use a local database, prefix Prisma commands with explicit env vars: `DATABASE_URL=postgresql://ubuntu:devpass123@localhost:5432/captain_prospect DIRECT_URL=postgresql://ubuntu:devpass123@localhost:5432/captain_prospect npx prisma db push`. Same prefix for `npm run dev`.
- The `.env` file in the repo root sets local database credentials. If shell-level env vars override them, use the prefix approach above.

### Test credentials (from seed)

| Role | Email | Password |
|------|-------|----------|
| Manager | manager@suzali.com | test123 |
| SDR | sdr@suzali.com | test123 |
| Client | client@techcorp.com | test123 |

### Lint / Build / Dev

- **Lint**: `npm run lint` (ESLint 9 with Next.js config). Pre-existing warnings/errors exist.
- **Build**: `npm run build` (runs `prisma generate && next build`; `typescript.ignoreBuildErrors` is enabled).
- **Dev**: `npm run dev` — requires `DATABASE_URL` and `DIRECT_URL` env vars pointing to a running PostgreSQL.
- The app redirects unauthenticated users to `/login`. Open the app at the exact URL set in `NEXTAUTH_URL`.

### Notes

- The `postinstall` script creates a Chromium tar archive for Vercel PDF generation. It logs a warning and exits cleanly if the binary isn't present (normal for local dev).
- There are no automated test suites (no Jest/Vitest/Playwright configured). Validation is done via manual testing.
- Package manager: npm (lockfile is `package-lock.json`).
