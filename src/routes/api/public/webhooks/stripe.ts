import { createFileRoute } from "@tanstack/react-router";

/**
 * Stripe webhook. Verifies the Stripe-Signature header (HMAC SHA-256 over
 * "<timestamp>.<raw body>") before writing anything, then records donation
 * outcomes. This is the only writer of the donations table.
 */

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacHex(secret: string, payload: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const Route = createFileRoute("/api/public/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook not configured", { status: 500 });

        const header = request.headers.get("stripe-signature") ?? "";
        const body = await request.text();
        const parts = Object.fromEntries(
          header.split(",").map((p) => {
            const [k, ...v] = p.split("=");
            return [k?.trim() ?? "", v.join("=")];
          }),
        ) as Record<string, string>;
        const timestamp = parts["t"];
        const provided = parts["v1"];
        if (!timestamp || !provided) return new Response("Invalid signature", { status: 401 });

        const expected = await hmacHex(secret, `${timestamp}.${body}`);
        if (!timingSafeEqual(expected, provided)) {
          return new Response("Invalid signature", { status: 401 });
        }
        // Reject replays older than 5 minutes.
        if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
          return new Response("Stale signature", { status: 401 });
        }

        const event = JSON.parse(body);
        const obj = event?.data?.object ?? {};
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        switch (event.type) {
          case "checkout.session.completed": {
            const meta = obj.metadata ?? {};
            const amountCents =
              obj.amount_total ?? Number(meta.amount_cents) ?? 0;
            const payload = {
              user_id: meta.user_id ?? null,
              donor_name: meta.donor_name ?? obj.customer_details?.name ?? null,
              donor_email: meta.donor_email ?? obj.customer_details?.email ?? null,
              amount_cents: amountCents,
              currency: obj.currency ?? "usd",
              frequency: meta.frequency ?? (obj.mode === "subscription" ? "monthly" : "once"),
              status: "succeeded",
              stripe_session_id: obj.id,
              stripe_subscription_id: obj.subscription ?? null,
              stripe_customer_id: typeof obj.customer === "string" ? obj.customer : null,
              stripe_payment_intent_id:
                typeof obj.payment_intent === "string" ? obj.payment_intent : null,
            };
            await supabaseAdmin
              .from("donations")
              .upsert(payload, { onConflict: "stripe_session_id" });
            break;
          }
          case "invoice.paid": {
            // Recurring renewal — record as a new succeeded gift.
            const subId = typeof obj.subscription === "string" ? obj.subscription : null;
            if (subId && obj.billing_reason === "subscription_cycle") {
              const { data: prior } = await supabaseAdmin
                .from("donations")
                .select("user_id,donor_name,donor_email,frequency")
                .eq("stripe_subscription_id", subId)
                .limit(1)
                .maybeSingle();
              await supabaseAdmin.from("donations").insert({
                user_id: prior?.user_id ?? null,
                donor_name: prior?.donor_name ?? obj.customer_name ?? null,
                donor_email: prior?.donor_email ?? obj.customer_email ?? null,
                amount_cents: obj.amount_paid ?? 0,
                currency: obj.currency ?? "usd",
                frequency: prior?.frequency ?? "monthly",
                status: "succeeded",
                stripe_session_id: `invoice_${obj.id}`,
                stripe_subscription_id: subId,
                stripe_customer_id: typeof obj.customer === "string" ? obj.customer : null,
              });
            }
            break;
          }
          case "charge.refunded": {
            const pi = typeof obj.payment_intent === "string" ? obj.payment_intent : null;
            if (pi) {
              await supabaseAdmin
                .from("donations")
                .update({ status: "refunded" })
                .eq("stripe_payment_intent_id", pi);
            }
            break;
          }
          case "checkout.session.expired":
          case "payment_intent.payment_failed": {
            if (obj.id) {
              await supabaseAdmin
                .from("donations")
                .update({ status: "failed" })
                .eq("stripe_session_id", obj.id);
            }
            break;
          }
          default:
            break;
        }

        return new Response("ok");
      },
    },
  },
});
