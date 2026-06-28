import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server functions for the role-based CMS (`cms_content` table).
 *
 *  - Public reads  → anon client, approved content only.
 *  - Supporter writes → authenticated client, inserts a `pending` row tied to
 *    the signed-in user (enforced again by RLS).
 *  - Admin reads/edits → authenticated client + admin-role check.
 */

const contentTypeEnum = z.enum(["resource", "legislation", "proposal"]);
const statusEnum = z.enum(["pending", "approved", "rejected"]);

/** Anonymous client for public-facing reads (RLS limits rows to `approved`). */
function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

/** Throws unless the calling user holds the admin role. */
async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden: admin access required");
}

function mapRow(r: any) {
  return {
    id: r.id,
    contentType: r.content_type,
    title: r.title,
    description: r.description,
    category: r.category,
    externalUrl: r.external_url,
    attachmentUrl: r.attachment_url,
    status: r.status,
    reviewNote: r.review_note,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ---------------- Public reads (approved only) ----------------

/**
 * Public list of APPROVED content, optionally filtered by content type.
 * Used by the Resources, Bills & Laws, and Proposals pages.
 */
export const listPublicContent = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z.object({ contentType: contentTypeEnum.optional() }).parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb
      .from("cms_content")
      .select("id,content_type,title,description,category,external_url,attachment_url,status,created_at,updated_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (data.contentType) q = q.eq("content_type", data.contentType);
    const { data: rows, error } = await q;
    if (error || !rows) return { items: [] };
    return { items: rows.map(mapRow) };
  });

// ---------------- Supporter writes ----------------

const submitSchema = z.object({
  contentType: contentTypeEnum,
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(5).max(5000),
  category: z.string().trim().max(80).optional().nullable(),
  externalUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
  attachmentUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
});

/**
 * Supporter submission. Always saved as `pending` and attributed to the
 * signed-in user. RLS independently enforces both of these invariants.
 */
export const submitCmsContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => submitSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("cms_content").insert({
      content_type: data.contentType,
      title: data.title,
      description: data.description,
      category: data.category || null,
      external_url: data.externalUrl || null,
      attachment_url: data.attachmentUrl || null,
      submitted_by: context.userId,
      status: "pending",
    });
    if (error) throw new Error("Could not save your submission. Please try again.");
    return { ok: true };
  });

/** A supporter's own submissions (any status), so they can track review state. */
export const listMyContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("cms_content")
      .select("*")
      .eq("submitted_by", context.userId)
      .order("created_at", { ascending: false });
    return { items: (data ?? []).map(mapRow) };
  });

// ---------------- Admin queue ----------------

export const adminListContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        status: statusEnum.optional(),
        contentType: contentTypeEnum.optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = context.supabase
      .from("cms_content")
      .select("*")
      .order("created_at", { ascending: false });
    if (data.status) q = q.eq("status", data.status);
    if (data.contentType) q = q.eq("content_type", data.contentType);
    const { data: rows } = await q;
    return { items: (rows ?? []).map(mapRow) };
  });

/** Count of pending CMS items — feeds the admin notification badge. */
export const getCmsPendingCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { count } = await context.supabase
      .from("cms_content")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    return { count: count ?? 0 };
  });

export const adminApproveContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("cms_content")
      .update({
        status: "approved",
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
        review_note: null,
      })
      .eq("id", data.id);
    if (error) throw new Error("Could not approve.");
    return { ok: true };
  });

export const adminRejectContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), note: z.string().trim().max(1000).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("cms_content")
      .update({
        status: "rejected",
        review_note: data.note || null,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error("Could not reject.");
    return { ok: true };
  });

const editSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(5).max(5000),
  category: z.string().trim().max(80).optional().nullable().or(z.literal("")),
  externalUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
  attachmentUrl: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
});

/** Admin edit — correct typos / update info (e.g. before approving). */
export const adminUpdateContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => editSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("cms_content")
      .update({
        title: data.title,
        description: data.description,
        category: data.category || null,
        external_url: data.externalUrl || null,
        attachment_url: data.attachmentUrl || null,
      })
      .eq("id", data.id);
    if (error) throw new Error("Could not save changes.");
    return { ok: true };
  });

export const adminDeleteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await context.supabase.from("cms_content").delete().eq("id", data.id);
    return { ok: true };
  });
