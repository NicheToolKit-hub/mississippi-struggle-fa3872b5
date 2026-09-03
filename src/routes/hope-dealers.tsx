import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  LifeBuoy,
  Mail,
  MessageSquare,
  Users,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/hope-dealers")({
  head: () => ({
    meta: [
      { title: "Hope Dealers — Mentorship | Mississippi Struggle" },
      {
        name: "description",
        content:
          "Hope Dealers pairs people inside, returning citizens, and families with mentors who have walked the path. See eligibility, how matching works, and request a mentor.",
      },
      { property: "og:title", content: "Hope Dealers — Mentorship | Mississippi Struggle" },
      {
        property: "og:description",
        content:
          "Peer mentorship for incarcerated people, returning citizens, and their families across Mississippi.",
      },
      { property: "og:url", content: "https://mississippi-struggle.lovable.app/hope-dealers" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://mississippi-struggle.lovable.app/hope-dealers" }],
  }),
  component: HopeDealersPage,
});

/** Who we can pair with a mentor today. */
const mentees = [
  "People returning home within 12 months of release",
  "Returning citizens in their first three years post-release",
  "Family members supporting an incarcerated loved one",
  "Youth (16–24) with a parent or sibling who is incarcerated",
  "People navigating parole, probation, or expungement for the first time",
];

/** What we look for in a Hope Dealer (mentor). */
const mentorCriteria = [
  "18 or older and living in — or serving — Mississippi",
  "Lived experience of incarceration, re-entry, or supporting a loved one inside",
  "At least 12 months of stability since release (housing, work, recovery, or school)",
  "Able to commit two contacts a month for six months (call, visit, letter, or video)",
  "Willing to complete our orientation, confidentiality agreement, and reference check",
  "No active supervision conflict that would prohibit facility contact",
];

/** Matching pipeline. */
const steps = [
  {
    icon: MessageSquare,
    title: "1. Tell us your story",
    text: "Send a short request through our contact form — who you are, where you are in the process, and what kind of support you need.",
  },
  {
    icon: UserCheck,
    title: "2. Intake conversation",
    text: "A coordinator calls or writes within 5–7 days to confirm eligibility, goals, and the best way to reach you (including facility mail).",
  },
  {
    icon: Users,
    title: "3. The match",
    text: "We pair you with a Hope Dealer based on region, lived experience, faith preference, and the goals you named. You can request a different match at any time.",
  },
  {
    icon: HeartHandshake,
    title: "4. Six months of walking together",
    text: "Two contacts a month minimum, plus check-ins from our team. Many pairs keep going long after the formal period ends.",
  },
];

function HopeDealersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Hope Dealers"
        title="Mentors and peer support from those who've walked the path"
        description="Nobody should navigate incarceration or re-entry alone. Hope Dealers pairs you with someone who has been there — and made it through."
      />

      {/* Intro + primary CTA */}
      <section className="container-page py-14">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary">
                <LifeBuoy className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-2xl">What a Hope Dealer does</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                A Hope Dealer is a volunteer mentor — most of them formerly incarcerated —
                who shows up consistently. They answer letters, take the call, sit with you
                through a parole packet, help you find the right legal aid or housing lead,
                and remind you that your record is not your ceiling. They are not lawyers,
                caseworkers, or counselors, and they never charge a dime.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="donate" size="lg">
                  <Link to="/contact">
                    Request a mentor <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/contact">Become a Hope Dealer</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold/40 bg-gold/10">
            <CardContent className="p-7">
              <h2 className="text-xl">Talk to us directly</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Prefer email or phone? Either reaches the same intake team.
              </p>
              <ul className="mt-5 space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <a
                    href="mailto:Mississippi.Struggle@gmail.com"
                    className="font-semibold text-foreground hover:text-gold break-all"
                  >
                    Mississippi.Struggle@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <a href="tel:+16015550199" className="font-semibold text-foreground hover:text-gold">
                    Intake line — (601) 555-0199
                  </a>
                </li>
              </ul>
              <p className="mt-5 text-xs text-muted-foreground">
                Writing from inside? Mail requests are welcome — ask a family member to submit
                the contact form on your behalf and we will write back.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Eligibility */}
      <section className="bg-secondary py-16" aria-labelledby="eligibility-heading">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-7">
              <h2 id="eligibility-heading" className="text-xl">Who can be matched</h2>
              <ul className="mt-5 space-y-3">
                {mentees.map((m) => (
                  <li key={m} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-7">
              <h2 className="text-xl">Mentor eligibility</h2>
              <ul className="mt-5 space-y-3">
                {mentorCriteria.map((m) => (
                  <li key={m} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-muted-foreground">
                A felony conviction is never a disqualifier — it is often exactly the
                experience a mentee needs.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How matching works */}
      <section className="container-page py-16" aria-labelledby="match-heading">
        <h2 id="match-heading" className="text-2xl md:text-3xl">How to get matched</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Four steps, roughly two weeks from first message to first conversation.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <Card key={s.title} className="shadow-[var(--shadow-card)]">
              <CardContent className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                  <s.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Partner programs */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-6">
              <h3 className="text-lg">Study and Struggle</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Political education and mutual aid organized with people inside.
              </p>
              <a
                href="https://www.studyandstruggle.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-gold"
              >
                Visit Study and Struggle
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </CardContent>
          </Card>
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-6">
              <h3 className="text-lg">More support near you</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Legal aid, housing, and re-entry programs across the state.
              </p>
              <Link
                to="/resources"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-gold"
              >
                Browse the resource directory
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-page flex flex-col items-center gap-6 py-16 text-center">
          <h2 className="max-w-2xl text-2xl md:text-4xl">
            Somebody dealt you hope once. Pass it on.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="donate" size="xl">
              <Link to="/contact">Request or offer mentorship</Link>
            </Button>
            <Button asChild variant="hero" size="xl">
              <Link to="/donate">Support the program</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
