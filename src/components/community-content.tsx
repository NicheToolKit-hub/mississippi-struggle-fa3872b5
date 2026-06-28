import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ExternalLink, FileText, Plus, Users } from "lucide-react";
import { listPublicContent } from "@/lib/cms.functions";
import type { CmsContentType } from "@/lib/cms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Renders the APPROVED community-submitted CMS items of a single content type.
 * Used on the Resources and Bills & Laws pages to surface supporter
 * contributions alongside the curated, editorial content. Pending and rejected
 * items never reach this component (the server function filters to `approved`).
 */
export function CommunityContentSection({
  contentType,
  title,
  description,
  ctaLabel,
}: {
  contentType: CmsContentType;
  title: string;
  description: string;
  ctaLabel: string;
}) {
  const listFn = useServerFn(listPublicContent);
  const { data, isLoading } = useQuery({
    queryKey: ["public-content", contentType],
    queryFn: () => listFn({ data: { contentType } }),
  });
  const items = data?.items ?? [];

  return (
    <section className="mt-14 border-t border-border pt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5 text-gold" aria-hidden="true" />
            <h2 className="text-2xl">{title}</h2>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/contribute">
            <Plus className="h-4 w-4" /> {ctaLabel}
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading community contributions…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No community-submitted items yet.{" "}
          <Link to="/contribute" className="text-primary underline hover:text-gold">
            Be the first to contribute.
          </Link>
        </p>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it: any) => (
            <Card key={it.id} className="flex flex-col shadow-[var(--shadow-card)]">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  {it.category && <Badge variant="secondary">{it.category}</Badge>}
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                    Community
                  </Badge>
                </div>
                <h3 className="mt-3 text-lg font-semibold">{it.title}</h3>
                <p className="mt-1.5 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {it.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-3 text-sm">
                  {it.externalUrl && (
                    <a
                      href={it.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-gold"
                    >
                      <ExternalLink className="h-4 w-4" /> Open link
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
  );
}
