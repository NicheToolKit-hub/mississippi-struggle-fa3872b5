import { useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CreditCard, Lock, Check, Heart, HeartHandshake, Package, Share2, Megaphone, Lightbulb, Users, PenLine, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitVolunteerOffer, listSignatures } from "@/lib/public.functions";
import {
  createDonationCheckout,
  getDonationStats,
  listPublicDonations,
} from "@/lib/donations.functions";
import { useAuth } from "@/hooks/use-auth";
import { OFFER_TYPES } from "@/lib/media";

export const Route = createFileRoute("/donate")({
  validateSearch: (search: Record<string, unknown>): { status?: string; session_id?: string } => ({
    ...(typeof search.status === "string" ? { status: search.status } : {}),
    ...(typeof search.session_id === "string" ? { session_id: search.session_id } : {}),
  }),

  head: () => ({
    meta: [
      { title: "Donate | Mississippi Struggle" },
      {
        name: "description",
        content:
          "Fund legal defense, education, and advocacy for prison reform in Mississippi. One-time, monthly, or annual gifts, with full transparency on how funds are used.",
      },
      { property: "og:title", content: "Donate | Mississippi Struggle" },
      {
        property: "og:description",
        content: "Your gift funds legal defense, education, and advocacy across Mississippi.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://mississippi-struggle.lovable.app/donate" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://mississippi-struggle.lovable.app/donate" }],
  }),
  component: DonatePage,
});

const presetAmounts = [25, 50, 100, 250];

type Frequency = "once" | "monthly" | "annual";

const frequencyLabel: Record<Frequency, string> = {
  monthly: "per month",
  annual: "per year",
  once: "one-time",
};

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

/**
 * Live petition momentum panel — links the donate flow to the petition
 * counter so givers can also add their signature.
 */
function PetitionMomentum() {
  const fetchSignatures = useServerFn(listSignatures);
  const { data } = useQuery({
    queryKey: ["petition-signatures"],
    queryFn: () => fetchSignatures(),
    refetchInterval: 60_000,
  });
  const total = data?.total ?? 0;

  return (
    <Card className="border-gold/40 bg-gold/5">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">
            Petition momentum
          </p>
          <p className="mt-1 font-display text-4xl font-bold text-primary tabular-nums animate-pulse">
            {total.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Mississippians have signed for reform. Dollars and signatures move together.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/petitions">
            <PenLine className="h-4 w-4" /> Sign the petition <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Live donor transparency: aggregate totals plus the most recent succeeded
 * gifts. Rows are written only by the verified Stripe webhook, and names are
 * abbreviated server-side (no emails or Stripe IDs are exposed).
 */
function DonorTransparency() {
  const statsFn = useServerFn(getDonationStats);
  const listFn = useServerFn(listPublicDonations);
  const { data: stats } = useQuery({ queryKey: ["donation-stats"], queryFn: () => statsFn({}) });
  const { data, isLoading } = useQuery({
    queryKey: ["public-donations"],
    queryFn: () => listFn({}),
  });
  const gifts = data?.donations ?? [];
  const usd = (c: number) =>
    (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <section aria-labelledby="transparency-heading">
      <h2 id="transparency-heading" className="text-2xl">Donation transparency</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Every completed gift is recorded automatically and shown here.
      </p>
      <Card className="mt-5 shadow-[var(--shadow-card)]">
        <CardContent className="p-6">
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Raised</dt>
              <dd className="mt-1 text-xl font-bold text-gold">{usd(stats?.totalCents ?? 0)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Supporters</dt>
              <dd className="mt-1 text-xl font-bold">{stats?.supporters ?? 0}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Recurring</dt>
              <dd className="mt-1 text-xl font-bold">{stats?.recurring ?? 0}</dd>
            </div>
          </dl>

          <ul className="mt-6 divide-y divide-border border-t border-border">
            {isLoading && (
              <li className="py-4 text-sm text-muted-foreground">Loading recent gifts…</li>
            )}
            {!isLoading && gifts.length === 0 && (
              <li className="py-4 text-sm text-muted-foreground">
                No completed gifts recorded yet — yours would be the first.
              </li>
            )}
            {gifts.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{g.donor}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(g.createdAt as string).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {g.frequency !== "once" ? ` · ${g.frequency}` : ""}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-gold">{usd(g.amountCents)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}

function DonatePage() {
  const search = useSearch({ from: "/donate" });
  const { user } = useAuth();
  const startCheckout = useServerFn(createDonationCheckout);
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [amount, setAmount] = useState<number>(50);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveAmount = custom ? Number(custom) || 0 : amount;

  async function handleGive(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (effectiveAmount < 1) {
      setError("Please enter an amount of $1 or more.");
      return;
    }
    setBusy(true);
    try {
      const res = await startCheckout({
        data: {
          amount: effectiveAmount,
          frequency,
          name,
          email,
          origin: window.location.origin,
          userId: user?.id ?? null,
        },
      });
      window.location.href = res.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout. Please try again.");
      setBusy(false);
    }
  }


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

          <PetitionMomentum />

          {search.status === "success" && (
            <div role="status" className="mt-6 flex items-start gap-3 rounded-lg bg-success/10 p-4 text-sm">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
              <p>
                Thank you — your gift went through. A receipt is on its way to your email.
                Your support funds legal defense, education, and advocacy across Mississippi.
              </p>
            </div>
          )}
          {search.status === "canceled" && (
            <div role="status" className="mt-6 rounded-lg border border-border bg-muted p-4 text-sm">
              Checkout was canceled — no payment was taken. You can try again whenever you're ready.
            </div>
          )}

          {/* Frequency toggle */}
          <div
            role="group"
            aria-label="Donation frequency"
            className="mt-6 inline-flex rounded-lg border border-border bg-muted p-1"
          >
            {(["monthly", "annual", "once"] as const).map((f) => (
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
                {f === "monthly" ? "Monthly" : f === "annual" ? "Annual" : "One-time"}
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
                <span className="text-xs text-muted-foreground">{frequencyLabel[frequency]}</span>
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

          {/* Secure Stripe Checkout handoff — card details are entered on Stripe, never here. */}
          <Card className="mt-6 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" /> Your details
                </h3>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Secure checkout
                </span>
              </div>

              <form className="mt-5 space-y-4" onSubmit={handleGive}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="donor-name">Your name</Label>
                    <Input
                      id="donor-name"
                      required
                      maxLength={120}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="donor-email">Email for receipt</Label>
                    <Input
                      id="donor-email"
                      type="email"
                      required
                      maxLength={255}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {error && <p role="alert" className="text-sm text-crimson">{error}</p>}

                <Button type="submit" variant="donate" size="lg" className="w-full" disabled={busy}>
                  <Heart className="h-4 w-4" />
                  {busy
                    ? "Redirecting to secure checkout…"
                    : `Give $${effectiveAmount}${frequency === "once" ? "" : frequency === "monthly" ? " / month" : " / year"}`}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  You'll finish payment on Stripe's secure page. We never see or store your card
                  details. {user ? "This gift will be linked to your account." : "No account needed."}
                </p>
              </form>
            </CardContent>
          </Card>
        </section>


        {/* Transparency */}
        <aside className="space-y-8">
          <DonorTransparency />

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

      <MoreWaysToGive />
    </>
  );
}

function MoreWaysToGive() {
  const [offerType, setOfferType] = useState<string>("time");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await submitVolunteerOffer({ data: { offerType, name, email, details: details || null } });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-secondary py-16" aria-labelledby="more-ways-heading">
      <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">Beyond dollars</p>
          <h2 id="more-ways-heading" className="mt-2 text-2xl md:text-3xl">More ways to give</h2>
          <p className="mt-3 text-muted-foreground">
            Money is only one way to power this movement. Give your time, supplies, connections,
            or expertise — every contribution moves the work forward.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { icon: HeartHandshake, label: "Volunteer your time", text: "Mentoring, events, admin, research." },
              { icon: Package, label: "Donate supplies", text: "Books, materials, office and program needs." },
              { icon: Share2, label: "Networking", text: "Open doors to partners and resources." },
              { icon: Megaphone, label: "Advertising & links", text: "Amplify us online and offline." },
              { icon: Lightbulb, label: "Ideas & expertise", text: "Skills, advice, and fresh thinking." },
              { icon: Users, label: "Spread support", text: "Bring your community into the fight." },
            ].map((w) => (
              <li key={w.label} className="flex gap-3 rounded-lg border border-border bg-card p-4">
                <w.icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">{w.label}</p>
                  <p className="text-xs text-muted-foreground">{w.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">Offer your support</h3>
            {done ? (
              <div role="status" className="mt-4 flex items-start gap-3 rounded-lg bg-success/10 p-4 text-sm">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                <p>Thank you! Your offer has been received. Our team will follow up using the email you provided.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="offer-type">How would you like to help?</Label>
                  <select
                    id="offer-type"
                    value={offerType}
                    onChange={(e) => setOfferType(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {OFFER_TYPES.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="offer-name">Name</Label>
                    <Input id="offer-name" required value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="offer-email">Email</Label>
                    <Input id="offer-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="offer-details">Tell us more</Label>
                  <Textarea id="offer-details" value={details} onChange={(e) => setDetails(e.target.value)} maxLength={2000} rows={4} className="mt-1.5" placeholder="What can you offer, and when?" />
                </div>
                {error && <p role="alert" className="text-sm text-crimson">{error}</p>}
                <Button type="submit" variant="donate" disabled={busy}>
                  {busy ? "Sending…" : "Submit my offer"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
