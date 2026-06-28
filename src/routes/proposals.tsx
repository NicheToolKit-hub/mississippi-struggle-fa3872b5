import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, ExternalLink, FileText, Plus } from "lucide-react";
import { listPublicContent } from "@/lib/cms.functions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/proposals")({
  head: () => ({
    meta: [
      { title: "Community Proposals | Mississippi Struggle" },
      {
        name: "description",
        content:
          "Community-driven proposals and initiatives for prison reform in Mississippi — ideas and campaigns suggested by supporters and approved by our team.",
      },
      { property: "og:title", content: "Community Proposals | Mississippi Struggle" },
      {
        property: "og:description",
        content: "Ideas, campaigns, and initiatives proposed by our community.",
      },
    ],
  }),
  component: ProposalsPage,
});

function ProposalsPage() {
  const listFn = useServerFn(listPublicContent);
  const { data, isLoading } = useQuery({
    queryKey: ["public-content", "proposal"],
    queryFn: () => listFn({ data: { contentType: "proposal" } }),
  });
  const items = data?.items ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Community Proposals & Initiatives"
        title="Ideas that move the movement"
        description="Proposals and initiatives suggested by our supporters and reviewed by our team. Have an idea of your own? Sign in and contribute it."
      />

      <section className="container-page py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" role="status">
            {isLoading ? "Loading…" : `${items.length} community proposal${items.length === 1 ? "" : "s"}`}
          </p>
          <Button asChild variant="donate">
            <Link to="/contribute">
              <Plus className="h-4 w-4" /> Submit a proposal
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <p className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
            Loading proposals…
          </p>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <Lightbulb className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 text-muted-foreground">
              No community proposals have been published yet.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/contribute">Be the first to contribute</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((it: any) => (
              <Card key={it.id} className="flex flex-col shadow-[var(--shadow-card)]">
                <CardContent className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                      <Lightbulb className="h-5 w-5" aria-hidden="true" />
                    </div>
                    {it.category && <Badge variant="secondary">{it.category}</Badge>}
                  </div>
                  <h2 className="mt-4 text-xl">{it.title}</h2>
                  <p className="mt-2 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {it.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-4 border-t border-border pt-4 text-sm">
                    {it.externalUrl && (
                      <a
                        href={it.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-gold"
                      >
                        <ExternalLink className="h-4 w-4" /> Learn more
                      </a>
                    )}
                    {it.attachmentUrl && (
                      <a
                        href={it.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-gold"
                      >
                        <FileText className="h-4 w-4" /> Attachment
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
