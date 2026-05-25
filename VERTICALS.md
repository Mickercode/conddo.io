# Conddo.io — Vertical → Tool Matrix (frontend reference)

> Mirror of `backend/VERTICALS.md`. Part of **Platform Architecture v1.0**.
> **The frontend must render nav, routes, and dashboard widgets from each active
> tool's `UIManifest` (Architecture §16) — it must NOT hardcode this matrix.**
> Today the shell still uses a fixed `lib/app-nav.ts` (`APP_NAV`); migrating it to a
> backend-driven module manifest is the planned refactor (awaiting §16). This file
> records the target tool set per `vertical × plan` so we know what the manifest will
> drive. Plan tiers are cumulative (Business ⊃ Starter, Pro ⊃ Business).

## Matrix

| Vertical | Starter tools | Business adds | Pro adds |
|---|---|---|---|
| **Pharmacy** | website, crm.pharmacy, inventory.pharmacy, pos.pharmacy, prescriptions, payments, analytics | staff, marketing.social, marketing.email, marketing.sms | marketing.ads, analytics.pharmacy |
| **Fashion / Tailoring** | website, crm, orders.fashion, payments, analytics | staff, marketing.social, marketing.email, marketing.sms, marketing.leads | marketing.ads |
| **Logistics** | website, crm, orders.logistics, payments, analytics | staff, marketing.social, marketing.sms | marketing.ads, tracking.advanced |
| **Retail / Shop** | website, crm, inventory.retail, pos, payments, analytics | staff, marketing.social, marketing.email, marketing.sms | marketing.ads, ecommerce |
| **Professional Services** | website, crm, bookings, payments, document-vault, analytics | staff, marketing.social, marketing.email, marketing.sms, marketing.leads | marketing.ads |
| **Food & Beverage** | website, crm, orders, payments, analytics | staff, marketing.social, marketing.email, marketing.sms, table-mgmt | marketing.ads |
| **Beauty & Wellness** | website, crm, bookings, payments, analytics | staff, marketing.social, marketing.email, marketing.sms, loyalty | marketing.ads |

(`social / email / sms / ads / leads` = the `marketing.*` tools. Full resolved
per-tier lists and the tool-ID legend live in `backend/VERTICALS.md`.)

## Tool → current frontend screen

**Already built** (these screens exist; some live, some on demo data):
- `website` → `/website` · `crm` → `/customers` (+ `/customers/[id]`) · `orders` /
  `orders.fashion` / `orders.logistics` → `/orders` (+ `/orders/[id]`) ·
  `bookings` → `/bookings` · `inventory` / `inventory.retail` → `/inventory` ·
  `payments` → `/payments` · `analytics` → `/analytics` · `staff` → `/staff`
- `marketing.social` → `/marketing/social` · `marketing.email` → `/marketing/email`
  · `marketing.sms` → `/marketing/sms` · `marketing.ads` → `/marketing/ads` ·
  `marketing.leads` → `/marketing/leads`

**Not built yet** (new tools introduced by the 7-vertical matrix):
- `pos` / `pos.pharmacy`, `prescriptions`, `document-vault`, `table-mgmt`,
  `loyalty`, `tracking.advanced`, `ecommerce`, `analytics.pharmacy`,
  and the pharmacy specializations of `crm` / `inventory`.

## Implication for the shell
Once §16 lands, `AppShell` + `app-nav.ts` get replaced by a manifest consumer:
the sidebar items, routes, and dashboard widgets come from the tenant's active
tools (carried in the JWT `activeModules` and/or fetched from the Module Registry),
so a Pharmacy tenant sees Inventory/Prescriptions/POS while a Beauty tenant sees
Bookings/Loyalty — all from config, no per-vertical frontend code.
