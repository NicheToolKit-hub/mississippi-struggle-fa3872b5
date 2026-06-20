import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const BUCKET = "submission-uploads";
const SIGNED_TTL = 60 * 60 * 24 * 7; // 7 days

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

/** Sign an array of storage object paths into temporary public URLs. */
async function signPaths(paths: (string | null | undefined)[]): Promise<Record<string, string>> {
  const clean = Array.from(new Set(paths.filter((p): p is string => !!p)));
  if (clean.length === 0) return {};
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage.from(BUCKET).createSignedUrls(clean, SIGNED_TTL);
  const map: Record<string, string> = {};
  (data ?? []).forEach((d) => {
    if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
  });
  return map;
}

// ---------------- Public reads ----------------

export const listProfiles = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("prisoner_profiles")
    .select("id,name,facility,bio,photo_url,featured,created_at")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error || !data) return { profiles: [] };
  const signed = await signPaths(data.map((p) => p.photo_url));
  return {
    profiles: data.map((p) => ({
      id: p.id,
      name: p.name,
      facility: p.facility,
      bio: p.bio,
      featured: p.featured,
      photoUrl: p.photo_url ? signed[p.photo_url] ?? null : null,
    })),
  };
});

export const getProfile = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: profile } = await sb
      .from("prisoner_profiles")
      .select("id,name,facility,bio,photo_url,featured,created_at")
      .eq("id", data.id)
      .eq("published", true)
      .maybeSingle();
    if (!profile) return { profile: null, items: [] };

    const { data: items } = await sb
      .from("profile_items")
      .select("id,kind,title,description,media_url,year,created_at")
      .eq("profile_id", data.id)
      .eq("published", true)
      .order("created_at", { ascending: false });

    const signed = await signPaths([
      profile.photo_url,
      ...(items ?? []).map((i) => i.media_url),
    ]);

    return {
      profile: {
        id: profile.id,
        name: profile.name,
        facility: profile.facility,
        bio: profile.bio,
        featured: profile.featured,
        photoUrl: profile.photo_url ? signed[profile.photo_url] ?? null : null,
      },
      items: (items ?? []).map((i) => ({
        id: i.id,
        kind: i.kind,
        title: i.title,
        description: i.description,
        year: i.year,
        mediaUrl: i.media_url ? signed[i.media_url] ?? null : null,
      })),
    };
  });

export const listMediaPosts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("media_posts")
    .select("id,title,description,kind,source,file_url,embed_url,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error || !data) return { posts: [] };
  const signed = await signPaths(data.filter((m) => m.source === "upload").map((m) => m.file_url));
  return {
    posts: data.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      kind: m.kind,
      source: m.source,
      embedUrl: m.embed_url,
      fileUrl: m.source === "upload" && m.file_url ? signed[m.file_url] ?? null : null,
      publishedAt: m.published_at,
    })),
  };
});

// ---------------- Public writes (intake) ----------------

const submissionSchema = z.object({
  type: z.string().min(1).max(40),
  title: z.string().trim().max(160).optional().nullable(),
  body: z.string().trim().max(5000).optional().nullable(),
  personName: z.string().trim().max(160).optional().nullable(),
  facility: z.string().trim().max(160).optional().nullable(),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  mediaKind: z.string().trim().max(40).optional().nullable(),
  mediaPaths: z.array(z.string().max(500)).max(10).optional().default([]),
  embedUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
  submitterName: z.string().trim().max(120).optional().nullable(),
  submitterEmail: z.string().trim().email().max(255).optional().nullable().or(z.literal("")),
});

export const createSubmission = createServerFn({ method: "POST" })
  .inputValidator((d) => submissionSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb.from("submissions").insert({
      type: data.type,
      status: "pending",
      title: data.title || null,
      body: data.body || null,
      person_name: data.personName || null,
      facility: data.facility || null,
      year: data.year ?? null,
      media_kind: data.mediaKind || null,
      media_url: data.mediaPaths ?? [],
      embed_url: data.embedUrl || null,
      submitter_name: data.submitterName || null,
      submitter_email: data.submitterEmail || null,
    });
    if (error) throw new Error("Could not save your submission. Please try again.");
    return { ok: true };
  });

export const submitVolunteerOffer = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        offerType: z.string().min(1).max(40),
        name: z.string().trim().min(1).max(120),
        email: z.string().trim().email().max(255),
        details: z.string().trim().max(2000).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb.from("volunteer_offers").insert({
      offer_type: data.offerType,
      name: data.name,
      email: data.email,
      details: data.details || null,
    });
    if (error) throw new Error("Could not submit your offer. Please try again.");
    return { ok: true };
  });

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        name: z.string().trim().min(1).max(120),
        email: z.string().trim().email().max(255),
        subject: z.string().trim().max(160).optional().nullable(),
        message: z.string().trim().min(1).max(3000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      message: data.message,
    });
    if (error) throw new Error("Could not send your message. Please try again.");
    return { ok: true };
  });
