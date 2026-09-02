import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Donation server functions.
 *
 * - `createDonationCheckout` is public: it creates a Stripe Checkout Session
 *   (one-time or recurring) and returns the hosted-checkout URL.
 * - `getDonationStats` is public but aggregate-only — no donor PII leaves the
 *   server.
 * - `adminListDonations` is admin-only and returns full donor records.
 *
 * Donation rows are only ever written by the verified Stripe webhook at
 * /api/public/webhooks/stripe — never by the browser.
 */

const FREQUENCIES = ["once", "monthly", "annual"] as const;

export const createDonationCheckout = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        amount: z.number().int().min(1).max(100000),
        frequency: z.enum(FREQUENCIES),
        name: z.string().trim().min(1).max(120),
        email: z.string().trim().email().max(255),
        origin: z.string().trim().url().max(300),
        userId: z.string().uuid().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env["STRIPE_SECRET_KEY"];
    if (!key) throw new Error("Payments are not configured yet. Please try again later.");

    const amountCents = data.amount * 100;
    const recurring = data.frequency !== "once";
    const label =
      data.frequency === "monthly"
        ? "Monthly gift — Mississippi Struggle"
        : data.frequency === "annual"
          ? "Annual gift — Mississippi Struggle"
          : "Donation — Mississippi Struggle";

    const form: Record<string, string> = {
      mode: recurring ? "subscription" : "payment",
      success_url: `${data.origin}/donate?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${data.origin}/donate?status=canceled`,
      customer_email: data.email,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(amountCents),
      "line_items[0][price_data][product_data][name]": label,
      "metadata[donor_name]": data.name,
      "metadata[donor_email]": data.email,
      "metadata[frequency]": data.frequency,
      "metadata[amount_cents]": String(amountCents),
    };
    if (data.userId) form["metadata[user_id]"] = data.userId;
    if (recurring) {
      form["line_items[0][price_data][recurring][interval]"] =
        data.frequency === "monthly" ? "month" : "year";
      form["subscription_data[metadata][donor_name]"] = data.name;
      form["subscription_data[metadata][donor_email]"] = data.email;
      form["subscription_data[metadata][frequency]"] = data.frequency;
    }

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(form).toString(),
    });
    const json: any = await res.json();
    if (!res.ok || !json?.url) {
      console.error("[stripe] checkout session failed", json?.error?.message);
      throw new Error("Could not start checkout. Please try again.");
    }

    // Record the intent as pending; the webhook flips it to succeeded.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("donations").insert({
      user_id: data.userId ?? null,
      donor_name: data.name,
      donor_email: data.email,
      amount_cents: amountCents,
      frequency: data.frequency,
      status: "pending",
      stripe_session_id: json.id,
    });

    return { url: json.url as string };
  });

/** Aggregate, PII-free donation totals for public pages. */
export const getDonationStats = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("donations")
    .select("amount_cents,frequency,donor_email")
    .eq("status", "succeeded");
  const rows = data ?? [];
  const totalCents = rows.reduce((s, r) => s + (r.amount_cents ?? 0), 0);
  const supporters = new Set(rows.map((r) => r.donor_email ?? "")).size;
  const recurring = rows.filter((r) => r.frequency !== "once").length;
  return { totalCents, supporters, recurring, gifts: rows.length };
});

/**
 * Public donor-transparency feed: succeeded gifts only, with donor names
 * reduced to a first name + last initial. Emails and Stripe IDs never leave
 * the server.
 */
export const listPublicDonations = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("donations")
    .select("id,donor_name,amount_cents,frequency,created_at")
    .eq("status", "succeeded")
    .order("created_at", { ascending: false })
    .limit(25);
  return {
    donations: (data ?? []).map((r) => {
      const parts = String(r.donor_name ?? "").trim().split(/\s+/).filter(Boolean);
      const display = parts.length
        ? `${parts[0]}${parts.length > 1 ? " " + parts[parts.length - 1]![0] + "." : ""}`
        : "Anonymous";
      return {
        id: r.id,
        donor: display,
        amountCents: r.amount_cents,
        frequency: r.frequency,
        createdAt: r.created_at,
      };
    }),
  };
});

/** Confirms a gift right after checkout returns (before webhook, if needed). */
export const getDonationBySession = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ sessionId: z.string().trim().min(5).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("donations")
      .select("amount_cents,frequency,status")
      .eq("stripe_session_id", data.sessionId)
      .maybeSingle();
    if (!row) return null;
    return { amountCents: row.amount_cents, frequency: row.frequency, status: row.status };
  });

// ---------------- Admin ----------------

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden: admin access required");
}

export const adminListDonations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        status: z.enum(["all", "pending", "succeeded", "failed", "refunded"]).optional(),
        frequency: z.enum(["all", "once", "monthly", "annual"]).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = context.supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    if (data.frequency && data.frequency !== "all") q = q.eq("frequency", data.frequency);
    const { data: rows } = await q;
    const all = rows ?? [];
    const succeeded = all.filter((r: any) => r.status === "succeeded");
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const totalCents = succeeded.reduce((s: number, r: any) => s + r.amount_cents, 0);
    const monthCents = succeeded
      .filter((r: any) => r.created_at >= monthStart)
      .reduce((s: number, r: any) => s + r.amount_cents, 0);
    return {
      donations: all,
      stats: {
        totalCents,
        monthCents,
        avgCents: succeeded.length ? Math.round(totalCents / succeeded.length) : 0,
        recurringCount: succeeded.filter((r: any) => r.frequency !== "once").length,
        count: succeeded.length,
      },
    };
  });
