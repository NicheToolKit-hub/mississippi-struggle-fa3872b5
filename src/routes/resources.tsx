import { createFileRoute } from "@tanstack/react-router";
import {
  Scale,
  Landmark,
  HeartHandshake,
  BookMarked,
  Home,
  Phone,
  ExternalLink,
  LifeBuoy,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CommunityContentSection } from "@/components/community-content";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources | Mississippi Struggle" },
      {
        name: "description",
        content:
          "A directory of prison reform advocates, state representatives, pro bono lawyers, hope dealers, free legal aid, and re-entry support across Mississippi.",
      },
      { property: "og:title", content: "Resources | Mississippi Struggle" },
      {
        property: "og:description",
        content: "Find advocates, legal aid, and re-entry support across Mississippi.",
      },
    ],
  }),
  component: ResourcesPage,
});

interface ResourceItem {
  name: string;
  detail: string;
  link?: string;
}

interface ResourceGroup {
  icon: typeof Scale;
  title: string;
  blurb: string;
  items: ResourceItem[];
}

/** Illustrative directory data — verify and expand before launch. */
const groups: ResourceGroup[] = [
  {
    icon: HeartHandshake,
    title: "Prison Reform Advocates",
    blurb: "Organizations leading the fight for justice in Mississippi.",
    items: [
      { name: "ACLU of Mississippi", detail: "Civil rights litigation & advocacy", link: "https://www.aclu-ms.org" },
      { name: "MS Center for Justice", detail: "Systemic poverty & justice reform", link: "https://mscenterforjustice.org" },
      { name: "Empower Mississippi", detail: "Criminal-justice policy reform", link: "https://empowerms.org" },
    ],
  },
  {
    icon: Landmark,
    title: "State Representatives",
    blurb: "Contact the officials who shape Mississippi law.",
    items: [
      { name: "Find your legislator", detail: "Look up your MS House & Senate members", link: "https://www.legislature.ms.gov" },
      { name: "MS House of Representatives", detail: "Bill sponsors & committees", link: "https://www.legislature.ms.gov" },
      { name: "Governor's Office", detail: "Executive action & clemency", link: "https://governorreeves.ms.gov" },
    ],
  },
  {
    icon: Scale,
    title: "Pro Bono Lawyers",
    blurb: "Free legal representation for those who qualify.",
    items: [
      { name: "Mississippi Volunteer Lawyers Project", detail: "Civil legal aid for low-income residents", link: "https://www.msvlp.org" },
      { name: "MacArthur Justice Center", detail: "Criminal-justice impact litigation", link: "https://www.macarthurjustice.org" },
      { name: "Innocence Project — MS", detail: "Wrongful conviction review" },
    ],
  },
  {
    icon: LifeBuoy,
    title: "Hope Dealers",
    blurb: "Mentors and peer support from those who've walked the path.",
    items: [
      { name: "Returning Citizens Mentorship", detail: "Peer mentoring by formerly incarcerated leaders" },
      { name: "Faith & Family Network", detail: "Spiritual care for families of the incarcerated" },
      { name: "Youth Diversion Circle", detail: "Keeping young people out of the system" },
    ],
  },
  {
    icon: BookMarked,
    title: "Free Legal Resources",
    blurb: "Self-help tools, guides, and hotlines at no cost.",
    items: [
      { name: "Legal Services Corporation", detail: "Find free legal aid by county", link: "https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help" },
      { name: "Expungement Self-Help Kit", detail: "Step-by-step forms & instructions" },
      { name: "Prisoner Rights Hotline", detail: "Report conditions & rights violations" },
    ],
  },
  {
    icon: Home,
    title: "Re-entry Support",
    blurb: "Housing, employment, and stability after release.",
    items: [
      { name: "Mississippi Reentry Council", detail: "Coordinated re-entry services statewide" },
      { name: "Second Chance Employment Network", detail: "Fair-chance hiring employers" },
      { name: "Transitional Housing Directory", detail: "Sober & supportive housing options" },
    ],
  },
];

function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="Help is here — you are not alone"
        description="A curated directory connecting people, families, and returning citizens to the advocates, lawyers, and programs that can help."
      />

      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.title} className="flex flex-col shadow-[var(--shadow-card)]">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary">
                  <group.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-xl">{group.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{group.blurb}</p>
                <ul className="mt-5 flex-1 space-y-3 border-t border-border pt-4">
                  {group.items.map((item) => (
                    <li key={item.name}>
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start justify-between gap-2"
                        >
                          <span>
                            <span className="block text-sm font-semibold text-foreground group-hover:text-gold">
                              {item.name}
                            </span>
                            <span className="block text-xs text-muted-foreground">{item.detail}</span>
                          </span>
                          <ExternalLink
                            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-gold"
                            aria-hidden="true"
                          />
                        </a>
                      ) : (
                        <span>
                          <span className="block text-sm font-semibold text-foreground">{item.name}</span>
                          <span className="block text-xs text-muted-foreground">{item.detail}</span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Crisis support callout */}
        <Card className="mt-10 border-crimson/40 bg-crimson/5">
          <CardContent className="flex flex-col items-start gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-crimson text-crimson-foreground">
                <Phone className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl">Need to talk to someone now?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Our intake line connects you to the right advocate or service.
                </p>
              </div>
            </div>
            <a
              href="tel:+16015550199"
              className="rounded-md bg-crimson px-5 py-2.5 text-sm font-semibold text-crimson-foreground transition-colors hover:bg-crimson/90"
            >
              Call (601) 555-0199
            </a>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
