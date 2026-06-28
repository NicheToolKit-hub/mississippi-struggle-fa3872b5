import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ExternalLink, Megaphone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CommunityContentSection } from "@/components/community-content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bills")({
  head: () => ({
    meta: [
      { title: "Bills & Laws | Mississippi Struggle" },
      {
        name: "description",
        content:
          "Track active, proposed, and passed criminal-justice bills in the Mississippi Legislature. Search, filter, and take action to contact your representative.",
      },
      { property: "og:title", content: "Bills & Laws | Mississippi Struggle" },
      {
        property: "og:description",
        content: "A searchable tracker of prison reform legislation in Mississippi.",
      },
    ],
  }),
  component: BillsPage,
});

const STAGES = ["Introduced", "Committee", "Voting", "Signed"] as const;
type Stage = (typeof STAGES)[number];

interface Bill {
  id: string;
  title: string;
  summary: string;
  stage: Stage;
  category: string;
  position: "Support" | "Oppose" | "Watching";
}

/** Illustrative legislation data. Swap for a live legislature API later. */
const bills: Bill[] = [
  {
    id: "HB 1024",
    title: "Parole Eligibility Expansion Act",
    summary: "Expands parole eligibility for non-violent offenders after serving 25% of their sentence.",
    stage: "Committee",
    category: "Sentencing",
    position: "Support",
  },
  {
    id: "SB 2156",
    title: "Juvenile Justice Reform Act",
    summary: "Raises the minimum age of juvenile prosecution and limits solitary confinement for minors.",
    stage: "Voting",
    category: "Juvenile",
    position: "Support",
  },
  {
    id: "HB 0487",
    title: "Criminal Record Expungement Modernization",
    summary: "Streamlines expungement for first-time non-violent felonies and waives filing fees for indigent applicants.",
    stage: "Signed",
    category: "Re-entry",
    position: "Support",
  },
  {
    id: "SB 2390",
    title: "Mandatory Minimum Sentencing Act",
    summary: "Establishes new mandatory minimum sentences for several drug offenses.",
    stage: "Introduced",
    category: "Sentencing",
    position: "Oppose",
  },
  {
    id: "HB 1190",
    title: "Prison Healthcare Standards Act",
    summary: "Sets enforceable standards for medical and mental-health care in state correctional facilities.",
    stage: "Committee",
    category: "Conditions",
    position: "Support",
  },
  {
    id: "SB 2701",
    title: "Bail Reform & Pretrial Fairness Act",
    summary: "Limits cash bail for misdemeanors and creates a pretrial risk-assessment process.",
    stage: "Introduced",
    category: "Pretrial",
    position: "Watching",
  },
];

const positionStyles: Record<Bill["position"], string> = {
  Support: "bg-success/15 text-success",
  Oppose: "bg-crimson/15 text-crimson",
  Watching: "bg-muted text-muted-foreground",
};

function StageBar({ stage }: { stage: Stage }) {
  const currentIndex = STAGES.indexOf(stage);
  return (
    <div className="mt-4" aria-label={`Status: ${stage}`}>
      <div className="flex items-center gap-1.5">
        {STAGES.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col gap-1.5">
            <div
              className={cn(
                "h-1.5 rounded-full",
                i <= currentIndex ? "bg-gold" : "bg-muted",
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-wide sm:text-[11px]",
                i === currentIndex
                  ? "text-foreground"
                  : i < currentIndex
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60",
              )}
            >
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BillsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | Stage>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bills.filter((b) => {
      const matchesStage = filter === "All" || b.stage === filter;
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q);
      return matchesStage && matchesQuery;
    });
  }, [query, filter]);

  return (
    <>
      <PageHeader
        eyebrow="Proposed Bills & Laws"
        title="Legislation tracker"
        description="Follow the criminal-justice bills moving through the Mississippi Legislature — and make your voice heard before the vote."
      />

      <section className="container-page py-12">
        {/* Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <label htmlFor="bill-search" className="sr-only">Search bills</label>
            <Input
              id="bill-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, number, or topic"
              className="pl-9"
            />
          </div>

          <div role="group" aria-label="Filter by stage" className="flex flex-wrap gap-2">
            {(["All", ...STAGES] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={filter === s}
                onClick={() => setFilter(s)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  filter === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground" role="status">
          Showing {filtered.length} of {bills.length} bills
        </p>

        {/* Bill list */}
        <div className="mt-6 grid gap-5">
          {filtered.map((bill) => (
            <Card key={bill.id} className="shadow-[var(--shadow-card)]">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-primary px-2 py-0.5 font-mono text-xs font-semibold text-primary-foreground">
                        {bill.id}
                      </span>
                      <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                        {bill.category}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          positionStyles[bill.position],
                        )}
                      >
                        {bill.position === "Watching" ? "Watching" : `We ${bill.position.toLowerCase()}`}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl">{bill.title}</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {bill.summary}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="crimson"
                    className="shrink-0"
                  >
                    <a
                      href={`https://www.usa.gov/elected-officials`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Take action on ${bill.id}: ${bill.title} — contact your representative`}
                    >
                      <Megaphone className="h-4 w-4" /> Take Action
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
                <StageBar stage={bill.stage} />
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
              No bills match your search. Try a different term or filter.
            </div>
          )}
        </div>

        {/* Community-submitted, admin-approved legislation */}
        <CommunityContentSection
          contentType="legislation"
          title="Community-tracked legislation"
          description="Bills, active laws, and policies suggested by our supporters and approved by our team."
          ctaLabel="Suggest legislation"
        />
      </section>
    </>
  );
}
