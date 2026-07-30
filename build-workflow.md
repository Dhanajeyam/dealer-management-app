# Build Workflow — Step by Step (Phase 1)

This is the order a senior dev would actually build this in, not just a feature list. Each step depends on the one before it, so the sequence matters — skipping ahead usually means redoing work later.

---

## Step 1 — Project & environment setup
- Create the Supabase project (this gives you the Postgres database + Auth service immediately)
- Create the frontend project (React web app or React Native — decided separately)
- Set up version control (Git repo), and connect Supabase environment keys (URL + anon key) into the frontend project as environment variables
- **Why first:** nothing else can be built or tested without a live backend and a project to write code into.

## Step 2 — Database schema
- Create the actual tables in Supabase: `users`/`profiles`, `products`, `farmers`, `sales`, `sale_items` (as outlined in the Phase 1 spec)
- Define relationships (foreign keys): products/farmers/sales all reference `dealer_id`
- **Why now:** authentication and every feature after this reads/writes to these tables — the schema is the foundation everything else sits on.

## Step 3 — Row-level security (data isolation)
- Write Postgres Row Level Security (RLS) policies so a dealer can only see/edit their own products, farmers, and sales
- Write a separate policy allowing admin role to read across all dealers
- **Why now, not later:** if you build features first and add RLS afterward, you risk shipping a version where dealers could technically see each other's data. Security belongs in the schema layer, not bolted on at the end.

## Step 4 — Authentication flow
- Implement Supabase Auth: signup (email, password, shop name, phone) and login
- On signup, create the linked profile row with `role: dealer`, `status: pending`
- Implement the 24-hour session expiry (Supabase handles token expiry; you just configure it)
- Build the "pending approval" gate: if `status !== approved`, block access to dealer features and show a waiting screen
- Manually insert your first admin account directly into the database (not through a signup form)
- **Why now:** every other screen after this requires knowing who's logged in and what role/status they have.

## Step 5 — Dealer app: Stock module
- Build product list (grouped by brand), add/edit/delete product form, quantity adjustment
- Connect directly to the `products` table scoped to the logged-in dealer
- **Why this first among features:** sales can't be recorded without stock existing first — this is the dependency root for the rest of the dealer app.

## Step 6 — Dealer app: Farmer module
- Add farmer form, farmer search/list, farmer detail view (empty purchase history for now)
- **Why now:** the sales flow (next step) needs a farmer to attach a sale to — this has to exist before sales can be built.

## Step 7 — Dealer app: Sales & billing
- Build the cart flow: select farmer → select product(s) → quantity → confirm
- On confirm: deduct stock, create the sale + sale_item records
- Build the bill preview + print (browser print dialog → device's paired WiFi printer)
- Add reprint from farmer history
- **Why now:** this is the core value loop, and it depends on both Step 5 and Step 6 already existing.

## Step 8 — Dealer app: Basic analytics
- Revenue totals (day/week/month) — simple SQL aggregation over `sales`
- Top 5 products by quantity sold
- Low-stock list (products below a threshold)
- **Why last for dealer app:** analytics reads from sales data — there's nothing to analyze until Steps 5–7 are producing real records.

## Step 9 — Admin app
- Dealer list with status (pending/approved/blocked)
- Approve/block action (updates the `status` field)
- Edit dealer info
- Per-dealer sales drill-down (reuses the same analytics queries from Step 8, just unscoped from a single dealer)
- Platform-wide leaderboard (dealers ranked by revenue)
- **Why after the dealer app, not before:** admin features are just a read/manage layer over dealer data — there needs to be real dealer data for admin screens to be meaningfully testable.

## Step 10 — Internal QA pass
- Test the full loop end-to-end as a dealer: signup → wait for approval → get approved → add stock → add farmer → make a sale → print bill → check analytics
- Test as admin: see the signup, approve it, view that dealer's sales
- Specifically test the RLS boundaries: log in as Dealer A, confirm you cannot see Dealer B's data
- **Why before client testing:** catch structural bugs (data leaks, broken flows) before your client and their staff hit them.

## Step 11 — Pilot with the real client
- Onboard your client's actual shop as the first real dealer
- Have them use it for real stock and real farmers for a short trial period (few days to a week)
- Collect friction points: confusing screens, missing fields, printer issues, anything that doesn't match their real workflow
- **Why this matters:** this is the step most rushed builds skip, and it's usually where the most valuable fixes come from — real usage surfaces gaps no amount of internal testing will find.

## Step 12 — Fix, polish, deploy
- Fix issues found in the pilot
- Deploy frontend (Vercel/Netlify for web, or build + submit to Play Store if React Native)
- Supabase backend is already live/hosted from Step 1 — no separate backend deployment step needed
- **Why last:** you want the pilot feedback incorporated before this becomes the version other dealers see.

## Step 13 — Launch to additional dealers
- Once the pilot dealer is running smoothly, onboard the next dealer(s) under the same admin
- Continue monitoring admin dashboard for new signups needing approval

---

### Note on parallelization
A few things can happen alongside this sequence without blocking it — e.g., you can design the bill layout, or firm up brand list defaults, at any point. But the dependency chain above (schema → security → auth → stock → farmers → sales → analytics → admin → QA → pilot → launch) is the part that shouldn't be reordered.
