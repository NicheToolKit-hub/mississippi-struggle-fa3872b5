import { MS_OUTLINE, MAP_SIZE, project, type Facility, type FacilityType } from "@/lib/prisons";
import { cn } from "@/lib/utils";

/** Marker fill per facility type, using design tokens only. */
const TYPE_FILL: Record<FacilityType, string> = {
  state: "var(--crimson)",
  private: "var(--gold)",
  federal: "var(--primary)",
  regional: "var(--muted-foreground)",
  closed: "var(--border)",
};

interface PrisonMapProps {
  facilities: Facility[];
  selectedSlug?: string | null;
  onSelect: (facility: Facility) => void;
  className?: string;
}

/**
 * Lightweight SVG map of Mississippi with a marker per correctional facility.
 * No mapping library needed — coordinates are projected in `@/lib/prisons`.
 */
export function PrisonMap({ facilities, selectedSlug, onSelect, className }: PrisonMapProps) {
  const outline = MS_OUTLINE.map(([lng, lat]) => {
    const p = project(lng, lat);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg
      viewBox={`0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}`}
      role="img"
      aria-label="Map of Mississippi showing correctional facility locations"
      className={cn("h-full w-full", className)}
    >
      <polygon
        points={outline}
        fill="var(--secondary)"
        stroke="var(--primary)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {facilities.map((f) => {
        const { x, y } = project(f.lng, f.lat);
        const selected = f.slug === selectedSlug;
        const big = f.type === "state" || f.type === "private" || f.type === "federal";
        return (
          <g key={f.slug}>
            {selected && (
              <circle cx={x} cy={y} r={13} fill="var(--gold)" opacity={0.35}>
                <animate attributeName="r" values="9;15;9" dur="1.8s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={x}
              cy={y}
              r={selected ? 8 : big ? 6.5 : 4.5}
              fill={TYPE_FILL[f.type]}
              stroke="var(--background)"
              strokeWidth={1.5}
              tabIndex={0}
              role="button"
              aria-label={`${f.name}, ${f.city}, ${f.county} County`}
              className="cursor-pointer outline-none focus-visible:stroke-[var(--gold)] focus-visible:stroke-[3]"
              onClick={() => onSelect(f)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(f);
                }
              }}
            >
              <title>{f.name}</title>
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

/** Shared legend for the marker colors. */
export function MapLegend({ className }: { className?: string }) {
  const items: { type: FacilityType; label: string }[] = [
    { type: "state", label: "State prison" },
    { type: "private", label: "Private contract" },
    { type: "federal", label: "Federal" },
    { type: "regional", label: "County regional" },
    { type: "closed", label: "Closed" },
  ];
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground", className)}>
      {items.map((i) => (
        <li key={i.type} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full border border-border"
            style={{ background: TYPE_FILL[i.type] }}
          />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
