import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X, Trash2, Star, LogOut, Inbox, Mail, Users, Mic, ExternalLink, Bell, FileStack, Pencil, DollarSign, Download, PenLine, Link2 as LinkIcon, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import {
  getReviewCounts,
  listSubmissions,
  approveSubmission,
  rejectSubmission,
  deleteSubmission,
  listOffers,
  updateOfferStatus,
  listMessages,
  updateMessageStatus,
  listAdminProfiles,
  toggleProfileFeatured,
  deleteProfile,
  listAdminMedia,
  createMediaPost,
  deleteMediaPost,
  listAdminSiteLinks,
  createSiteLink,
  toggleSiteLink,
  deleteSiteLink,
  getAdminSiteSettings,
  setSiteSetting,
} from "@/lib/admin.functions";
import {
  adminListContent,
  adminApproveContent,
  adminRejectContent,
  adminUpdateContent,
  adminDeleteContent,
} from "@/lib/cms.functions";
import { adminListDonations } from "@/lib/donations.functions";
import { listSignatures } from "@/lib/public.functions";
import { cmsTypeLabel, CMS_CATEGORIES } from "@/lib/cms";
import { submissionTypeLabel, offerTypeLabel, MEDIA_KINDS } from "@/lib/media";
import { Slider } from "@/components/ui/slider";
import { readFraming, framingStyle, type HeroFraming } from "@/lib/hero-framing";
import heroFallback from "@/assets/hero.jpg";
import { useAuth } from "@/hooks/use-auth";
import { uploadSubmissionFile } from "@/lib/upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin | Mississippi Struggle" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const counts = useReviewCounts(isAdmin);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (loading) {
    return <div className="container-page py-24 text-center text-muted-foreground">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl">Admin access required</h1>
        <p className="mt-3 text-muted-foreground">
          Your account is signed in but has not been granted the admin role yet. Ask a site
          administrator to grant access.
        </p>
        <Button className="mt-6" variant="outline" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Admin dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and approve submissions, manage published content, and read incoming messages.
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>

      <Tabs defaultValue="content" className="mt-8">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="content">
            <FileStack className="mr-1.5 h-4 w-4" /> Content (CMS) <CountBadge n={counts.pendingContent} />
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Inbox className="mr-1.5 h-4 w-4" /> Submissions <CountBadge n={counts.pendingSubmissions} />
          </TabsTrigger>
          <TabsTrigger value="offers">
            <Users className="mr-1.5 h-4 w-4" /> Offers <CountBadge n={counts.newOffers} />
          </TabsTrigger>
          <TabsTrigger value="messages">
            <Mail className="mr-1.5 h-4 w-4" /> Messages <CountBadge n={counts.newMessages} />
          </TabsTrigger>
          <TabsTrigger value="profiles"><Users className="mr-1.5 h-4 w-4" /> Profiles</TabsTrigger>
          <TabsTrigger value="media"><Mic className="mr-1.5 h-4 w-4" /> Media</TabsTrigger>
          <TabsTrigger value="donations"><DollarSign className="mr-1.5 h-4 w-4" /> Donations</TabsTrigger>
          <TabsTrigger value="site"><LinkIcon className="mr-1.5 h-4 w-4" /> Links &amp; Background</TabsTrigger>

        </TabsList>

        <TabsContent value="content" className="mt-6"><CmsContentTab /></TabsContent>
        <TabsContent value="pending" className="mt-6"><SubmissionsTab /></TabsContent>
        <TabsContent value="offers" className="mt-6"><OffersTab /></TabsContent>
        <TabsContent value="messages" className="mt-6"><MessagesTab /></TabsContent>
        <TabsContent value="profiles" className="mt-6"><ProfilesTab /></TabsContent>
        <TabsContent value="media" className="mt-6"><MediaTab /></TabsContent>
        <TabsContent value="donations" className="mt-6"><DonationsTab /></TabsContent>
        <TabsContent value="site" className="mt-6"><SiteTab /></TabsContent>

      </Tabs>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{children}</p>;
}

type Counts = { pendingSubmissions: number; newOffers: number; newMessages: number; pendingContent: number };
const EMPTY_COUNTS: Counts = { pendingSubmissions: 0, newOffers: 0, newMessages: 0, pendingContent: 0 };

/**
 * Polls the unreviewed-item counts every 20s while an admin is viewing the
 * dashboard, and raises a toast notification whenever the total grows — so
 * new submissions surface without a manual refresh.
 */
function useReviewCounts(isAdmin: boolean): Counts {
  const fetchCounts = useServerFn(getReviewCounts);
  const { data } = useQuery({
    queryKey: ["admin-review-counts"],
    queryFn: () => fetchCounts(),
    enabled: isAdmin,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });

  const counts = data ?? EMPTY_COUNTS;
  const total = counts.pendingSubmissions + counts.newOffers + counts.newMessages + counts.pendingContent;
  const prevTotal = useRef<number | null>(null);

  useEffect(() => {
    if (prevTotal.current !== null && total > prevTotal.current) {
      const diff = total - prevTotal.current;
      toast.info(`${diff} new submission${diff === 1 ? "" : "s"} awaiting review`, {
        icon: <Bell className="h-4 w-4" />,
      });
    }
    prevTotal.current = total;
  }, [total]);

  return counts;
}

function CountBadge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <Badge variant="destructive" className="ml-1.5 h-5 min-w-5 justify-center px-1.5 text-[11px]">
      {n}
    </Badge>
  );
}


// ---------- Content (CMS) ----------
/**
 * Review queue for supporter-submitted CMS content (Resources, Legislation,
 * Community Proposals). Admins can approve, edit, reject, or delete each item.
 */
function CmsContentTab() {
  const qc = useQueryClient();
  const fetchList = useServerFn(adminListContent);
  const approveFn = useServerFn(adminApproveContent);
  const rejectFn = useServerFn(adminRejectContent);
  const updateFn = useServerFn(adminUpdateContent);
  const deleteFn = useServerFn(adminDeleteContent);

  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [editing, setEditing] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-content", filter],
    queryFn: () => fetchList({ data: { status: filter } }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-content"] });
    qc.invalidateQueries({ queryKey: ["admin-review-counts"] });
    qc.invalidateQueries({ queryKey: ["public-content"] });
  };

  const approve = useMutation({
    mutationFn: (id: string) => approveFn({ data: { id } }),
    onSuccess: () => { toast.success("Approved — now live on the public page."); invalidate(); },
    onError: () => toast.error("Could not approve."),
  });
  const reject = useMutation({
    mutationFn: (id: string) => rejectFn({ data: { id } }),
    onSuccess: () => { toast.success("Rejected."); invalidate(); },
    onError: () => toast.error("Could not reject."),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { toast.success("Deleted."); invalidate(); },
  });
  const save = useMutation({
    mutationFn: (v: any) => updateFn({ data: v }),
    onSuccess: () => { toast.success("Changes saved."); setEditing(null); invalidate(); },
    onError: () => toast.error("Could not save. Check that links are valid URLs."),
  });

  const rows = data?.items ?? [];

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
            {s[0].toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Empty>Loading…</Empty>
      ) : rows.length === 0 ? (
        <Empty>No {filter} content.</Empty>
      ) : (
        <div className="space-y-4">
          {rows.map((c: any) => (
            <Card key={c.id} className="shadow-[var(--shadow-card)]">
              <CardContent className="p-5">
                {editing?.id === c.id ? (
                  <CmsEditForm
                    item={editing}
                    busy={save.isPending}
                    onCancel={() => setEditing(null)}
                    onSave={(v) => save.mutate({ id: c.id, ...v })}
                  />
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{cmsTypeLabel(c.contentType)}</Badge>
                          {c.category && <Badge variant="outline">{c.category}</Badge>}
                        </div>
                        <h3 className="mt-2 text-lg font-semibold">{c.title}</h3>
                      </div>
                      <time className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</time>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{c.description}</p>
                    <div className="mt-2 flex flex-wrap gap-4">
                      {c.externalUrl && (
                        <a href={c.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:text-gold">
                          <ExternalLink className="h-3.5 w-3.5" /> External link
                        </a>
                      )}
                      {(c.attachmentSignedUrl || c.attachmentUrl) && (
                        <a href={c.attachmentSignedUrl || c.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:text-gold">
                          <ExternalLink className="h-3.5 w-3.5" /> {c.attachmentIsFile ? "Uploaded file" : "Attachment"}
                        </a>
                      )}
                    </div>
                    {c.reviewNote && <p className="mt-2 text-xs text-crimson">Note: {c.reviewNote}</p>}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {c.status !== "approved" && (
                        <Button size="sm" onClick={() => approve.mutate(c.id)} disabled={approve.isPending}>
                          <Check className="h-4 w-4" /> Approve
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                        <Pencil className="h-4 w-4" /> Edit
                      </Button>
                      {c.status !== "rejected" && (
                        <Button size="sm" variant="outline" onClick={() => reject.mutate(c.id)} disabled={reject.isPending}>
                          <X className="h-4 w-4" /> Reject
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => remove.mutate(c.id)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                      {c.status !== "pending" && (
                        <Badge variant={c.status === "approved" ? "default" : "destructive"} className="ml-auto">
                          {c.status}
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CmsEditForm({
  item,
  busy,
  onSave,
  onCancel,
}: {
  item: any;
  busy: boolean;
  onSave: (v: { title: string; description: string; category: string; externalUrl: string; attachmentUrl: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(item.title ?? "");
  const [description, setDescription] = useState(item.description ?? "");
  const [category, setCategory] = useState(item.category ?? "");
  const [externalUrl, setExternalUrl] = useState(item.externalUrl ?? "");
  const [attachmentUrl, setAttachmentUrl] = useState(item.attachmentUrl ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ title, description, category, externalUrl, attachmentUrl });
      }}
      className="space-y-4"
    >
      <Badge variant="secondary">{cmsTypeLabel(item.contentType)} · editing</Badge>
      <div>
        <Label htmlFor={`t-${item.id}`}>Title</Label>
        <Input id={`t-${item.id}`} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor={`cat-${item.id}`}>Category</Label>
        <select
          id={`cat-${item.id}`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">— None —</option>
          {CMS_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor={`d-${item.id}`}>Description</Label>
        <Textarea id={`d-${item.id}`} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={5000} className="mt-1.5" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`ex-${item.id}`}>External link</Label>
          <Input id={`ex-${item.id}`} type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} className="mt-1.5" placeholder="https://…" />
        </div>
        <div>
          <Label htmlFor={`at-${item.id}`}>Attachment link</Label>
          {item.attachmentIsFile ? (
            <div className="mt-1.5 flex items-center justify-between gap-2 rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              <span className="truncate">Uploaded file (kept as-is)</span>
              {item.attachmentSignedUrl && (
                <a href={item.attachmentSignedUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-primary hover:text-gold">
                  View
                </a>
              )}
            </div>
          ) : (
            <Input id={`at-${item.id}`} type="url" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} className="mt-1.5" placeholder="https://…" />
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}


function SubmissionsTab() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listSubmissions);
  const approveFn = useServerFn(approveSubmission);
  const rejectFn = useServerFn(rejectSubmission);
  const deleteFn = useServerFn(deleteSubmission);
  const [filter, setFilter] = useState("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-submissions", filter],
    queryFn: () => fetchList({ data: { status: filter } }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-submissions"] });
    qc.invalidateQueries({ queryKey: ["admin-review-counts"] });
  };

  const approve = useMutation({
    mutationFn: (id: string) => approveFn({ data: { id } }),
    onSuccess: () => { toast.success("Approved and published."); invalidate(); },
    onError: () => toast.error("Could not approve."),
  });
  const reject = useMutation({
    mutationFn: (id: string) => rejectFn({ data: { id } }),
    onSuccess: () => { toast.success("Rejected."); invalidate(); },
    onError: () => toast.error("Could not reject."),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { toast.success("Deleted."); invalidate(); },
  });

  const rows = data?.submissions ?? [];

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {["pending", "approved", "rejected"].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
            {s[0].toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>
      {isLoading ? (
        <Empty>Loading…</Empty>
      ) : rows.length === 0 ? (
        <Empty>No {filter} submissions.</Empty>
      ) : (
        <div className="space-y-4">
          {rows.map((s: any) => (
            <Card key={s.id} className="shadow-[var(--shadow-card)]">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Badge variant="secondary">{submissionTypeLabel(s.type)}</Badge>
                    <h3 className="mt-2 text-lg font-semibold">{s.title || s.person_name || "Untitled"}</h3>
                    {s.person_name && <p className="text-sm text-muted-foreground">Person: {s.person_name}{s.facility ? ` · ${s.facility}` : ""}</p>}
                  </div>
                  <time className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</time>
                </div>
                {s.body && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{s.body}</p>}
                {s.embed_url && (
                  <a href={s.embed_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:text-gold">
                    <ExternalLink className="h-3.5 w-3.5" /> External link
                  </a>
                )}
                {s.mediaSigned?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {s.mediaSigned.map((u: string, i: number) => (
                      <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
                        Attachment {i + 1}
                      </a>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  From {s.submitter_name || "anonymous"}{s.submitter_email ? ` · ${s.submitter_email}` : ""}
                </p>
                {s.review_note && <p className="mt-1 text-xs text-crimson">Note: {s.review_note}</p>}

                {s.status === "pending" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => approve.mutate(s.id)} disabled={approve.isPending}>
                      <Check className="h-4 w-4" /> Approve & publish
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reject.mutate(s.id)} disabled={reject.isPending}>
                      <X className="h-4 w-4" /> Reject
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove.mutate(s.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {s.status !== "pending" && (
                  <div className="mt-4 flex items-center gap-3">
                    <Badge variant={s.status === "approved" ? "default" : "destructive"}>{s.status}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => remove.mutate(s.id)}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Offers ----------
function OffersTab() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listOffers);
  const updateFn = useServerFn(updateOfferStatus);
  const { data, isLoading } = useQuery({ queryKey: ["admin-offers"], queryFn: () => fetchList() });
  const update = useMutation({
    mutationFn: (v: { id: string; status: string }) => updateFn({ data: v }),
    onSuccess: () => { toast.success("Updated."); qc.invalidateQueries({ queryKey: ["admin-offers"] }); qc.invalidateQueries({ queryKey: ["admin-review-counts"] }); },
  });
  const rows = data?.offers ?? [];
  if (isLoading) return <Empty>Loading…</Empty>;
  if (rows.length === 0) return <Empty>No volunteer or in-kind offers yet.</Empty>;
  return (
    <div className="space-y-4">
      {rows.map((o: any) => (
        <Card key={o.id} className="shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Badge variant="secondary">{offerTypeLabel(o.offer_type)}</Badge>
                <h3 className="mt-2 font-semibold">{o.name}</h3>
                <a href={`mailto:${o.email}`} className="text-sm text-primary hover:text-gold">{o.email}</a>
              </div>
              <Badge variant={o.status === "new" ? "default" : "secondary"}>{o.status}</Badge>
            </div>
            {o.details && <p className="mt-3 whitespace-pre-wrap text-sm">{o.details}</p>}
            <div className="mt-4 flex gap-2">
              {o.status !== "contacted" && (
                <Button size="sm" variant="outline" onClick={() => update.mutate({ id: o.id, status: "contacted" })}>Mark contacted</Button>
              )}
              {o.status !== "archived" && (
                <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: o.id, status: "archived" })}>Archive</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------- Messages ----------
function MessagesTab() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listMessages);
  const updateFn = useServerFn(updateMessageStatus);
  const { data, isLoading } = useQuery({ queryKey: ["admin-messages"], queryFn: () => fetchList() });
  const update = useMutation({
    mutationFn: (v: { id: string; status: string }) => updateFn({ data: v }),
    onSuccess: () => { toast.success("Updated."); qc.invalidateQueries({ queryKey: ["admin-messages"] }); qc.invalidateQueries({ queryKey: ["admin-review-counts"] }); },
  });
  const rows = data?.messages ?? [];
  if (isLoading) return <Empty>Loading…</Empty>;
  if (rows.length === 0) return <Empty>No messages yet.</Empty>;
  return (
    <div className="space-y-4">
      {rows.map((m: any) => (
        <Card key={m.id} className="shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{m.subject || "(no subject)"}</h3>
                <p className="text-sm text-muted-foreground">{m.name} · <a href={`mailto:${m.email}`} className="text-primary hover:text-gold">{m.email}</a></p>
              </div>
              <Badge variant={m.status === "new" ? "default" : "secondary"}>{m.status}</Badge>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
            <div className="mt-4 flex gap-2">
              {m.status !== "read" && <Button size="sm" variant="outline" onClick={() => update.mutate({ id: m.id, status: "read" })}>Mark read</Button>}
              {m.status !== "archived" && <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: m.id, status: "archived" })}>Archive</Button>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------- Profiles ----------
function ProfilesTab() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listAdminProfiles);
  const featureFn = useServerFn(toggleProfileFeatured);
  const deleteFn = useServerFn(deleteProfile);
  const { data, isLoading } = useQuery({ queryKey: ["admin-profiles"], queryFn: () => fetchList() });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-profiles"] });
  const feature = useMutation({
    mutationFn: (v: { id: string; featured: boolean }) => featureFn({ data: v }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { toast.success("Profile deleted."); invalidate(); },
  });
  const rows = data?.profiles ?? [];
  if (isLoading) return <Empty>Loading…</Empty>;
  if (rows.length === 0) return <Empty>No published profiles yet. Approve a profile submission to create one.</Empty>;
  return (
    <div className="space-y-3">
      {rows.map((p: any) => (
        <Card key={p.id} className="shadow-[var(--shadow-card)]">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <h3 className="font-semibold">{p.name} {p.featured && <Star className="ml-1 inline h-4 w-4 fill-gold text-gold" />}</h3>
              {p.facility && <p className="text-sm text-muted-foreground">{p.facility}</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => feature.mutate({ id: p.id, featured: !p.featured })}>
                {p.featured ? "Unfeature" : "Feature"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(p.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------- Media ----------
function MediaTab() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listAdminMedia);
  const createFn = useServerFn(createMediaPost);
  const deleteFn = useServerFn(deleteMediaPost);
  const { data, isLoading } = useQuery({ queryKey: ["admin-media"], queryFn: () => fetchList() });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-media"] });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState("podcast");
  const [embedUrl, setEmbedUrl] = useState("");

  const create = useMutation({
    mutationFn: () => createFn({ data: { title, description, kind, embedUrl } }),
    onSuccess: () => {
      toast.success("Media published.");
      setTitle(""); setDescription(""); setEmbedUrl("");
      invalidate();
    },
    onError: () => toast.error("Could not publish. Check the link is a valid URL."),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { toast.success("Removed."); invalidate(); },
  });

  const rows = data?.media ?? [];
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <Card className="shadow-[var(--shadow-card)]">
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold">Publish an episode or video</h3>
          <p className="mt-1 text-sm text-muted-foreground">Paste a YouTube, Spotify, or Apple Podcasts link.</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => { e.preventDefault(); create.mutate(); }}
          >
            <div>
              <Label htmlFor="m-title">Title</Label>
              <Input id="m-title" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="m-kind">Type</Label>
              <select id="m-kind" value={kind} onChange={(e) => setKind(e.target.value)} className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {MEDIA_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="m-url">Link</Label>
              <Input id="m-url" type="url" required value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} placeholder="https://…" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="m-desc">Description</Label>
              <Textarea id="m-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" rows={3} />
            </div>
            <Button type="submit" disabled={create.isPending}>Publish</Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Published media</h3>
        {isLoading ? <Empty>Loading…</Empty> : rows.length === 0 ? <Empty>No media yet.</Empty> : (
          <div className="space-y-3">
            {rows.map((m: any) => (
              <Card key={m.id} className="shadow-[var(--shadow-card)]">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <h4 className="font-semibold">{m.title}</h4>
                    <p className="text-xs text-muted-foreground">{m.kind} · {m.source}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => remove.mutate(m.id)}><Trash2 className="h-4 w-4" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ---------- Donations ----------
const usd = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/**
 * Donations dashboard: live totals, a filterable gift list, CSV export, and
 * the petition signature counter so fundraising and organizing momentum sit
 * side by side.
 */
function DonationsTab() {
  const fetchDonations = useServerFn(adminListDonations);
  const fetchSignatures = useServerFn(listSignatures);
  const [status, setStatus] = useState<"all" | "pending" | "succeeded" | "failed" | "refunded">("all");
  const [frequency, setFrequency] = useState<"all" | "once" | "monthly" | "annual">("all");
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-donations", status, frequency],
    queryFn: () => fetchDonations({ data: { status, frequency } }),
  });
  const { data: petition } = useQuery({
    queryKey: ["petition-signatures"],
    queryFn: () => fetchSignatures(),
    refetchInterval: 60_000,
  });

  const rows = (data?.donations ?? []).filter((d: any) => {
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return (
      (d.donor_name ?? "").toLowerCase().includes(needle) ||
      (d.donor_email ?? "").toLowerCase().includes(needle)
    );
  });

  function exportCsv() {
    const header = ["Date", "Donor", "Email", "Amount", "Frequency", "Status"];
    const lines = rows.map((d: any) =>
      [
        new Date(d.created_at).toISOString(),
        d.donor_name ?? "",
        d.donor_email ?? "",
        (d.amount_cents / 100).toFixed(2),
        d.frequency,
        d.status,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Raised all time", value: usd(stats?.totalCents ?? 0) },
          { label: "This month", value: usd(stats?.monthCents ?? 0) },
          { label: "Average gift", value: usd(stats?.avgCents ?? 0) },
          { label: "Recurring gifts", value: String(stats?.recurringCount ?? 0) },
          { label: "Petition signatures", value: (petition?.total ?? 0).toLocaleString() },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-display text-2xl font-bold text-primary tabular-nums">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="don-status">Status</Label>
          <select
            id="don-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="mt-1.5 h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {["all", "succeeded", "pending", "failed", "refunded"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="don-freq">Frequency</Label>
          <select
            id="don-freq"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as any)}
            className="mt-1.5 h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {["all", "once", "monthly", "annual"].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div className="min-w-52 flex-1">
          <Label htmlFor="don-search">Search donor</Label>
          <Input id="don-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or email" className="mt-1.5" />
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={!rows.length}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
        <Button asChild variant="outline">
          <a href="/petitions"><PenLine className="h-4 w-4" /> Petition page</a>
        </Button>
      </div>

      {isLoading ? (
        <Empty>Loading donations…</Empty>
      ) : rows.length === 0 ? (
        <Empty>No donations match these filters yet.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">Donation records</caption>
            <thead className="bg-muted text-left">
              <tr>
                <th scope="col" className="px-4 py-2 font-semibold">Date</th>
                <th scope="col" className="px-4 py-2 font-semibold">Donor</th>
                <th scope="col" className="px-4 py-2 font-semibold">Amount</th>
                <th scope="col" className="px-4 py-2 font-semibold">Frequency</th>
                <th scope="col" className="px-4 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d: any) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <span className="font-medium">{d.donor_name ?? "Anonymous"}</span>
                    <span className="block text-xs text-muted-foreground">{d.donor_email}</span>
                  </td>
                  <td className="px-4 py-2 tabular-nums">{usd(d.amount_cents)}</td>
                  <td className="px-4 py-2">{d.frequency}</td>
                  <td className="px-4 py-2">
                    <Badge variant={d.status === "succeeded" ? "default" : "secondary"}>{d.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


/**
 * Crop / position controls for the homepage hero image. Mobile and desktop are
 * framed independently so the focal point stays visible on both.
 */
function HeroFramingEditor({
  previewUrl,
  settings,
  save,
  onSaved,
}: {
  previewUrl: string;
  settings: Record<string, string> | undefined;
  save: (args: { data: { key: string; value: string | null } }) => Promise<unknown>;
  onSaved: () => void;
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [desktop, setDesktop] = useState<HeroFraming>(() => readFraming(settings, "desktop"));
  const [mobile, setMobile] = useState<HeroFraming>(() => readFraming(settings, "mobile"));
  const [saving, setSaving] = useState(false);

  // Re-sync when the saved settings load or change.
  useEffect(() => {
    setDesktop(readFraming(settings, "desktop"));
    setMobile(readFraming(settings, "mobile"));
  }, [settings]);

  const current = device === "desktop" ? desktop : mobile;
  const setCurrent = (patch: Partial<HeroFraming>) =>
    device === "desktop"
      ? setDesktop((f) => ({ ...f, ...patch }))
      : setMobile((f) => ({ ...f, ...patch }));

  async function persist() {
    setSaving(true);
    try {
      const entries: Array<[string, string]> = [
        ["hero_focus_x_desktop", String(desktop.x)],
        ["hero_focus_y_desktop", String(desktop.y)],
        ["hero_zoom_desktop", String(desktop.zoom)],
        ["hero_focus_x_mobile", String(mobile.x)],
        ["hero_focus_y_mobile", String(mobile.y)],
        ["hero_zoom_mobile", String(mobile.zoom)],
      ];
      for (const [key, value] of entries) await save({ data: { key, value } });
      toast.success("Hero framing saved.");
      onSaved();
    } catch (err: any) {
      toast.error(err?.message ?? "Could not save the framing.");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setDesktop({ x: 50, y: 50, zoom: 1 });
    setMobile({ x: 50, y: 50, zoom: 1 });
  }

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardContent className="p-5">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <ImageIcon className="h-4 w-4" aria-hidden="true" /> Crop &amp; position
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag the sliders until the focal point sits where you want it. Mobile and desktop are
          saved separately.
        </p>

        <div className="mt-4 inline-flex rounded-md border border-input p-1" role="group" aria-label="Choose device to frame">
          {(["desktop", "mobile"] as const).map((d) => (
            <Button
              key={d}
              type="button"
              size="sm"
              variant={device === d ? "default" : "ghost"}
              aria-pressed={device === d}
              onClick={() => setDevice(d)}
            >
              {d === "desktop" ? "Desktop" : "Mobile"}
            </Button>
          ))}
        </div>

        {/* Live preview at the hero's real aspect ratio for the chosen device */}
        <div
          className={`mt-4 overflow-hidden rounded-md border border-border ${device === "desktop" ? "aspect-[16/7] w-full" : "mx-auto aspect-[9/16] w-48"}`}
        >
          <img
            src={previewUrl}
            alt={`Hero preview for ${device}`}
            style={framingStyle(current)}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor={`focus-x-${device}`}>Horizontal focus — {Math.round(current.x)}%</Label>
            <Slider
              id={`focus-x-${device}`}
              className="mt-2"
              min={0}
              max={100}
              step={1}
              value={[current.x]}
              onValueChange={([v]) => setCurrent({ x: v })}
              aria-label="Horizontal focus"
            />
          </div>
          <div>
            <Label htmlFor={`focus-y-${device}`}>Vertical focus — {Math.round(current.y)}%</Label>
            <Slider
              id={`focus-y-${device}`}
              className="mt-2"
              min={0}
              max={100}
              step={1}
              value={[current.y]}
              onValueChange={([v]) => setCurrent({ y: v })}
              aria-label="Vertical focus"
            />
          </div>
          <div>
            <Label htmlFor={`zoom-${device}`}>Zoom — {current.zoom.toFixed(2)}x</Label>
            <Slider
              id={`zoom-${device}`}
              className="mt-2"
              min={1}
              max={3}
              step={0.05}
              value={[current.zoom]}
              onValueChange={([v]) => setCurrent({ zoom: v })}
              aria-label="Zoom"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" onClick={persist} disabled={saving}>
            {saving ? "Saving…" : "Save framing"}
          </Button>
          <Button type="button" variant="outline" onClick={reset} disabled={saving}>
            Reset to center
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Site links & background image ----------
function SiteTab() {
  const qc = useQueryClient();
  const fetchLinks = useServerFn(listAdminSiteLinks);
  const createFn = useServerFn(createSiteLink);
  const toggleFn = useServerFn(toggleSiteLink);
  const deleteFn = useServerFn(deleteSiteLink);
  const fetchSettings = useServerFn(getAdminSiteSettings);
  const saveSetting = useServerFn(setSiteSetting);

  const links = useQuery({ queryKey: ["admin-site-links"], queryFn: () => fetchLinks() });
  const settings = useQuery({ queryKey: ["admin-site-settings"], queryFn: () => fetchSettings() });

  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const create = useMutation({
    mutationFn: () => createFn({ data: { label, url, description, sortOrder: (links.data?.links.length ?? 0) + 1 } }),
    onSuccess: () => {
      toast.success("Link added to the homepage.");
      setLabel(""); setUrl(""); setDescription("");
      qc.invalidateQueries({ queryKey: ["admin-site-links"] });
    },
    onError: () => toast.error("Could not add the link. Check the URL is valid."),
  });
  const toggle = useMutation({
    mutationFn: (v: { id: string; active: boolean }) => toggleFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-site-links"] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { toast.success("Link removed."); qc.invalidateQueries({ queryKey: ["admin-site-links"] }); },
  });

  /** Upload a new homepage background and store its path in site settings. */
  async function handleBackground(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadSubmissionFile(file, "site");
      await saveSetting({ data: { key: "hero_image_path", value: path } });
      toast.success("Background image updated.");
      qc.invalidateQueries({ queryKey: ["admin-site-settings"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const clearBackground = useMutation({
    mutationFn: () => saveSetting({ data: { key: "hero_image_path", value: null } }),
    onSuccess: () => {
      toast.success("Reverted to the default background.");
      qc.invalidateQueries({ queryKey: ["admin-site-settings"] });
    },
  });

  const rows = links.data?.links ?? [];
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-6">
        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold">Add a homepage link</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Links appear as pulsing gold buttons in the hero section.
            </p>
            <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
              <div>
                <Label htmlFor="l-label">Button label</Label>
                <Input id="l-label" required maxLength={120} value={label} onChange={(e) => setLabel(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="l-url">URL</Label>
                <Input id="l-url" type="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="l-desc">Short description (optional)</Label>
                <Input id="l-desc" maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" />
              </div>
              <Button type="submit" disabled={create.isPending}>Add link</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <ImageIcon className="h-4 w-4" aria-hidden="true" /> Homepage background image
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">JPG or PNG, up to 20MB. Wide images (1920×1080) work best.</p>
            {settings.data?.heroPreviewUrl && (
              <img
                src={settings.data.heroPreviewUrl}
                alt="Current homepage background"
                className="mt-4 aspect-video w-full rounded-md object-cover"
              />
            )}
            <div className="mt-4 space-y-3">
              <Label htmlFor="hero-file">Upload a new background</Label>
              <Input
                id="hero-file"
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => handleBackground(e.target.files?.[0])}
              />
              {settings.data?.settings?.hero_image_path && (
                <Button variant="outline" size="sm" onClick={() => clearBackground.mutate()}>
                  Use default image
                </Button>
              )}
              {uploading && <p className="text-sm text-muted-foreground">Uploading…</p>}
            </div>
          </CardContent>
        </Card>

        <HeroFramingEditor
          previewUrl={settings.data?.heroPreviewUrl ?? heroFallback}
          settings={settings.data?.settings}
          onSaved={() => qc.invalidateQueries({ queryKey: ["admin-site-settings"] })}
          save={saveSetting}
        />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Homepage links</h3>
        {links.isLoading ? <Empty>Loading…</Empty> : rows.length === 0 ? <Empty>No links yet.</Empty> : (
          <div className="space-y-3">
            {rows.map((l: any) => (
              <Card key={l.id} className="shadow-[var(--shadow-card)]">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <h4 className="font-semibold">{l.label}</h4>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-primary hover:underline">
                      {l.url}
                    </a>
                    {l.description && <p className="mt-1 text-xs text-muted-foreground">{l.description}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={l.active ? `Hide ${l.label}` : `Show ${l.label}`}
                      onClick={() => toggle.mutate({ id: l.id, active: !l.active })}
                    >
                      {l.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" aria-label={`Delete ${l.label}`} onClick={() => remove.mutate(l.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
