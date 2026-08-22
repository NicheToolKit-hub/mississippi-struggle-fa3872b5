/**
 * Hero background framing helpers.
 *
 * Admins can crop/position the homepage hero independently for mobile and
 * desktop. The values are stored in `site_settings` as plain strings:
 *   hero_focus_x_desktop / hero_focus_y_desktop / hero_zoom_desktop
 *   hero_focus_x_mobile  / hero_focus_y_mobile  / hero_zoom_mobile
 * Focus values are percentages (0-100) used for CSS object-position, zoom is a
 * scale multiplier (1 = fit, 2 = 2x crop-in).
 */
export type HeroFraming = { x: number; y: number; zoom: number };

export const DEFAULT_FRAMING: HeroFraming = { x: 50, y: 50, zoom: 1 };

function num(value: string | undefined, fallback: number, min: number, max: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Read the framing for one device from a `site_settings` key/value map. */
export function readFraming(
  settings: Record<string, string> | undefined,
  device: "desktop" | "mobile",
): HeroFraming {
  const s = settings ?? {};
  return {
    x: num(s[`hero_focus_x_${device}`], 50, 0, 100),
    y: num(s[`hero_focus_y_${device}`], 50, 0, 100),
    zoom: num(s[`hero_zoom_${device}`], 1, 1, 3),
  };
}

/** Inline styles that apply a framing to an `object-cover` <img>. */
export function framingStyle(f: HeroFraming): React.CSSProperties {
  return {
    objectPosition: `${f.x}% ${f.y}%`,
    transform: f.zoom === 1 ? undefined : `scale(${f.zoom})`,
    transformOrigin: `${f.x}% ${f.y}%`,
  };
}
