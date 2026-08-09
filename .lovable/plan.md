# Activate Real Donations (Stripe) + Admin Donation Tools

## Goal
Turn the donate page from a mock form into real Stripe checkout for one-time, monthly, and annual gifts, and give admins a full donations view in the dashboard.

## 1. Set up Stripe
- Enable Lovable's built-in Stripe payments — no Stripe account or API key needed to start. A test environment is created immediately so we can run fake-card donations end to end; accepting live money requires claiming the account and completing verification.
- No tax automation: charitable gifts aren't taxed at checkout. (Receipts/501(c)(3) acknowledgements stay a separate, manual step unless you ask for them.)
- Create the products/prices:
  - One-time gift (custom amount)
  - Monthly recurring: preset tiers + custom
  - Annual recurring: preset tiers + custom

## 2. Donate page changes
- Keep the existing frequency toggle (one-time / monthly / annual) and preset + custom amount UI; replace the fake "card details" block with a real Stripe Checkout redirect.
- Optional sign-in: guests give with just name + email; if the visitor is signed in, the gift is linked to their account automatically.
- Add a "Thank you" confirmation state after returning from checkout, and a graceful "canceled" state.
- Leave the existing "More ways to give" volunteer section untouched.

## 3. Donation records
New `donations` table storing: amount, currency, frequency (one_time/monthly/annual), donor name, donor email, optional user id, Stripe session/subscription/customer ids, status (pending/succeeded/failed/refunded), and timestamps.
- Rows are written only by the verified Stripe webhook — never by the browser.
- Reads restricted to admins; signed-in donors can read only their own gifts.
- A `recurring_donors` view/derived list for active subscriptions (with cancel/lapse status kept in sync by webhook events).

## 4. Webhook
A public endpoint at `/api/public/webhooks/stripe` that verifies the Stripe signature before writing anything, and handles: checkout completed, invoice paid (recurring renewals), subscription updated/canceled, and refunds.

## 5. Admin dashboard — new "Donations" tab
- Donation list: date, donor, amount, frequency, status, with search and filters.
- Totals: all-time raised, this month, average gift, and count of active recurring supporters.
- Recurring donors section: active monthly/annual supporters, next charge date, and cancellations.
- CSV export of the filtered list for bookkeeping.

## 6. Impact stats sync
Replace the hardcoded homepage counters with real totals pulled from approved donation data (total raised, number of supporters), read through a public server function so no donor details are exposed.

## Technical notes
- Stripe Checkout sessions created in a `createServerFn`; secret keys stay server-side.
- Webhook writes use the admin client only after signature verification; RLS + GRANTs applied to `donations`.
- Public stats come from an aggregate-only read — no donor names or emails ever leave the server for public pages.

## Out of scope (unless you ask)
- Emailed tax receipts / year-end statements.
- Donor self-service portal for managing subscriptions (can add Stripe's billing portal later).
