# Conddo.io — Architecture v1.0 (Frontend Excerpt)

> Frontend-relevant slice of **Platform Architecture v1.0**. The **canonical full
> spec is `conddo_architecture.md` at the workspace root**; a backend copy is in
> `backend/ARCHITECTURE.md`. Vertical→tool matrix: `VERTICALS.md`. (§16 is now
> available — the manifest contract is captured below.)
> **Where v1.0 and the current build disagree, v1.0 is the target.** This file lists
> what the frontend must become and the delta from what's wired today.

## The big shift: the UI is manifest-driven, not hardcoded
Each active **capability tool** returns a `UIManifest` describing its sidebar entry,
routes, dashboard widgets, permissions, and UI config (§7.2). **The frontend must render
nav/routes/widgets from the tenant's active tools — it must not hardcode them.** A Pharmacy
tenant then sees Inventory/Prescriptions/POS; a Beauty tenant sees Bookings/Loyalty — all
from config, zero per-vertical frontend code.

```
UIManifest {
  toolId
  navItem        { label, icon, path, order }     // sidebar entry
  routes         [{ path, component }]
  permissions    [...]
  dashboardWidgets [{ component, position }]       // position: metric | sidebar | ...
  config         { ...tool-specific UI config }
}
```
Today: `components/app/AppShell.tsx` + `lib/app-nav.ts` (`APP_NAV`) are a **fixed 11-item
list**. Target: replace with a manifest consumer driven by the tenant's active tools.

### §16 — Manifest consumption contract (now defined)
On login, after the JWT is received:
1. **Decode JWT** → `{ activeModules, vertical, plan }`.
2. **Fetch manifests:** `GET /api/v1/registry/manifests?modules=<activeModules>` → array of
   `UIManifest`.
3. **Build nav:** `manifests.flatMap(m => m.navItems).sort((a,b) => a.order - b.order)`.
4. **Register routes:** `manifests.flatMap(m => m.routes)` → `{ path, component }`.
5. **Render:** sidebar shows navItems automatically; the router resolves routes; the dashboard
   places widgets by zone. **Zero hardcoding** — a Pharmacy tenant gets Home/Inventory/POS/
   Prescriptions/Customers/Payments/Marketing/Analytics/Staff; a Fashion tenant gets Home/
   Orders/Customers/Payments/Marketing/Analytics/Staff — from the same app.

`component` is a string key → resolved via a **frontend component registry** (`{ "InventoryList":
<component>, … }`) that maps manifest component names to our existing React components.

### §16.2 — Dashboard widget zones
Each tool contributes widgets placed in predefined zones:
`metric` (top metric cards) · `chart` (main charts) · `list` (recent-activity lists) ·
`sidebar` (right-column alerts/summaries) · `alert` (top-of-page banners).
Examples: Pharmacy dashboard → metric: RevenueToday, LowStockCount, ExpiringCount,
PendingPrescriptions; list: RecentSales; sidebar: ExpiryAlert, LowStockAlert. Fashion → metric:
RevenueToday, PendingOrders, NewCustomers, OutstandingPayments; list: RecentOrders; sidebar:
UpcomingFittings.

## JWT carries module entitlements (§4.4)
Access token (15-min, RSA-256) payload adds: `vertical`, `plan`, and **`activeModules`**
(array of active tool ids). The app reads these to: build the nav, gate routes client-side,
and label the plan. The gateway also enforces module access server-side (`/api/v1/{module}/**`
→ 403 if the module isn't in `activeModules`, §10.3) — so the UI should hide what the gateway
will reject.

## Auth & signup flow (§4.3, §4.5) — DELTA from current build
v1.0 signup is **phone-OTP first**, not the email+slug path we wired:
1. `POST /auth/signup/initiate { phone }` → OTP SMS via **Brevo** → `{ otpSent:true }`
2. `POST /auth/signup/verify-otp { phone, code }` → `{ token: 'tmp' }`
3. `POST /auth/signup/complete { businessName, vertical, plan, … }` → creates tenant+user,
   returns `{ accessToken, user, tenant }` (also fires `TenantCreated`).
Login: `POST /auth/login` (email/phone + password) → JWT pair + httpOnly refresh cookie
(rotation + family reuse-detection). `GET /auth/me` → current user.

**What we built vs v1.0:**
| Area | Wired today | v1.0 target |
|---|---|---|
| Signup | `POST /api/v1/tenants` (name/slug/email/pwd), no OTP; signup at choose-plan step | 3-step phone-OTP (`/auth/signup/initiate → verify-otp → complete`) via Brevo |
| Login | email + password + `tenantSlug` | email/phone + password; subdomain resolves tenant |
| `/me` | `{user, tenant}` | adds `vertical`, `plan`, `activeModules` to JWT/me |
| Nav | hardcoded `APP_NAV` | manifest-driven from active tools |
| Verticals | Fashion + Pharmacy | 7 verticals (`VERTICALS.md`), tier-gated tools |
| Notifications | n/a | Brevo (email + SMS) |

## API routing (§10.3)
All routes `/api/v1/{module}/{resource}` (e.g. `/api/v1/inventory/products`, `/api/v1/crm/customers`,
`/api/v1/marketing/social/posts`). The `lib/api/client.ts` base already prefixes `/api/v1`;
module-segment routing aligns with the existing per-module calls. Standard envelope is
`{ success, data, meta?, error? }` (already handled).

## Implementation status (manifest-driven shell)
**Phase 1–2 done (fallback-safe, shipped):** the nav pipeline is live.
`lib/manifest/types.ts` (manifest types), `lib/manifest/icons.ts` (icon-name → lucide),
`lib/jwt.ts` (decode `activeModules`/`vertical`/`plan`), `hooks/useManifests.ts`
(fetches `/api/v1/registry/manifests?modules=…` **only when the JWT carries `activeModules`**,
else returns null), and `hooks/useAppNav.ts` (manifests → sorted nav, else `APP_NAV`).
`AppShell` now renders the sidebar from `useAppNav()`. Today it always falls back (backend
emits neither the claim nor the endpoint), so the UI is unchanged — verified identical.
**Pending (needs backend):** `activeModules` in the JWT/`/me` + `GET /api/v1/registry/manifests`.
**Phase 3 (next, frontend):** componentize dashboard widgets + a component registry
(`componentName → React component`), then make the Dashboard a zone renderer.

## Migration notes (frontend)
- Keep the current screens; they become the `component`s the manifests reference.
- Build a **component registry** (`componentName → React component`) so manifest `routes`/`widgets`
  resolve to real components (e.g. `InventoryList`, `RecentOrders`, `ExpiryAlert`).
- Replace `app-nav.ts` with a hook that fetches `/api/v1/registry/manifests` for the JWT's
  `activeModules` and derives nav (sorted by `navItem.order`), routes, and dashboard widgets.
- Make the Dashboard a **zone renderer** (`metric/chart/list/sidebar/alert`) fed by manifest widgets.
- Rework onboarding to the 3-step OTP flow (`/auth/signup/initiate → verify-otp → complete`) once
  those endpoints are live; rework `/login` if subdomain resolution replaces the workspace field.
- **Blocked only on the backend** shipping `/api/v1/registry/manifests` + the JWT `activeModules`
  claim (live `/me`/login currently omit them). The contract itself is now defined.
