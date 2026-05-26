# Conddo — environments

**Decision (V1):** the current deployment **is the staging/test environment.** We
build and test V1 here. When V1 is done, we stand up a separate, isolated
**production** stack and cut over. The golden rule for that cutover: **production
gets its own database** — never share staging's data.

```
            NOW — STAGING (V1 dev/test)              LATER — PRODUCTION (post-V1)
Frontend   Vercel (main)                            Vercel prod (production branch)
           <your>.vercel.app                        app.conddo.io
                │ NEXT_PUBLIC_API_URL →                   │ →
                ▼                                          ▼
Backend    conddo-backend.onrender.com               conddo-backend-prod (new service)
           (branch: main)                            (branch: production)
                │                                          │
Database   current Render Postgres  ← test data      NEW Render Postgres  ← real data (SEPARATE)
```

## Now (staging) — what makes it work
The stack already exists; just make sure the deployed frontend can talk to the
backend cross-origin:
- **Render → `CONDDO_CORS_ALLOWED_ORIGINS`** must include your Vercel URL, e.g.
  `http://localhost:3000,https://<your-vercel-domain>`. Without it the browser
  blocks login + the refresh cookie. (This is the one thing that commonly makes a
  deployed frontend render but fail at login.)
- Notifications on staging: Brevo with a verified test sender, or
  `CONDDO_EMAIL_PROVIDER=log` to keep OTPs out of real inboxes.
- Treat this data as disposable — sign up throwaway tenants freely.

Branch flow: **push to `main` → auto-deploys to staging.** That's the whole loop for V1.

## Later (production cutover, after V1)
When V1 is signed off:
1. **New Postgres** (`conddo-prod-db`) — fresh, empty, isolated.
2. **New backend service** `conddo-backend-prod` tracking a `production` branch,
   env pointed at the prod DB, **its own JWT signing keys**, real Brevo sender,
   `CORS` = the prod domain.
3. **Vercel:** point Production at the prod backend (set the Production Branch to
   `production`, or a separate prod project); keep `main`/previews → staging.
4. Promote by merging `main → production`. Point the real domain (`app.conddo.io`)
   at the prod deploy; verify with a smoke test before announcing.

## Local dev (third tier)
`npm run dev` against whichever backend is in `.env.local` (defaults to the live
staging backend). Nothing here touches prod.
