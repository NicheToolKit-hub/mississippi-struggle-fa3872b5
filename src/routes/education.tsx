import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Download, GraduationCap, Building2, Gavel, ArrowDown } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/education")({
  head: () => ({
    meta: [
      { title: "Education & Law | Mississippi Struggle" },
      {
        name: "description",
        content:
          "Understand the Mississippi penal system. Know-your-rights resources, downloadable guides, and infographics on the school-to-prison pipeline and recidivism.",
      },
      { property: "og:title", content: "Education & Law | Mississippi Struggle" },
      {
        property: "og:description",
        content: "Resources explaining the Mississippi penal system and your legal rights.",
      },
    ],
  }),
  component: EducationPage,
});

const resources = [
  {
    icon: Building2,
    title: "The MS Penal System Explained",
    text: "A plain-language overview of how arrest, sentencing, incarceration, and parole work in Mississippi.",
  },
  {
    icon: Gavel,
    title: "Sentencing & Parole Guide",
    text: "Mandatory minimums, habitual offender laws, and how parole eligibility is actually calculated.",
  },
  {
    icon: GraduationCap,
    title: "For Families",
    text: "Visitation, commissary, phone access, and how to stay connected with an incarcerated loved one.",
  },
  {
    icon: BookOpen,
    title: "Glossary of Legal Terms",
    text: "Decode the courtroom: arraignment, plea, probation, expungement, and dozens more terms.",
  },
];

const rights = [
  {
    q: "What rights do incarcerated people retain in Mississippi?",
    a: "Incarcerated people retain constitutional protections including freedom from cruel and unusual punishment, the right to adequate medical care, access to the courts, and limited free-speech and religious-exercise rights. They may file grievances and, in many cases, lawsuits over conditions of confinement.",
  },
  {
    q: "Can I be denied medical care while incarcerated?",
    a: "No. The Eighth Amendment requires that facilities provide adequate medical, dental, and mental-health care. Deliberate indifference to a serious medical need can be the basis for a legal claim. Document every request and response in writing.",
  },
  {
    q: "What are my rights during a police stop?",
    a: "You have the right to remain silent and the right to an attorney. You can ask if you are free to leave. You do not have to consent to a search. Stay calm, keep your hands visible, and clearly state that you wish to remain silent and want a lawyer.",
  },
  {
    q: "How does expungement work in Mississippi?",
    a: "Certain misdemeanors and some first-time non-violent felonies may be eligible for expungement after a waiting period. Expungement can remove barriers to housing and employment. Eligibility is fact-specific — consult a legal aid provider listed on our Resources page.",
  },
  {
    q: "What can families do if rights are being violated?",
    a: "Keep detailed records, file a formal grievance with the facility, and contact a legal aid organization or the ACLU of Mississippi. For urgent safety concerns, escalate in writing to the facility administrator and the Mississippi Department of Corrections.",
  },
];

const pipeline = [
  { label: "Exclusionary school discipline", stat: "3.5×", note: "more likely for Black students" },
  { label: "Suspension → contact with police", stat: "2×", note: "higher dropout risk" },
  { label: "Dropout → incarceration", stat: "63%", note: "of inmates lack a diploma" },
  { label: "Release → re-arrest within 3 yrs", stat: "36%", note: "statewide recidivism" },
];

function EducationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Education & Law"
        title="Knowledge is the first step toward justice"
        description="Clear, trustworthy information about the Mississippi penal system, your legal rights, and the data behind the crisis."
      />

      {/* Resource hub */}
      <section className="container-page py-16" aria-labelledby="hub-heading">
        <h2 id="hub-heading" className="text-2xl md:text-3xl">Resource hub</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Start here. Each guide breaks down a complex part of the system into plain language.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {resources.map((r) => (
            <Card key={r.title} className="shadow-[var(--shadow-card)]">
              <CardContent className="flex gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  <r.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg">{r.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Know your rights */}
      <section className="bg-secondary py-16" aria-labelledby="rights-heading">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 id="rights-heading" className="text-2xl md:text-3xl">Know your rights</h2>
            <p className="mt-3 text-muted-foreground">
              Essential answers for incarcerated individuals and their families. This
              is general information, not legal advice — for your situation, contact a
              provider on our Resources page.
            </p>
            <Card className="mt-6 border-gold/40 bg-gold/10">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <h3 className="text-base font-semibold">Know Your Rights pocket guide</h3>
                  <p className="text-sm text-muted-foreground">Printable PDF · English &amp; Spanish</p>
                </div>
                <Button variant="default" aria-label="Download the Know Your Rights PDF guide">
                  <Download className="h-4 w-4" /> PDF
                </Button>
              </CardContent>
            </Card>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {rights.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Infographic: school-to-prison pipeline */}
      <section className="container-page py-16" aria-labelledby="pipeline-heading">
        <h2 id="pipeline-heading" className="text-2xl md:text-3xl">The school-to-prison pipeline</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          How small decisions compound into life-altering outcomes. Illustrative figures.
        </p>
        <ol className="mt-8 mx-auto flex max-w-2xl flex-col items-center gap-0">
          {pipeline.map((step, i) => (
            <li key={step.label} className="flex w-full flex-col items-center">
              <div className="w-full rounded-xl border border-border bg-card p-5 text-center shadow-[var(--shadow-card)]">
                <div className="flex flex-wrap items-center justify-center gap-x-3">
                  <span className="font-display text-3xl font-bold text-crimson">{step.stat}</span>
                  <span className="text-base font-semibold">{step.label}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{step.note}</p>
              </div>
              {i < pipeline.length - 1 && (
                <ArrowDown className="my-2 h-6 w-6 text-muted-foreground" aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
