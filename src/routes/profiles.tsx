import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, UserRound } from "lucide-react";
import { listProfiles } from "@/lib/public.functions";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profiles")({
  head: () => ({
    meta: [
      { title: "Voices Inside | Mississippi Struggle" },
      {
        name: "description",
        content:
          "Profiles celebrating the accomplishments, art, writing, and exemplary character of incarcerated people in Mississippi.",
      },
      { property: "og:title", content: "Voices Inside | Mississippi Struggle" },
      {
        property: "og:description",
        content: "Accomplishments, art, books, and certificates from people behind the walls.",
      },
      { property: "og:url", content: "https://mississippi-struggle.lovable.app/profiles" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://mississippi-struggle.lovable.app/profiles" }],
  }),
  loader: () => listProfiles(),
  component: ProfilesPage,
  errorComponent: () => (
    <div className="container-page py-24 text-center text-muted-foreground">
      We couldn't load profiles right now. Please try again.
    </div>
  ),
});

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

type ProfileCard = {
  id: string;
  name: string;
  facility: string | null;
  bio: string | null;
  featured: boolean;
  photoUrl: string | null;
};

function ProfilesPage() {
  const { profiles } = Route.useLoaderData() as { profiles: ProfileCard[] };

  return (
    <>
      <PageHeader
        eyebrow="Voices Inside"
        title="The people behind the numbers"
        description="Incarceration does not erase talent, growth, or dignity. These profiles honor the accomplishments, artwork, writing, and exemplary character of people in Mississippi's prisons."
      >
        <Button asChild variant="donate">
          <Link to="/submit">Submit a profile or work</Link>
        </Button>
      </PageHeader>

      <div className="container-page py-16">
        {profiles.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <h2 className="text-xl">No profiles published yet</h2>
              <p className="mt-2 text-muted-foreground">
                Be the first to honor someone's story. All submissions are reviewed before publishing.
              </p>
              <Button asChild className="mt-6" variant="donate">
                <Link to="/submit">Submit a profile</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => (
              <Card key={p.id} className="group flex flex-col overflow-hidden shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
                <div className="relative aspect-[4/3] bg-secondary">
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt={`Portrait of ${p.name}`} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 font-display text-2xl font-bold text-primary">
                        {initials(p.name)}
                      </span>
                    </div>
                  )}
                  {p.featured && (
                    <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-0.5 text-xs font-semibold text-gold-foreground">
                      Featured
                    </span>
                  )}
                </div>
                <CardContent className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                  {p.facility && <p className="text-sm text-muted-foreground">{p.facility}</p>}
                  {p.bio && <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{p.bio}</p>}
                  <Link
                    to="/profiles/$id"
                    params={{ id: p.id }}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-gold"
                  >
                    View profile <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
