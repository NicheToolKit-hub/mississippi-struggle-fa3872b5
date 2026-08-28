import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Building2, MapPin, Users, ShieldCheck, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findFacility, FACILITY_TYPE_LABEL } from "@/lib/prisons";

export const Route = createFileRoute("/prisons_/$slug")({
  loader: ({ params }) => {
    const facility = findFacility(params.slug);
    if (!facility) throw notFound();
    return { facility };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Facility not found | Mississippi Struggle" }, { name: "robots", content: "noindex" }],
      };
    }
    const f = loaderData.facility;
    const title = `${f.name} | Mississippi Prison Profile`;
    const description = f.summary.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: FacilityNotFound,
  component: FacilityProfile,
});

function FacilityNotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl">Facility not found</h1>
      <p className="mt-3 text-muted-foreground">
        We don't have a profile for that facility yet.
      </p>
      <Button asChild className="mt-6">
        <Link to="/prisons">Back to the prison map</Link>
      </Button>
    </div>
  );
}

function FacilityProfile() {
  const { facility } = Route.useLoaderData();

  const stats = [
    { icon: Building2, label: "Operator", value: facility.operator },
    { icon: ShieldCheck, label: "Security level", value: facility.security },
    facility.capacity
      ? { icon: Users, label: "Capacity", value: facility.capacity.toLocaleString() }
      : null,
    facility.opened ? { icon: CalendarDays, label: "Opened", value: String(facility.opened) } : null,
  ].filter(Boolean) as { icon: typeof Building2; label: string; value: string }[];

  return (
    <>
      <PageHeader
        eyebrow={FACILITY_TYPE_LABEL[facility.type]}
        title={facility.name}
        description={`${facility.city}, ${facility.county} County, Mississippi`}
      />

      <section className="container-page py-12">
        <Button asChild variant="ghost" size="sm" className="mb-8">
          <Link to="/prisons">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the prison map
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>About this facility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">{facility.summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What's going on inside</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {facility.updates.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No tracked updates yet for this facility.
                  </p>
                )}
                {facility.updates.map((u) => (
                  <div key={u.label} className="border-l-2 border-gold pl-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                      {u.label}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{u.text}</p>
                  </div>
                ))}
                <p className="pt-2 text-xs text-muted-foreground">
                  Updates are community-tracked and editorial — not official MDOC statements.
                </p>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Facility details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-gold" aria-hidden="true" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Location</p>
                    <p className="text-sm">
                      {facility.city}, {facility.county} County
                    </p>
                  </div>
                </div>
                {stats.map((s) => (
                  <div key={s.label} className="flex items-start gap-3">
                    <s.icon className="mt-0.5 h-4 w-4 text-gold" aria-hidden="true" />
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        {s.label}
                      </p>
                      <p className="text-sm">{s.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Know something we don't?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Share conditions, programs, or news from this facility. Every submission is
                  reviewed before it's published.
                </p>
                <Button asChild variant="donate" size="sm" className="w-full">
                  <Link to="/submit">Submit an update</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}
