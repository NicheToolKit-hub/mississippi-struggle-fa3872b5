import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, PenLine, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedCounter } from "@/components/animated-counter";

export const Route = createFileRoute("/petitions")({
  head: () => ({
    meta: [
      { title: "Sign the Petition | Mississippi Struggle" },
      {
        name: "description",
        content:
          "Add your name to demand prison reform in Mississippi. Join thousands of residents calling on the Legislature to invest in people, not prisons.",
      },
      { property: "og:title", content: "Sign the Petition | Mississippi Struggle" },
      {
        property: "og:description",
        content: "Add your name to demand prison reform in Mississippi.",
      },
    ],
  }),
  component: PetitionsPage,
});

const GOAL = 10000;
const BASE_SIGNATURES = 8432;

/** Illustrative recent signees for the scrolling ticker. */
const recentSignees = [
  "Marcus T. — Jackson",
  "Latoya W. — Hattiesburg",
  "James R. — Biloxi",
  "Denise K. — Greenville",
  "Anthony P. — Tupelo",
  "Sandra M. — Meridian",
  "Carlos D. — Gulfport",
  "Brenda L. — Oxford",
  "Reginald S. — Vicksburg",
  "Patrice N. — Columbus",
];

function PetitionsPage() {
  const [signatures, setSignatures] = useState(BASE_SIGNATURES);
  const [signed, setSigned] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", zip: "", comment: "" });
  const [error, setError] = useState("");

  const pct = Math.min(Math.round((signatures / GOAL) * 100), 100);

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

    setSignatures((s) => s + 1);
    setSigned(true);
  }

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
                <p>
                  To the Honorable Members of the Mississippi Legislature:
                </p>
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
                    Thank you, <strong>{form.name}</strong>! Your signature has been added.
                    Share this petition with friends and family to amplify our voice.
                    <span className="mt-1 block text-muted-foreground">
                      (Demo only — no data was stored. Connect Lovable Cloud to persist signatures.)
                    </span>
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

                  <Button type="submit" variant="donate" size="lg" className="w-full">
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

        {/* Live counter + ticker */}
        <aside className="space-y-6">
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-7">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-4xl font-bold text-primary">
                  <AnimatedCounter value={signatures} />
                </span>
                <span className="text-sm text-muted-foreground">of {GOAL.toLocaleString()} goal</span>
              </div>
              <div
                className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={signatures}
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
                <strong className="text-foreground">{pct}%</strong> of the way there — every signature counts.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-[var(--shadow-card)]">
            <CardContent className="p-7 pb-4">
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <Users className="h-4 w-4 text-primary" aria-hidden="true" /> Recent signees
              </h3>
            </CardContent>
            <div className="relative overflow-hidden border-t border-border py-4" aria-hidden="true">
              <div className="ticker-track flex w-max gap-3 whitespace-nowrap px-7">
                {[...recentSignees, ...recentSignees].map((name, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
