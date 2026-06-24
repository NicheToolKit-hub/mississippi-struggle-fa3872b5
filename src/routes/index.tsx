import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Scale, Users, Megaphone } from "lucide-react";
import heroAsset from "@/assets/hero-lady-justice.png.asset.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/animated-counter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mississippi Struggle | Justice & Prison Reform" },
      {
        name: "description",
        content:
          "Mississippi has one of the highest incarceration rates in the world. Join the struggle for a fairer justice system — sign the petition and get involved.",
      },
      { property: "og:title", content: "Mississippi Struggle | Justice & Prison Reform" },
      {
        property: "og:description",
        content: "Join the movement for justice and prison reform in Mississippi.",
      },
    ],
  }),
  component: HomePage,
});

/** Illustrative statistics. Replace with live data from a backend later. */
const metrics = [
  { value: 19000, suffix: "+", label: "People incarcerated in MS prisons" },
  { value: 575, suffix: "/100k", label: "Imprisonment rate — among the world's highest" },
  { value: 36, suffix: "%", label: "Three-year recidivism rate statewide" },
  { value: 12450, suffix: "+", label: "Lives reached through our programs" },
];

const pillars = [
  {
    icon: Scale,
    title: "Legislative Reform",
    text: "We track bills, mobilize constituents, and push for humane sentencing and parole policy.",
    to: "/bills" as const,
  },
  {
    icon: FileText,
    title: "Education & Rights",
    text: "Know-your-rights resources for incarcerated people and the families who love them.",
    to: "/education" as const,
  },
  {
    icon: Users,
    title: "Re-entry Support",
    text: "Connecting returning citizens to housing, jobs, legal aid, and community.",
    to: "/resources" as const,
  },
];

/** Illustrative recent updates. Replace with a CMS / database query later. */
const news = [
  {
    tag: "Legislation",
    date: "June 12, 2026",
    title: "Parole Reform Bill HB 1024 advances out of committee",
    excerpt:
      "A bipartisan effort to expand parole eligibility for non-violent offenders cleared its first major hurdle this week.",
  },
  {
    tag: "Press Release",
    date: "May 28, 2026",
    title: "Coalition delivers 8,400 signatures to the State Capitol",
    excerpt:
      "Advocates and families gathered in Jackson to demand investment in re-entry programs over new prison construction.",
  },
  {
    tag: "Community",
    date: "May 9, 2026",
    title: "Hope Dealers expand mentorship to three new counties",
    excerpt:
      "Our volunteer network of formerly incarcerated mentors is now active in the Delta region.",
  },
];

function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroAsset.url}
          alt="Lady Justice — Mississippi Struggle"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(to top, oklch(0.18 0.05 258 / 0.75) 0%, oklch(0.18 0.05 258 / 0.25) 40%, oklch(0.18 0.05 258 / 0) 70%)",
          }}
          aria-hidden="true"
        />
        <div className="container-page flex min-h-[78vh] flex-col justify-end pb-16 pt-20 text-primary-foreground">
            <Button asChild variant="donate" size="xl">
              <Link to="/petitions">
                Sign the Petition <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="hero" size="xl">
              <Link to="/resources">Get Involved</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Impact metrics */}
      <section className="border-b border-border bg-secondary" aria-labelledby="impact-heading">
        <div className="container-page py-16">
          <h2 id="impact-heading" className="text-center text-2xl md:text-3xl">
            The scale of the crisis
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Behind every statistic is a person, a family, and a community fighting to be whole.
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metrics.map((m) => (
              <Card key={m.label} className="text-center shadow-[var(--shadow-card)]">
                <CardContent className="p-6">
                  <dd className="font-display text-3xl font-bold text-primary md:text-4xl">
                    <AnimatedCounter value={m.value} suffix={m.suffix} />
                  </dd>
                  <dt className="mt-2 text-sm text-muted-foreground">{m.label}</dt>
                </CardContent>
              </Card>
            ))}
          </dl>
        </div>
      </section>

      {/* Pillars */}
      <section className="container-page py-16" aria-labelledby="pillars-heading">
        <h2 id="pillars-heading" className="text-2xl md:text-3xl">How we fight</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <Card key={p.title} className="group shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
              <CardContent className="p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary">
                  <p.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                <Link
                  to={p.to}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-gold"
                >
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Latest news */}
      <section className="bg-secondary py-16" aria-labelledby="news-heading">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="news-heading" className="text-2xl md:text-3xl">Latest updates</h2>
              <p className="mt-2 text-muted-foreground">News, press releases, and stories from the movement.</p>
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {news.map((post) => (
              <Card key={post.title} className="flex flex-col overflow-hidden shadow-[var(--shadow-card)]">
                <div className="h-1.5 bg-gold" aria-hidden="true" />
                <CardContent className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="rounded-full bg-accent px-2.5 py-0.5 font-medium text-accent-foreground">
                      {post.tag}
                    </span>
                    <time className="text-muted-foreground">{post.date}</time>
                  </div>
                  <h3 className="mt-4 text-lg leading-snug">{post.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Read more <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-page flex flex-col items-center gap-6 py-16 text-center">
          <h2 className="max-w-2xl text-2xl md:text-4xl">
            Your voice can change a life. Your gift can change the law.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="donate" size="xl">
              <Link to="/donate">Donate Now</Link>
            </Button>
            <Button asChild variant="hero" size="xl">
              <Link to="/petitions">Sign the Petition</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
