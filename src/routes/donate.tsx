import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CreditCard, Lock, Check, Heart } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate | Mississippi Struggle" },
      {
        name: "description",
        content:
          "Fund legal defense, education, and advocacy for prison reform in Mississippi. One-time or monthly gifts, with full transparency on how funds are used.",
      },
      { property: "og:title", content: "Donate | Mississippi Struggle" },
      {
        property: "og:description",
        content: "Your gift funds legal defense, education, and advocacy across Mississippi.",
      },
    ],
  }),
  component: DonatePage,
});

const presetAmounts = [25, 50, 100, 250];

/** Fund allocation breakdown — illustrative figures. */
const allocation = [
  { name: "Legal Defense", value: 42, color: "var(--color-chart-1)" },
  { name: "Education & Outreach", value: 24, color: "var(--color-chart-2)" },
  { name: "Advocacy & Lobbying", value: 18, color: "var(--color-chart-3)" },
  { name: "Re-entry Programs", value: 11, color: "var(--color-chart-4)" },
  { name: "Operations", value: 5, color: "var(--color-chart-5)" },
];

const donors = [
  "Magnolia Community Foundation",
  "Delta Justice Fund",
  "The Hooks Family",
  "Gulf Coast Legal Collective",
  "Anonymous (×14)",
  "Jackson Faith Alliance",
  "Tougaloo Alumni Network",
  "River City Partners",
];

function DonatePage() {
  const [frequency, setFrequency] = useState<"once" | "monthly">("monthly");
  const [amount, setAmount] = useState<number>(50);
  const [custom, setCustom] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const effectiveAmount = custom ? Number(custom) || 0 : amount;

  return (
    <>
      <PageHeader
        eyebrow="Donors & Fundraising"
        title="Power the fight for justice"
        description="Every dollar funds legal defense, family support, and the long work of changing Mississippi law. We publish exactly where it goes."
      />

      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Donation form */}
        <section aria-labelledby="give-heading">
          <h2 id="give-heading" className="text-2xl">Make a gift</h2>

          {/* Frequency toggle */}
          <div
            role="group"
            aria-label="Donation frequency"
            className="mt-6 inline-flex rounded-lg border border-border bg-muted p-1"
          >
            {(["monthly", "once"] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={frequency === f}
                onClick={() => setFrequency(f)}
                className={cn(
                  "rounded-md px-5 py-2 text-sm font-semibold transition-colors",
                  frequency === f
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f === "monthly" ? "Monthly" : "One-time"}
              </button>
            ))}
          </div>

          {/* Tiered cards */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {presetAmounts.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={!custom && amount === a}
                onClick={() => {
                  setAmount(a);
                  setCustom("");
                }}
                className={cn(
                  "rounded-lg border-2 p-4 text-center transition-all",
                  !custom && amount === a
                    ? "border-gold bg-gold/10 shadow-sm"
                    : "border-border bg-card hover:border-gold/60",
                )}
              >
                <span className="block font-display text-2xl font-bold text-primary">${a}</span>
                <span className="text-xs text-muted-foreground">
                  {frequency === "monthly" ? "per month" : "one-time"}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <Label htmlFor="custom-amount">Custom amount</Label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="custom-amount"
                inputMode="numeric"
                placeholder="Enter an amount"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
                className="pl-7"
              />
            </div>
          </div>

          {/* Mock payment gateway UI */}
          <Card className="mt-6 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" /> Payment details
                </h3>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Secure
                </span>
              </div>

              {submitted ? (
                <div
                  role="status"
                  className="mt-5 flex items-start gap-3 rounded-lg bg-success/10 p-4 text-sm"
                >
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                  <p>
                    Thank you! This is a demo — no payment was processed. In production this
                    form would connect to Stripe or PayPal to securely charge{" "}
                    <strong>${effectiveAmount}</strong>{" "}
                    {frequency === "monthly" ? "per month" : "one time"}.
                  </p>
                </div>
              ) : (
                <form
                  className="mt-5 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="card-name">Name on card</Label>
                      <Input id="card-name" required className="mt-1.5" autoComplete="cc-name" />
                    </div>
                    <div>
                      <Label htmlFor="card-email">Email for receipt</Label>
                      <Input id="card-email" type="email" required className="mt-1.5" autoComplete="email" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="card-number">Card number</Label>
                    <Input
                      id="card-number"
                      inputMode="numeric"
                      placeholder="4242 4242 4242 4242"
                      className="mt-1.5"
                      autoComplete="cc-number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="card-exp">Expiry</Label>
                      <Input id="card-exp" placeholder="MM / YY" className="mt-1.5" autoComplete="cc-exp" />
                    </div>
                    <div>
                      <Label htmlFor="card-cvc">CVC</Label>
                      <Input id="card-cvc" placeholder="123" className="mt-1.5" autoComplete="cc-csc" />
                    </div>
                  </div>

                  <Button type="submit" variant="donate" size="lg" className="w-full">
                    <Heart className="h-4 w-4" />
                    Give ${effectiveAmount} {frequency === "monthly" ? "/ month" : ""}
                  </Button>
                  <p className="flex items-center justify-center gap-3 pt-1 text-xs text-muted-foreground">
                    <span className="rounded bg-muted px-2 py-1 font-semibold">Stripe</span>
                    <span className="rounded bg-muted px-2 py-1 font-semibold">PayPal</span>
                    <span>· 256-bit encrypted · tax-deductible</span>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Transparency */}
        <aside className="space-y-8">
          <section aria-labelledby="allocation-heading">
            <h2 id="allocation-heading" className="text-2xl">Where your money goes</h2>
            <Card className="mt-5 shadow-[var(--shadow-card)]">
              <CardContent className="p-6">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocation}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {allocation.map((slice) => (
                          <Cell key={slice.name} fill={slice.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-4 space-y-2">
                  {allocation.map((slice) => (
                    <li key={slice.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-sm"
                          style={{ backgroundColor: slice.color }}
                          aria-hidden="true"
                        />
                        {slice.name}
                      </span>
                      <span className="font-semibold">{slice.value}%</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="donors-heading">
            <h2 id="donors-heading" className="text-2xl">Our supporters</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              With gratitude to the foundations, businesses, and individuals who make this work possible.
            </p>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {donors.map((d) => (
                <li
                  key={d}
                  className="rounded-md border border-border bg-card px-4 py-3 text-sm font-medium"
                >
                  {d}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
