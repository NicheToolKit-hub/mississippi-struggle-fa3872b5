import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MapPin, ArrowRight, Building2, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PrisonMap, MapLegend } from "@/components/prison-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { facilities, searchFacilities, FACILITY_TYPE_LABEL, type Facility } from "@/lib/prisons";

export const Route = createFileRoute("/prisons")({
  head: () => ({
    meta: [
      { title: "Mississippi Prison Map | Facility Directory" },
      {
        name: "description",
        content:
          "Interactive map of Mississippi's state, private, federal, and county regional prisons — search each facility and see what's happening inside.",
      },
      { property: "og:title", content: "Mississippi Prison Map | Facility Directory" },
      {
        property: "og:description",
        content:
          "Search every Mississippi correctional facility, see its location, operator, and the conditions our coalition is tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://mississippi-struggle.lovable.app/prisons" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://mississippi-struggle.lovable.app/prisons" }],
  }),
  component: PrisonsPage,
  errorComponent: () => (
    <div className="container-page py-24 text-center text-muted-foreground">
      We couldn't load the prison map. Please refresh.
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center text-muted-foreground">Page not found.</div>
  ),
});

function PrisonsPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Facility | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const results = useMemo(() => searchFacilities(query), [query]);

  function openFacility(f: Facility) {
    setSelected(f);
    setDrawerOpen(true);
  }

  return (
    <>
      <PageHeader
        eyebrow="Facility directory"
        title="Mississippi prison map"
        description="Every state prison, private contract facility, federal institution, and county regional facility in Mississippi. Tap a marker or search the directory to see who runs it, who's held there, and what our coalition is tracking."
      >
        <Button variant="donate" size="lg" onClick={() => setDrawerOpen(true)}>
          <Search className="h-4 w-4" aria-hidden="true" />
          Search facilities
        </Button>
      </PageHeader>

      <section className="container-page py-12" aria-labelledby="map-heading">
        <h2 id="map-heading" className="sr-only">
          Interactive facility map
        </h2>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-4 sm:p-6">
              <div className="mx-auto max-h-[70vh] w-full max-w-md">
                <PrisonMap
                  facilities={results}
                  selectedSlug={selected?.slug ?? null}
                  onSelect={openFacility}
                />
              </div>
              <MapLegend className="mt-5 justify-center" />
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Marker positions are approximate town-level locations. Select a marker to open its
                profile.
              </p>
            </CardContent>
          </Card>

          {/* Inline directory (also available in the pull-out drawer on small screens) */}
          <div className="hidden lg:block">
            <FacilityList
              query={query}
              setQuery={setQuery}
              results={results}
              onSelect={openFacility}
              selectedSlug={selected?.slug ?? null}
            />
          </div>

          <div className="lg:hidden">
            <Button variant="outline" size="lg" className="w-full" onClick={() => setDrawerOpen(true)}>
              <Search className="h-4 w-4" aria-hidden="true" />
              Open facility directory ({facilities.length})
            </Button>
          </div>
        </div>
      </section>

      {/* Pull-out drawer: search + selected facility snapshot */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Facility directory</SheetTitle>
            <SheetDescription>
              Search Mississippi correctional facilities by name, city, county, or operator.
            </SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-6 rounded-lg border border-border bg-secondary p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                    {FACILITY_TYPE_LABEL[selected.type]}
                  </p>
                  <h3 className="mt-1 text-lg leading-snug">{selected.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {selected.city}, {selected.county} County
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Clear selected facility"
                  className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selected.summary}</p>
              <Button asChild variant="default" size="sm" className="mt-4">
                <Link to="/prisons/$slug" params={{ slug: selected.slug }} onClick={() => setDrawerOpen(false)}>
                  View facility profile <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-6">
            <FacilityList
              query={query}
              setQuery={setQuery}
              results={results}
              onSelect={(f) => setSelected(f)}
              selectedSlug={selected?.slug ?? null}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

interface ListProps {
  query: string;
  setQuery: (v: string) => void;
  results: Facility[];
  onSelect: (f: Facility) => void;
  selectedSlug: string | null;
}

/** Searchable facility list shared by the sidebar and the pull-out drawer. */
function FacilityList({ query, setQuery, results, onSelect, selectedSlug }: ListProps) {
  return (
    <div>
      <label htmlFor="facility-search" className="sr-only">
        Search facilities
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="facility-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, city, or county…"
          className="pl-9"
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground" role="status">
        {results.length} of {facilities.length} facilities
      </p>
      <ul className="mt-3 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
        {results.map((f) => (
          <li key={f.slug}>
            <button
              onClick={() => onSelect(f)}
              aria-current={f.slug === selectedSlug ? "true" : undefined}
              className={
                "w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent " +
                (f.slug === selectedSlug ? "border-gold bg-accent" : "border-border bg-card")
              }
            >
              <span className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{f.shortName}</span>
                  <span className="block text-xs text-muted-foreground">
                    {f.city}, {f.county} County · {FACILITY_TYPE_LABEL[f.type]}
                  </span>
                </span>
              </span>
            </button>
          </li>
        ))}
        {results.length === 0 && (
          <li className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
            No facilities match “{query}”.
          </li>
        )}
      </ul>
    </div>
  );
}
