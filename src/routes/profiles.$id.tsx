import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Palette, Award, Sparkles } from "lucide-react";
import { getProfile } from "@/lib/public.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profiles/$id")({
  loader: async ({ params }) => {
    const res = await getProfile({ data: { id: params.id } });
    if (!res.profile) throw notFound();
    return res;
  },
  head: ({ loaderData }) => {
    const name = loaderData?.profile?.name ?? "Profile";
    return {
      meta: [
        { title: `${name} | Voices Inside — Mississippi Struggle` },
        { name: "description", content: `Accomplishments, art, and writing by ${name}.` },
        { property: "og:title", content: `${name} | Mississippi Struggle` },
        { property: "og:description", content: `Honoring the work and character of ${name}.` },
        ...(loaderData?.profile?.photoUrl
          ? [
              { property: "og:image", content: loaderData.profile.photoUrl },
              { name: "twitter:image", content: loaderData.profile.photoUrl },
            ]
          : []),
      ],
    };
  },
  component: ProfileDetail,
  errorComponent: () => (
    <div className="container-page py-24 text-center text-muted-foreground">
      We couldn't load this profile.
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl">Profile not found</h1>
      <Button asChild className="mt-6" variant="outline">
        <Link to="/profiles">Back to profiles</Link>
      </Button>
    </div>
  ),
});

const KIND_META: Record<string, { label: string; icon: typeof BookOpen }> = {
  book: { label: "Book authored", icon: BookOpen },
  art: { label: "Artwork", icon: Palette },
  certificate: { label: "Certificate", icon: Award },
  accomplishment: { label: "Accomplishment", icon: Sparkles },
};

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

type Item = {
  id: string;
  kind: string;
  title: string;
  description: string | null;
  year: number | null;
  mediaUrl: string | null;
};

function ProfileDetail() {
  const { profile, items } = Route.useLoaderData() as {
    profile: { id: string; name: string; facility: string | null; bio: string | null; photoUrl: string | null };
    items: Item[];
  };

  const gallery = items.filter((i) => i.kind === "art" || i.kind === "certificate");
  const written = items.filter((i) => i.kind === "book" || i.kind === "accomplishment");

  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="container-page py-12 md:py-16">
          <Link to="/profiles" className="inline-flex items-center gap-1 text-sm text-primary-foreground/70 hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> All profiles
          </Link>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center">
            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-primary-foreground/10">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={`Portrait of ${profile.name}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-gold">
                  {initials(profile.name)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl">{profile.name}</h1>
              {profile.facility && <p className="mt-1 text-primary-foreground/75">{profile.facility}</p>}
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          {profile.bio && (
            <section>
              <h2 className="text-2xl">About</h2>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-muted-foreground">{profile.bio}</p>
            </section>
          )}

          {written.length > 0 && (
            <section>
              <h2 className="text-2xl">Accomplishments & writing</h2>
              <div className="mt-4 space-y-4">
                {written.map((i) => {
                  const meta = KIND_META[i.kind] ?? KIND_META.accomplishment;
                  return (
                    <Card key={i.id} className="shadow-[var(--shadow-card)]">
                      <CardContent className="flex gap-4 p-5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                          <meta.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {meta.label}{i.year ? ` · ${i.year}` : ""}
                          </p>
                          <h3 className="mt-0.5 font-semibold">{i.title}</h3>
                          {i.description && <p className="mt-1 text-sm text-muted-foreground">{i.description}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {items.length === 0 && !profile.bio && (
            <p className="text-muted-foreground">More about this person is coming soon.</p>
          )}
        </div>

        <aside>
          {gallery.length > 0 && (
            <section>
              <h2 className="text-2xl">Art & certificates</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {gallery.map((i) => (
                  <figure key={i.id} className="overflow-hidden rounded-lg border border-border bg-card">
                    {i.mediaUrl ? (
                      <img src={i.mediaUrl} alt={i.title} loading="lazy" className="aspect-square w-full object-cover" />
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-secondary text-muted-foreground">
                        {(KIND_META[i.kind] ?? KIND_META.accomplishment).label}
                      </div>
                    )}
                    <figcaption className="p-2 text-xs text-muted-foreground">{i.title}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          <Card className="mt-8 bg-secondary">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg">Know someone worth honoring?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Share their accomplishments, art, or writing. Every submission is reviewed before publishing.
              </p>
              <Button asChild className="mt-4" variant="donate">
                <Link to="/submit">Submit to our team</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
