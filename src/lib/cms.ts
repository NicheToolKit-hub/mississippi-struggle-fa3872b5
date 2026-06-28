/**
 * Client-safe constants & helpers for the Content Management System (CMS).
 *
 * The CMS lets signed-in supporters submit three kinds of content — Resources,
 * Legislation, and Community Proposals — all stored in the `cms_content` table
 * with a `pending` status until an admin approves them.
 */

export type CmsContentType = "resource" | "legislation" | "proposal";
export type CmsStatus = "pending" | "approved" | "rejected";

/** Options for the "What are you submitting?" dropdown on the contribute form. */
export const CMS_CONTENT_TYPES = [
  {
    value: "resource",
    label: "Resource (PDF, link, or guide)",
    short: "Resource",
    blurb: "A helpful PDF, external link, or how-to guide for the community.",
  },
  {
    value: "legislation",
    label: "Legislation (bill, active law, or policy)",
    short: "Legislation",
    blurb: "A new bill, an active law, or a policy worth tracking.",
  },
  {
    value: "proposal",
    label: "Community Proposal / Initiative",
    short: "Proposal",
    blurb: "An idea, campaign, or initiative for the community to rally around.",
  },
] as const;

/** Shared category list across all content types. */
export const CMS_CATEGORIES = [
  "Prison Reform",
  "Re-entry",
  "Legislative",
  "Legal Aid",
  "Sentencing",
  "Conditions & Healthcare",
  "Family Support",
  "Education",
  "Other",
] as const;

export function cmsTypeLabel(value: string): string {
  return CMS_CONTENT_TYPES.find((t) => t.value === value)?.short ?? value;
}

export function cmsTypeFullLabel(value: string): string {
  return CMS_CONTENT_TYPES.find((t) => t.value === value)?.label ?? value;
}
