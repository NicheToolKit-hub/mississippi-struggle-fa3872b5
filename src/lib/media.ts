/** Client-safe helpers and shared option lists for submissions & media. */

export const SUBMISSION_TYPES = [
  { value: "profile", label: "Prisoner profile" },
  { value: "accomplishment", label: "Accomplishment" },
  { value: "book", label: "Book authored" },
  { value: "art", label: "Artwork" },
  { value: "certificate", label: "Certificate / award" },
  { value: "story", label: "Story / testimony" },
  { value: "media", label: "Podcast or video" },
  { value: "idea", label: "Idea / suggestion" },
] as const;

export type SubmissionType = (typeof SUBMISSION_TYPES)[number]["value"];

export const OFFER_TYPES = [
  { value: "time", label: "My time (volunteering)" },
  { value: "supplies", label: "Supplies / materials" },
  { value: "networking", label: "Networking & connections" },
  { value: "advertising", label: "Advertising / promotion" },
  { value: "links", label: "Links / cross-promotion" },
  { value: "ideas", label: "Ideas & expertise" },
  { value: "other", label: "Something else" },
] as const;

export const MEDIA_KINDS = [
  { value: "podcast", label: "Podcast / audio" },
  { value: "video", label: "Video" },
] as const;

export function submissionTypeLabel(value: string): string {
  return SUBMISSION_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function offerTypeLabel(value: string): string {
  return OFFER_TYPES.find((t) => t.value === value)?.label ?? value;
}

/**
 * Convert a public share URL (YouTube, Spotify, Apple Podcasts, Vimeo, SoundCloud)
 * into an embeddable iframe src. Returns the original URL if no rule matches.
 */
export function toEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const url = raw.trim();
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // YouTube
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (host.endsWith("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return url;
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (u.pathname.startsWith("/shorts/")) {
        return `https://www.youtube.com/embed/${u.pathname.split("/")[2]}`;
      }
    }

    // Spotify
    if (host === "open.spotify.com") {
      if (u.pathname.startsWith("/embed/")) return url;
      return `https://open.spotify.com/embed${u.pathname}`;
    }

    // Apple Podcasts
    if (host === "podcasts.apple.com") {
      return `https://embed.podcasts.apple.com${u.pathname}${u.search}`;
    }
    if (host === "embed.podcasts.apple.com") return url;

    // Vimeo
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : url;
    }
    if (host === "player.vimeo.com") return url;

    // SoundCloud (uses oEmbed visual player)
    if (host.endsWith("soundcloud.com")) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23${"b8893a"}`;
    }
  } catch {
    return url;
  }
  return url;
}
