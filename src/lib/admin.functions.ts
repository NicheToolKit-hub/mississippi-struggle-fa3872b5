import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "submission-uploads";
const SIGNED_TTL = 60 * 60 * 24 * 7;

/** Throws unless the calling user holds the admin role. */
async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden: admin access required");
}

async function signWith(sb: any, paths: (string | null | undefined)[]) {
  const clean = Array.from(new Set(paths.filter((p: any): p is string => !!p)));
  if (clean.length === 0) return {} as Record<string, string>;
  const { data } = await sb.storage.from(BUCKET).createSignedUrls(clean, SIGNED_TTL);
  const map: Record<string, string> = {};
  (data ?? []).forEach((d: any) => {
    if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
  });
  return map;
}

// ---------------- Notifications / counts ----------------

/**
 * Counts of newly submitted, not-yet-reviewed items across intake tables.
 * Powers the live notification badges on the admin dashboard.
 */
export const getReviewCounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const sb = context.supabase;
    const [subs, offers, msgs, content] = await Promise.all([
      sb.from("submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
      sb.from("volunteer_offers").select("id", { count: "exact", head: true }).eq("status", "new"),
      sb.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
      sb.from("cms_content").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    return {
      pendingSubmissions: subs.count ?? 0,
      newOffers: offers.count ?? 0,
      newMessages: msgs.count ?? 0,
      pendingContent: content.count ?? 0,
    };
  });

// ---------------- Reviews queue ----------------

export const listSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ status: z.string().max(20).optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = context.supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (data.status) q = q.eq("status", data.status);
    const { data: rows } = await q;
    const all = rows ?? [];
    const signed = await signWith(context.supabase, all.flatMap((r: any) => r.media_url ?? []));
    return {
      submissions: all.map((r: any) => ({
        ...r,
        mediaSigned: (r.media_url ?? []).map((p: string) => signed[p]).filter(Boolean),
      })),
    };
  });

export const approveSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const sb = context.supabase;
    const { data: sub } = await sb.from("submissions").select("*").eq("id", data.id).maybeSingle();
    if (!sub) throw new Error("Submission not found");

    const media: string[] = sub.media_url ?? [];

    if (sub.type === "profile") {
      await sb.from("prisoner_profiles").insert({
        name: sub.person_name || sub.title || "Unnamed",
        facility: sub.facility || null,
        bio: sub.body || null,
        photo_url: media[0] ?? null,
        published: true,
      });
    } else if (sub.type === "media") {
      const source = sub.embed_url ? "embed" : "upload";
      await sb.from("media_posts").insert({
        title: sub.title || "Untitled",
        description: sub.body || null,
        kind: sub.media_kind || "podcast",
        source,
        file_url: source === "upload" ? media[0] ?? null : null,
        embed_url: sub.embed_url || null,
        published: true,
      });
    } else if (sub.type !== "idea") {
      // art / book / certificate / accomplishment / story — attach to a profile
      let profileId: string | null = null;
      if (sub.person_name) {
        const { data: existing } = await sb
          .from("prisoner_profiles")
          .select("id")
          .ilike("name", sub.person_name)
          .limit(1)
          .maybeSingle();
        if (existing) profileId = existing.id;
      }
      if (!profileId) {
        const { data: created } = await sb
          .from("prisoner_profiles")
          .insert({
            name: sub.person_name || sub.title || "Unnamed",
            facility: sub.facility || null,
            published: true,
          })
          .select("id")
          .single();
        profileId = created?.id ?? null;
      }
      if (profileId) {
        const kind = sub.type === "story" ? "accomplishment" : sub.type;
        await sb.from("profile_items").insert({
          profile_id: profileId,
          kind,
          title: sub.title || sub.person_name || "Submission",
          description: sub.body || null,
          media_url: media[0] ?? null,
          year: sub.year ?? null,
          published: true,
        });
      }
    }

    await sb
      .from("submissions")
      .update({ status: "approved", reviewed_by: context.userId, reviewed_at: new Date().toISOString() })
      .eq("id", data.id);
    return { ok: true };
  });

export const rejectSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), note: z.string().trim().max(1000).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await context.supabase
      .from("submissions")
      .update({
        status: "rejected",
        review_note: data.note || null,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    return { ok: true };
  });

export const deleteSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await context.supabase.from("submissions").delete().eq("id", data.id);
    return { ok: true };
  });

// ---------------- Volunteer offers & messages ----------------

export const listOffers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase
      .from("volunteer_offers")
      .select("*")
      .order("created_at", { ascending: false });
    return { offers: data ?? [] };
  });

export const updateOfferStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: z.string().max(20) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await context.supabase.from("volunteer_offers").update({ status: data.status }).eq("id", data.id);
    return { ok: true };
  });

export const listMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    return { messages: data ?? [] };
  });

export const updateMessageStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: z.string().max(20) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await context.supabase.from("contact_messages").update({ status: data.status }).eq("id", data.id);
    return { ok: true };
  });

// ---------------- Published content management ----------------

export const listAdminProfiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase
      .from("prisoner_profiles")
      .select("id,name,facility,featured,published,created_at")
      .order("created_at", { ascending: false });
    return { profiles: data ?? [] };
  });

export const toggleProfileFeatured = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), featured: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await context.supabase
      .from("prisoner_profiles")
      .update({ featured: data.featured })
      .eq("id", data.id);
    return { ok: true };
  });

export const deleteProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await context.supabase.from("prisoner_profiles").delete().eq("id", data.id);
    return { ok: true };
  });

export const listAdminMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase
      .from("media_posts")
      .select("id,title,kind,source,published,published_at")
      .order("published_at", { ascending: false });
    return { media: data ?? [] };
  });

export const createMediaPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        title: z.string().trim().min(1).max(160),
        description: z.string().trim().max(3000).optional().nullable(),
        kind: z.string().max(20),
        embedUrl: z.string().trim().url().max(500),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await context.supabase.from("media_posts").insert({
      title: data.title,
      description: data.description || null,
      kind: data.kind,
      source: "embed",
      embed_url: data.embedUrl,
      published: true,
    });
    return { ok: true };
  });

export const deleteMediaPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await context.supabase.from("media_posts").delete().eq("id", data.id);
    return { ok: true };
  });
