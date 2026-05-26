# Conddo — environments (production + test/staging)

Two **fully isolated** stacks. The golden rule: **separate databases.** Staging must
never read or write production data. Everything else (frontend deploy, backend
service, env vars, notification keys) is duplicated and pointed at its own pair.

```
                 PRODUCTION                          TEST / STAGING
Frontend   Vercel · Production (main)          Vercel · Preview (staging branch)
           app.conddo.io  (or *.vercel.app)    staging-conddo.vercel.app
                │  NEXT_PUBLIC_API_URL →             │  NEXT_PUBLIC_API_URL →
                ▼                                     ▼
Backend    Render: conddo-backend              Render: conddo-backend-staging
           (branch: main)                      (branch: staging)
                │                                     │
Database   Render Postgres  (prod data)        Render Postgres  (throwaway)  ◄── SEPARATE
```

The frontend code is identical across environments — it's **env-driven** (`NEXT_PUBLIC_API_URL`),
so the only difference is which backend each Vercel environment points at.

---

## 1. Backend — stand up the staging service (Render)
1. **New Postgres** → name `conddo-staging-db` (free tier is fine to start). Copy its
   Internal Database URL.
2. **New Web Service** from the `conddo-backend` repo, **branch `staging`** (create it:
   `git checkout -b staging && git push -u origin staging`). Same build/start as prod.
3. **Env vars** (Render → Environment) — point it at the staging DB + its own secrets:
   - `CONDDO_DB_URL` / `CONDDO_DB_*` → the **staging** Postgres (NOT prod's).
   - `CONDDO_CORS_ALLOWED_ORIGINS` → the staging frontend origin (step 2 below) + `http://localhost:3000`.
   - `CONDDO_JWT_*` → a **separate** RSA keypair (don't share prod's signing keys).
   - Notifications: either `CONDDO_EMAIL_PROVIDER=log` (no real emails in test — OTPs
     land in the logs) **or** Brevo with a test sender. SMS stays `log`.
   - `CONDDO_AUTH_COOKIE_SECURE=true`, `CONDDO_AUTH_COOKIE_SAMESITE=None` (cross-site).
4. Health check path `/actuator/health`. Deploy → confirm `UP`.

## 2. Frontend — point a Vercel deployment at staging
Vercel auto-creates a **Preview** deployment for every non-production branch, so the
`staging` branch gets a stable preview URL. In the Vercel project:
- **Settings → Environment Variables**, scope each value by environment:
  | Variable | Production | Preview (= staging) |
  |---|---|---|
  | `NEXT_PUBLIC_API_URL` | `https://conddo-backend.onrender.com` | `https://conddo-backend-staging.onrender.com` |
  | `NEXT_PUBLIC_APP_URL`  | prod domain | the staging preview URL |
- Push the `staging` branch → Vercel builds the preview → that URL is your test app.
- Put the staging preview URL into the staging backend's `CONDDO_CORS_ALLOWED_ORIGINS` (step 1.3).

## 3. Branch flow (fits "push to main")
- Work + push to **`staging`** → auto-deploys to the test stack. Test freely there.
- When green, **merge `staging` → `main`** (or open a PR) → promotes to production.
- Keep `staging` long-lived; branch features off it if you like.

## 4. Seeding test data
Sign up a throwaway tenant on the staging app (real onboarding) — its data lives only
in the staging DB. Reset anytime by wiping/recreating `conddo-staging-db`.

## Notes
- **Cost:** Render free Postgres expires after ~90 days and free web services cold-start
  after idle. Fine for testing; upgrade prod when you take real customers.
- **Local dev** remains a third tier: `npm run dev` against whichever backend you set in
  `.env.local` (default points at the live backend).
