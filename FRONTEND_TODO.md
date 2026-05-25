# Conddo frontend — TODO & status

> Living checklist for `conddo-app`. Updated 2026-05-25.
> Backend contract: `backend/ACTION_LIST.md` (§11) + `backend/ARCHITECTURE.md` (§16 manifests).

## ✅ Done & pushed
Core operator dashboard, fully wired to the live backend (verified by a 22/22 live smoke test):

- **Auth** — route guard + logout, login, forgot/reset password, onboarding on the live `/auth/register/*` email-OTP flow (creates tenant + JWT).
- **Customers** — list, profile (notes, measurements, tags), live order + payment history, add customer, New Order from profile.
- **Orders** — Kanban board, detail, New Order (customer picker + stages), stage advance, record payment, send reminder, save notes.
- **Bookings** — week calendar, New Booking, availability editor, copy share link.
- **Inventory** — products list, add/edit product, adjust stock.
- **Settings** — business profile + branding/social/location, notification prefs, danger-zone deactivate.
- **Staff** — list, invite, manage role/status, resend invite.
- **Marketing** — overview, social calendar (schedule + publish), email/SMS campaigns, leads (funnel + add). Ads = coming-soon (no endpoint).
- **Global search**, **notifications**, **public self-book** `/book/{slug}`.
- **Manifest-driven nav** (Home + tool sections + Settings) — correct backend contract, resilient fallback to static nav.
- **Vertical-tool scaffolds** — `/pos`, `/prescriptions`, `/tracking`, `/tables`, `/store`, `/documents`, `/loyalty`.
- **Shared infra** — Toast, Modal, Field, CustomerPicker, Measurements/Product/Campaign/Post modals.
- **Email templates** — verification, password-reset, welcome, staff-invite (`email-templates/`).

> **2026-05-25 — backend deploy landed.** All new endpoints are live (payments,
> website +sections/change-requests, rich analytics, registry/manifests, customer
> history). **Login now emits `activeModules`** → the manifest-driven sidebar is
> now ACTIVE (verified: fashion/starter → Home·Website·Customers·Orders·Payments·Analytics·Settings).

## 🔜 Track A — SME app gaps (endpoints exist; wire/extend)
- [ ] **1. Website management** — `/website/{sections,analytics,change-requests,domain}`. Today reads a status blob; "Request changes", "Connect domain", "Request update" are dead. Build: change-request flow, custom-domain connect, site analytics, real sections.
- [x] **2. Payments → live** — wired to `/payments/{summary,transactions,outstanding,reminders}` (KPIs, filterable ledger, outstanding-by-customer + send reminder). ✅
- [ ] **3. Analytics (rich)** — `/analytics/{revenue,orders,customers,top,traffic}`. Only `/overview` consumed; add series/charts/top-lists/traffic.
- [ ] **4. Connected accounts** — rewire Settings → `/marketing/connections` (currently hits non-existent `/settings/connections`); wire Connect/Disconnect.
- [ ] **5. Order pipeline stages** — `/orders/stages` CRUD. Wire "Add Stage" + column menu (rename/reorder/delete).
- [ ] **6. Order line items** — `/orders/{id}/items` add/edit/delete (shown read-only now).
- [ ] **7. Home setup checklist** — `/dashboard/setup-checklist` (+dismiss). Real dismissable checklist widget.
- [ ] **8. Customer segments** — `/customers/segments`. Wire the "Segments" dropdown.
- [ ] **9. Booking edit/cancel** — `PATCH`/`DELETE /bookings/{id}`, `POST /bookings/link`. Clickable events → reschedule/cancel; regenerate link.
- [ ] **10. Business hours** — `/settings/business-hours` (GET/PUT). Wire the static hours editor.
- [ ] **11. Smaller** — create inventory category; delete customer/product; `/staff/{id}/activity`; consume `/staff/roles` & `/verticals/{id}/config` in onboarding.

## 🟣 Track B — Conddo Studio (internal Jobs Board) — NOT built (separate app)
Full backend at `/api/jobs/*`; zero frontend. Its own login + portal:
- [ ] Worker portal — `/api/jobs` (my-jobs, available, claim, start, submit) + `/api/jobs/auth` + `/api/jobs/notifications`
- [ ] Admin/manager — `/api/jobs/admin` (dashboard, staff, create/reassign, extend-SLA, escalate)
- [ ] QA review — `/api/jobs/qa` (queue, start, approve, return)
- [ ] Performance — `/api/jobs/performance`

## ⚙️ Track C — Platform super-admin console — NOT built
- [ ] Manage all tenants — `GET /api/v1/tenants` + `X-Act-As-Tenant`.

## 🌐 Track D — Public storefront — NOT built (may be Studio-produced)
- [ ] Rendered public website for `businessname.conddo.io` — `/api/v1/public/tenant`. (We have public booking only.)

## 🚀 Prod readiness
- [ ] Refresh-token flow via the `/auth/refresh` httpOnly cookie (auto-renew the 15-min access token).
- [ ] Remove demo scaffolding (`lib/demo/*`).
- [ ] Deploy the frontend (Vercel) + set `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_APP_URL`; CORS origin on the backend.

## Backend dependencies
- [x] **Deploy landed (2026-05-25)** — new build live; payments/website/registry/customer-history all 200.
- [x] **Login emits `activeModules`** → manifest flip active.
- [ ] Wire the HTML **email templates** into `NotificationService` (send as Resend `html`).
- [ ] Set Resend/Brevo env vars on Render (file: `../conddo-backend-render.env`) + rotate the keys.
- [ ] Dashboard **widgets** in manifests (catalogue returns `widgets: []`) → unlocks the §16.2 widget-zone renderer.
