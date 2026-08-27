/**
 * Mississippi correctional facility directory.
 *
 * Reference data compiled from public MDOC / BOP listings. Coordinates are
 * approximate town-level points used only for plotting the state map.
 * `updates` are community-tracked notes — they are editorial, not official.
 */

export type FacilityType = "state" | "private" | "federal" | "regional" | "closed";

export interface Facility {
  slug: string;
  name: string;
  shortName: string;
  type: FacilityType;
  city: string;
  county: string;
  lat: number;
  lng: number;
  operator: string;
  opened?: number;
  capacity?: number;
  security: string;
  summary: string;
  /** Ongoing issues, programs, and news tracked by the coalition. */
  updates: { label: string; text: string }[];
}

export const FACILITY_TYPE_LABEL: Record<FacilityType, string> = {
  state: "State prison",
  private: "Private contract",
  federal: "Federal",
  regional: "County regional",
  closed: "Closed",
};

export const facilities: Facility[] = [
  {
    slug: "mississippi-state-penitentiary-parchman",
    name: "Mississippi State Penitentiary (Parchman)",
    shortName: "Parchman",
    type: "state",
    city: "Parchman",
    county: "Sunflower",
    lat: 33.92,
    lng: -90.54,
    operator: "Mississippi Department of Corrections",
    opened: 1901,
    capacity: 3500,
    security: "Minimum through maximum, includes death row",
    summary:
      "The state's oldest and largest prison, an 18,000-acre former plantation farm. Long the focus of federal litigation over violence, understaffing, and conditions in Unit 29.",
    updates: [
      {
        label: "Conditions",
        text: "Federal findings have cited unsafe housing, inadequate mental-health care, and prolonged isolation. Families continue to report water, heat, and medical delays.",
      },
      {
        label: "Staffing",
        text: "Chronic officer vacancies drive lockdowns that cut visitation, canteen access, and programming.",
      },
      {
        label: "What we're doing",
        text: "Tracking inspection reports, collecting first-hand accounts through Voices Inside, and pushing sentencing and parole bills that reduce the population held here.",
      },
    ],
  },
  {
    slug: "central-mississippi-correctional-facility",
    name: "Central Mississippi Correctional Facility",
    shortName: "CMCF",
    type: "state",
    city: "Pearl",
    county: "Rankin",
    lat: 32.27,
    lng: -90.09,
    operator: "Mississippi Department of Corrections",
    opened: 1986,
    capacity: 3800,
    security: "All custody levels; primary intake and women's housing",
    summary:
      "Statewide reception center and the main facility housing incarcerated women, plus medical and mental-health units.",
    updates: [
      { label: "Intake", text: "Nearly everyone entering MDOC custody passes through classification here." },
      { label: "Women inside", text: "Advocates are pressing for expanded parenting, nursery, and hygiene-supply access." },
      { label: "Health care", text: "Reports of delayed specialty referrals and prescription gaps remain common." },
    ],
  },
  {
    slug: "south-mississippi-correctional-institution",
    name: "South Mississippi Correctional Institution",
    shortName: "SMCI",
    type: "state",
    city: "Leakesville",
    county: "Greene",
    lat: 31.16,
    lng: -88.56,
    operator: "Mississippi Department of Corrections",
    opened: 1990,
    capacity: 3200,
    security: "Medium and close custody",
    summary: "Large state prison in the Pine Belt with vocational, education, and faith-based programming.",
    updates: [
      { label: "Programs", text: "GED, welding, and horticulture classes run here but waitlists are long." },
      { label: "Safety", text: "Dormitory violence and contraband remain the most-reported concerns from families." },
    ],
  },
  {
    slug: "east-mississippi-correctional-facility",
    name: "East Mississippi Correctional Facility",
    shortName: "EMCF",
    type: "private",
    city: "Meridian",
    county: "Lauderdale",
    lat: 32.32,
    lng: -88.62,
    operator: "Private contractor for MDOC",
    opened: 1999,
    capacity: 1500,
    security: "Designated mental-health prison",
    summary:
      "Houses many people with serious mental illness. Subject of long-running civil-rights litigation over care, isolation, and use of force.",
    updates: [
      { label: "Litigation", text: "Years of federal court proceedings have documented failures in psychiatric care and suicide prevention." },
      { label: "Isolation", text: "Extended segregation of people in psychiatric crisis is a continuing focus of oversight." },
    ],
  },
  {
    slug: "wilkinson-county-correctional-facility",
    name: "Wilkinson County Correctional Facility",
    shortName: "Wilkinson County",
    type: "private",
    city: "Woodville",
    county: "Wilkinson",
    lat: 31.1,
    lng: -91.3,
    operator: "Private contractor for MDOC",
    capacity: 1000,
    security: "Close custody / long-term segregation",
    summary: "Remote southwest Mississippi prison known for restrictive housing and limited family access.",
    updates: [
      { label: "Distance", text: "Its location makes in-person visits costly for families in north Mississippi." },
      { label: "Restrictive housing", text: "Advocates are documenting time spent in lockdown and access to out-of-cell time." },
    ],
  },
  {
    slug: "marshall-county-correctional-facility",
    name: "Marshall County Correctional Facility",
    shortName: "Marshall County",
    type: "private",
    city: "Holly Springs",
    county: "Marshall",
    lat: 34.77,
    lng: -89.45,
    operator: "Private contractor for MDOC",
    capacity: 1000,
    security: "Medium custody",
    summary: "Contract prison in north Mississippi holding state-sentenced men.",
    updates: [
      { label: "Oversight", text: "Contract prisons report to MDOC monitors; we request and publish inspection summaries." },
      { label: "Programs", text: "Re-entry classes exist but capacity is limited relative to population." },
    ],
  },
  {
    slug: "walnut-grove",
    name: "Walnut Grove Correctional Facility",
    shortName: "Walnut Grove",
    type: "closed",
    city: "Walnut Grove",
    county: "Leake",
    lat: 32.6,
    lng: -89.46,
    operator: "Closed 2016",
    security: "Formerly youthful-offender and medium custody",
    summary:
      "Closed after federal court findings of severe violence and abuse — a landmark example of why private prison oversight matters in Mississippi.",
    updates: [
      { label: "Legacy", text: "The consent decree and closure remain a reference point for current oversight demands." },
    ],
  },
  {
    slug: "fcc-yazoo-city",
    name: "Federal Correctional Complex, Yazoo City",
    shortName: "FCC Yazoo City",
    type: "federal",
    city: "Yazoo City",
    county: "Yazoo",
    lat: 32.85,
    lng: -90.4,
    operator: "Federal Bureau of Prisons",
    capacity: 3800,
    security: "Low, medium, and high security complex",
    summary: "Multi-institution federal complex holding people from across the country.",
    updates: [
      { label: "Federal custody", text: "State reform bills do not reach people held here; federal advocacy channels differ." },
      { label: "Communication", text: "Phone and email costs are a recurring hardship reported by families." },
    ],
  },
  {
    slug: "adams-county-correctional-center",
    name: "Adams County Correctional Center",
    shortName: "Adams County",
    type: "federal",
    city: "Natchez",
    county: "Adams",
    lat: 31.51,
    lng: -91.35,
    operator: "Private contractor for federal agencies",
    capacity: 2200,
    security: "Low / detention",
    summary: "Privately operated facility on federal contract in southwest Mississippi.",
    updates: [
      { label: "Contract detention", text: "Population and mission have shifted with federal contracts; transparency is limited." },
    ],
  },
  {
    slug: "tallahatchie-county-correctional-facility",
    name: "Tallahatchie County Correctional Facility",
    shortName: "Tallahatchie County",
    type: "private",
    city: "Tutwiler",
    county: "Tallahatchie",
    lat: 34.01,
    lng: -90.43,
    operator: "Private operator, out-of-state contracts",
    capacity: 2600,
    security: "Medium custody",
    summary: "Delta facility that has largely held people sentenced in other states under contract.",
    updates: [
      { label: "Out-of-state transfers", text: "People held far from home lose visitation and legal support networks." },
    ],
  },

  // ---- County regional facilities holding state inmates ----
  {
    slug: "alcorn-county-regional",
    name: "Alcorn County Regional Correctional Facility",
    shortName: "Alcorn Regional",
    type: "regional",
    city: "Corinth",
    county: "Alcorn",
    lat: 34.93,
    lng: -88.52,
    operator: "County regional under MDOC contract",
    capacity: 350,
    security: "Minimum / medium",
    summary: "One of Mississippi's regional prisons housing state-sentenced people close to home counties.",
    updates: [{ label: "Work programs", text: "Regional facilities run joint state–county work and trusty programs." }],
  },
  {
    slug: "bolivar-county-regional",
    name: "Bolivar County Regional Correctional Facility",
    shortName: "Bolivar Regional",
    type: "regional",
    city: "Cleveland",
    county: "Bolivar",
    lat: 33.75,
    lng: -90.72,
    operator: "County regional under MDOC contract",
    capacity: 300,
    security: "Minimum / medium",
    summary: "Delta regional facility with limited programming capacity.",
    updates: [{ label: "Delta access", text: "Legal-aid and volunteer coverage in the Delta is thin; we're recruiting mentors." }],
  },
  {
    slug: "carroll-montgomery-regional",
    name: "Carroll/Montgomery County Regional Correctional Facility",
    shortName: "Carroll/Montgomery Regional",
    type: "regional",
    city: "Vaiden",
    county: "Carroll",
    lat: 33.33,
    lng: -89.75,
    operator: "County regional under MDOC contract",
    capacity: 200,
    security: "Minimum / medium",
    summary: "Small central Mississippi regional facility.",
    updates: [{ label: "Re-entry", text: "Release planning support is minimal; our resource directory fills gaps." }],
  },
  {
    slug: "chickasaw-county-regional",
    name: "Chickasaw County Regional Correctional Facility",
    shortName: "Chickasaw Regional",
    type: "regional",
    city: "Houston",
    county: "Chickasaw",
    lat: 33.9,
    lng: -88.99,
    operator: "County regional under MDOC contract",
    capacity: 190,
    security: "Minimum / medium",
    summary: "Regional facility in northeast Mississippi.",
    updates: [{ label: "Family contact", text: "Visitation schedules change frequently; call ahead before traveling." }],
  },
  {
    slug: "george-greene-regional",
    name: "George/Greene County Regional Correctional Facility",
    shortName: "George/Greene Regional",
    type: "regional",
    city: "Lucedale",
    county: "George",
    lat: 30.92,
    lng: -88.6,
    operator: "County regional under MDOC contract",
    capacity: 250,
    security: "Minimum / medium",
    summary: "South Mississippi regional facility near SMCI.",
    updates: [{ label: "Heat", text: "Summer heat in non-air-conditioned housing is a repeated complaint statewide." }],
  },
  {
    slug: "holmes-humphreys-regional",
    name: "Holmes/Humphreys County Regional Correctional Facility",
    shortName: "Holmes/Humphreys Regional",
    type: "regional",
    city: "Lexington",
    county: "Holmes",
    lat: 33.11,
    lng: -90.05,
    operator: "County regional under MDOC contract",
    capacity: 200,
    security: "Minimum / medium",
    summary: "Regional facility serving two Delta-edge counties.",
    updates: [{ label: "Programming", text: "GED access depends on volunteer instructors." }],
  },
  {
    slug: "issaquena-county-regional",
    name: "Issaquena County Regional Correctional Facility",
    shortName: "Issaquena Regional",
    type: "regional",
    city: "Mayersville",
    county: "Issaquena",
    lat: 32.9,
    lng: -91.05,
    operator: "County regional under MDOC contract",
    capacity: 350,
    security: "Minimum / medium",
    summary: "Remote river-county regional facility.",
    updates: [{ label: "Isolation", text: "Very limited public transit makes family visits difficult." }],
  },
  {
    slug: "jefferson-franklin-regional",
    name: "Jefferson/Franklin County Regional Correctional Facility",
    shortName: "Jefferson/Franklin Regional",
    type: "regional",
    city: "Fayette",
    county: "Jefferson",
    lat: 31.71,
    lng: -91.06,
    operator: "County regional under MDOC contract",
    capacity: 250,
    security: "Minimum / medium",
    summary: "Southwest Mississippi regional facility.",
    updates: [{ label: "Re-entry", text: "Rural job placement after release is a top need." }],
  },
  {
    slug: "kemper-neshoba-regional",
    name: "Kemper/Neshoba County Regional Correctional Facility",
    shortName: "Kemper/Neshoba Regional",
    type: "regional",
    city: "DeKalb",
    county: "Kemper",
    lat: 32.77,
    lng: -88.65,
    operator: "County regional under MDOC contract",
    capacity: 200,
    security: "Minimum / medium",
    summary: "East-central Mississippi regional facility.",
    updates: [{ label: "Oversight", text: "Regional facilities receive less public scrutiny than the big prisons." }],
  },
  {
    slug: "leake-county-regional",
    name: "Leake County Regional Correctional Facility",
    shortName: "Leake Regional",
    type: "regional",
    city: "Carthage",
    county: "Leake",
    lat: 32.73,
    lng: -89.53,
    operator: "County regional under MDOC contract",
    capacity: 130,
    security: "Minimum / medium",
    summary: "Small regional facility in central Mississippi.",
    updates: [{ label: "Capacity", text: "Small size means transfers happen often, disrupting programs." }],
  },
  {
    slug: "marion-walthall-regional",
    name: "Marion/Walthall County Regional Correctional Facility",
    shortName: "Marion/Walthall Regional",
    type: "regional",
    city: "Columbia",
    county: "Marion",
    lat: 31.25,
    lng: -89.84,
    operator: "County regional under MDOC contract",
    capacity: 220,
    security: "Minimum / medium",
    summary: "Pine Belt regional facility.",
    updates: [{ label: "Health care", text: "On-site medical staffing is limited to routine care." }],
  },
  {
    slug: "stone-county-regional",
    name: "Stone County Regional Correctional Facility",
    shortName: "Stone Regional",
    type: "regional",
    city: "Wiggins",
    county: "Stone",
    lat: 30.86,
    lng: -89.13,
    operator: "County regional under MDOC contract",
    capacity: 180,
    security: "Minimum / medium",
    summary: "Coastal-region regional facility.",
    updates: [{ label: "Storm risk", text: "Hurricane season raises evacuation and safety questions for coastal facilities." }],
  },
  {
    slug: "washington-county-regional",
    name: "Washington County Regional Correctional Facility",
    shortName: "Washington Regional",
    type: "regional",
    city: "Greenville",
    county: "Washington",
    lat: 33.41,
    lng: -91.06,
    operator: "County regional under MDOC contract",
    capacity: 300,
    security: "Minimum / medium",
    summary: "Delta regional facility serving Greenville and surrounding counties.",
    updates: [{ label: "Community ties", text: "Closer-to-home placement helps families stay connected." }],
  },
  {
    slug: "winston-choctaw-regional",
    name: "Winston/Choctaw County Regional Correctional Facility",
    shortName: "Winston/Choctaw Regional",
    type: "regional",
    city: "Louisville",
    county: "Winston",
    lat: 33.12,
    lng: -89.05,
    operator: "County regional under MDOC contract",
    capacity: 150,
    security: "Minimum / medium",
    summary: "East-central regional facility.",
    updates: [{ label: "Volunteers", text: "We are recruiting mentors and instructors for this facility." }],
  },
];

export function findFacility(slug: string): Facility | undefined {
  return facilities.find((f) => f.slug === slug);
}

/** Simple text search across the facility directory. */
export function searchFacilities(query: string): Facility[] {
  const q = query.trim().toLowerCase();
  if (!q) return facilities;
  return facilities.filter((f) =>
    [f.name, f.shortName, f.city, f.county, f.operator, f.summary, FACILITY_TYPE_LABEL[f.type]]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

/**
 * Approximate Mississippi state outline as [lng, lat] pairs, used to draw the
 * SVG map. Simplified for rendering — not a survey-accurate boundary.
 */
export const MS_OUTLINE: [number, number][] = [
  [-90.31, 35.0],
  [-90.58, 34.6],
  [-90.58, 34.3],
  [-90.9, 34.0],
  [-91.05, 33.7],
  [-91.2, 33.4],
  [-91.15, 33.0],
  [-91.05, 32.6],
  [-91.15, 32.3],
  [-91.3, 32.0],
  [-91.5, 31.6],
  [-91.6, 31.3],
  [-91.63, 31.0],
  [-89.73, 31.0],
  [-89.72, 30.75],
  [-89.65, 30.5],
  [-89.62, 30.35],
  [-89.42, 30.18],
  [-89.0, 30.25],
  [-88.6, 30.35],
  [-88.42, 30.4],
  [-88.43, 31.0],
  [-88.34, 32.0],
  [-88.31, 33.0],
  [-88.2, 34.0],
  [-88.2, 34.99],
];

export const MAP_BOUNDS = {
  minLng: -91.75,
  maxLng: -88.05,
  minLat: 30.05,
  maxLat: 35.1,
};

export const MAP_SIZE = { width: 380, height: 620 };

/** Equirectangular projection of a lng/lat pair into SVG viewBox space. */
export function project(lng: number, lat: number): { x: number; y: number } {
  const { minLng, maxLng, minLat, maxLat } = MAP_BOUNDS;
  return {
    x: ((lng - minLng) / (maxLng - minLng)) * MAP_SIZE.width,
    y: ((maxLat - lat) / (maxLat - minLat)) * MAP_SIZE.height,
  };
}
