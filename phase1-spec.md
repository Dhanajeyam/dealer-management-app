# Agri-Chemical Dealer Management App — Phase 1 Spec

## 1. Overview

A multi-dealer stock and sales management app for an agri-chemical distribution business. Dealers manage their own products and farmer (customer) records; admin oversees all dealers and their performance. Built for this specific client — not a generic multi-industry template.

**Core loop:** Add stock → Farmer buys → Stock deducted → Purchase logged to farmer history → Bill generated/printed.

---

## 2. Users & Roles

Two roles sharing one authentication system:

| Role | Who | Access |
|---|---|---|
| **Dealer** | Shop owners managing their own inventory & farmers | Only their own data |
| **Admin** | Business owner overseeing all dealers | All dealers' data, read + manage |

Farmers are **not** app users — they remain records owned by a dealer.

---

## 3. Authentication

- **Method:** Email + password (common login screen for both roles)
- **Session:** Expires after 24 hours; re-login required after
- **Dealer signup:** Self-serve — email, password, shop name, phone → account created with `status: pending`
- **Admin accounts:** Not self-signup. Created directly in the database by the developer.
- **Approval gate:** A pending dealer can log in but sees a "Waiting for approval" screen — no access to products/farmers/sales until admin approves.

---

## 4. Data Model

**users** (or Supabase `auth.users` + `profiles`)
- id, email, password (managed by auth provider)
- role: `dealer` | `admin`
- shop_name, phone (dealer only)
- status: `pending` | `approved` | `blocked` (dealer only)
- created_at

**products**
- id, dealer_id (owner scope)
- brand, name, quantity, unit, price
- created_at, updated_at

**farmers**
- id, dealer_id (owner scope)
- name, phone, village
- created_at

**sales**
- id, dealer_id, farmer_id
- date, total_amount
- items: linked sale_items (or JSON array — decide at schema build time)

**sale_items**
- id, sale_id, product_id
- product name/brand snapshot (in case product is edited/deleted later), qty, unit, price_at_sale

> Storing a snapshot of product name/brand/price on each sale item (not just a reference) matters — if a dealer edits or deletes a product later, past bills and reports should still show what was actually sold at the time.

---

## 5. Dealer App — Features

| Feature | Phase 1? |
|---|---|
| Signup / login | ✅ |
| Add / edit / delete products (brand, name, qty, unit, price) | ✅ |
| Add / search farmers | ✅ |
| Record a sale (cart → confirm → auto stock deduction) | ✅ |
| Farmer purchase history | ✅ |
| Generate bill (print via device's connected WiFi printer) | ✅ |
| Reprint past bill | ✅ |
| Basic analytics: revenue (day/week/month), top 5 products, low-stock list | ✅ |
| Credit / udhaar tracking | ❌ Phase 2 |
| Deep analytics (trends, forecasting) | ❌ Phase 2 |

## 6. Admin App — Features

| Feature | Phase 1? |
|---|---|
| Login | ✅ |
| View new dealer signups (pending) | ✅ |
| Approve / block a dealer | ✅ |
| Edit dealer basic info | ✅ |
| View any dealer's sales history + revenue | ✅ |
| Platform-wide leaderboard (dealers ranked by revenue) | ✅ |
| Brand sponsorships, financing referrals | ❌ Phase 3+ |

---

## 7. Explicitly Out of Scope (Phase 1)

- Farmers as app users
- GST / tax compliance
- Multi-branch dealer support
- SMS / push notifications
- Monetization mechanics (pricing model still under evaluation)
- Generic/template architecture for other industries

---

## 8. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Backend / DB** | Supabase (Postgres + Auth) | Built-in email/password auth with session control, real relational DB — makes revenue rollups/leaderboards a simple SQL query instead of hand-rolled aggregation |
| **Auth** | Supabase Auth | Handles roles, password hashing, session expiry out of the box |
| **Frontend** | Mobile-first responsive web app (React) *or* React Native | Dealers primarily use this on phones in-store; confirm final choice based on whether Play Store presence matters now or later |
| **Bill printing** | Browser/device print dialog → OS-paired WiFi printer | No direct raw network printing from a website; relies on the printer being added as a system printer on the device (standard setup for most WiFi receipt printers) |
| **Hosting** | Supabase (backend) + Vercel/Netlify (if web) or app store distribution (if native) | Fast to deploy, minimal ops overhead for a small team |

---

## 9. Open Decision

- **Frontend platform**: web app (faster to ship, works everywhere, but not a "real" Play Store app) vs. React Native (true Android/iOS app, more setup, better fit if Play Store presence matters for credibility with dealers). Worth deciding before scaffolding begins.
