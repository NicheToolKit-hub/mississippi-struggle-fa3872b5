import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, PenLine, Users, List, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AnimatedCounter } from "@/components/animated-counter";
import { listSignatures, signPetition } from "@/lib/public.functions";

export const Route = createFileRoute("/petitions")({
  head: () => ({
    meta: [
      { title: "Sign the Petition | Mississippi Struggle" },
      {
        name: "description",
        content:
          "Add your name to demand prison reform in Mississippi. Join residents calling on the Legislature to invest in people, not prisons.",
      },
      { property: "og:title", content: "Sign the Petition | Mississippi Struggle" },
      {
        property: "og:description",
        content: "Add your name to demand prison reform in Mississippi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://mississippi-struggle.lovable.app/petitions" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://mississippi-struggle.lovable.app/petitions" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(signaturesQuery),
  component: PetitionsPage,
});

const GOAL = 10000;

const signaturesQuery = queryOptions({
  queryKey: ["petition-signatures"],
  queryFn: () => listSignatures(),
});

function PetitionsPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery(signaturesQuery);
  const signatures = data?.signatures ?? [];
  const total = data?.total ?? 0;

  const [signed, setSigned] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", zip: "", comment: "" });
  const [error, setError] = useState("");

  const sign = useMutation({
    mutationFn: (input: { name: string; email: string; zip: string; comment: string }) =>
      signPetition({ data: { ...input, comment: input.comment || null } }),
    onSuccess: () => {
      setSigned(true);
      queryClient.invalidateQueries({ queryKey: ["petition-signatures"] });
    },
    onError: (e: Error) => setError(e.message || "Something went wrong. Please try again."),
  });

  const pct = Math.min(Math.round((total / GOAL) * 100), 100);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.zip.trim()) {
      setError("Please complete your name, email, and ZIP code.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    // Mississippi ZIP codes fall in the 386xx–397xx range.
    const zipNum = Number(form.zip);
    if (!/^\d{5}$/.test(form.zip) || zipNum < 38600 || zipNum > 39799) {
      setError("Please enter a valid Mississippi ZIP code to verify residency.");
      return;
    }

    sign.mutate(form);
  }

  /** Slide-out panel listing every signature, with the live total on top. */
  const signatureDrawer = (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <List className="h-4 w-4" aria-hidden="true" />
          View all signatures
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-4xl font-extrabold text-primary">
            <span className="animate-pulse">
              <AnimatedCounter value={total} />
            </span>
          </SheetTitle>
          <SheetDescription>
            signatures and counting — every name is a demand for reform.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="-mx-6 mt-4 flex-1 px-6">
          <ul className="space-y-3 pb-8">
            {signatures.length === 0 && (
              <li className="text-sm text-muted-foreground">
                No signatures yet — be the first to sign.
              </li>
            )}
            {signatures.map((s) => (
              <li key={s.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">ZIP {s.zip}</p>
                {s.comment && <p className="mt-2 text-sm leading-relaxed">"{s.comment}"</p>}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <PageHeader
        eyebrow="Signatures & Petitions"
        title="Invest in people, not prisons"
        description="Sign our open letter to the Mississippi Legislature demanding humane reform, fair sentencing, and real investment in re-entry."
      />

      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Petition + form */}
        <section aria-labelledby="petition-heading">
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-7">
              <h2 id="petition-heading" className="text-2xl">Our demand</h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>To the Honorable Members of the Mississippi Legislature:</p>
                <p>
                  We, the undersigned residents of Mississippi, call on you to enact
                  meaningful criminal-justice reform. We demand expanded parole
                  eligibility, an end to debtors'-prison practices, enforceable
                  standards for prison healthcare, and reinvestment of corrections
                  savings into education and community re-entry programs.
                </p>
                <p>
                  Our state spends hundreds of millions to incarcerate while
                  communities go without. We can choose a different path — one rooted
                  in dignity, safety, and second chances.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 shadow-[var(--shadow-card)]">
            <CardContent className="p-7">
              <h3 className="flex items-center gap-2 text-xl">
                <PenLine className="h-5 w-5 text-primary" aria-hidden="true" /> Add your signature
              </h3>

              {signed ? (
                <div
                  role="status"
                  className="mt-5 flex items-start gap-3 rounded-lg bg-success/10 p-5 text-sm"
                >
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                  <p>
                    Thank you, <strong>{form.name}</strong>! Your signature has been recorded.
                    Share this petition with friends and family to amplify our voice.
                  </p>
                </div>
              ) : (
                <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
                  <div>
                    <Label htmlFor="sig-name">Full name *</Label>
                    <Input
                      id="sig-name"
                      required
                      autoComplete="name"
                      className="mt-1.5"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="sig-email">Email *</Label>
                      <Input
                        id="sig-email"
                        type="email"
                        required
                        autoComplete="email"
                        className="mt-1.5"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sig-zip">Mississippi ZIP code *</Label>
                      <Input
                        id="sig-zip"
                        inputMode="numeric"
                        required
                        autoComplete="postal-code"
                        maxLength={5}
                        placeholder="39201"
                        className="mt-1.5"
                        value={form.zip}
                        onChange={(e) =>
                          setForm({ ...form, zip: e.target.value.replace(/[^0-9]/g, "") })
                        }
                        aria-describedby="zip-help"
                      />
                      <p id="zip-help" className="mt-1 text-xs text-muted-foreground">
                        Used to verify Mississippi residency.
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="sig-comment">Why this matters to you (optional)</Label>
                    <Textarea
                      id="sig-comment"
                      rows={3}
                      className="mt-1.5"
                      maxLength={500}
                      value={form.comment}
                      onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    />
                  </div>

                  {error && (
                    <p role="alert" className="rounded-md bg-crimson/10 px-3 py-2 text-sm text-crimson">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="donate"
                    size="lg"
                    className="w-full"
                    disabled={sign.isPending}
                  >
                    {sign.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    )}
                    Sign the Petition
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    We never sell your information. See our privacy commitment in the footer.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Live counter + signature drawer */}
        <aside className="space-y-6">
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-7">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-5xl font-extrabold text-primary">
                  <span className="animate-pulse">
                    <AnimatedCounter value={total} />
                  </span>
                </span>
                <span className="text-sm text-muted-foreground">
                  of {GOAL.toLocaleString()} goal
                </span>
              </div>
              <div
                className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={total}
                aria-valuemin={0}
                aria-valuemax={GOAL}
                aria-label="Signatures toward goal"
              >
                <div
                  className="h-full rounded-full bg-gold transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                <strong className="text-foreground">{pct}%</strong> of the way there — every
                signature counts.
              </p>
              <div className="mt-5">{signatureDrawer}</div>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-7">
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <Users className="h-4 w-4 text-primary" aria-hidden="true" /> Recent signees
              </h3>
              <ul className="mt-4 space-y-2">
                {signatures.slice(0, 8).map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-full bg-accent px-3 py-1.5 text-sm text-accent-foreground"
                  >
                    <span>{s.name}</span>
                    <span className="text-xs opacity-70">{s.zip}</span>
                  </li>
                ))}
                {signatures.length === 0 && (
                  <li className="text-sm text-muted-foreground">
                    Be the first name on this letter.
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
