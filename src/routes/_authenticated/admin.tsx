import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X, Trash2, Star, LogOut, Inbox, Mail, Users, Mic, ExternalLink, Bell } from "lucide-react";
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
} from "@/lib/admin.functions";
import { submissionTypeLabel, offerTypeLabel, MEDIA_KINDS } from "@/lib/media";
import { useAuth } from "@/hooks/use-auth";
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

      <Tabs defaultValue="pending" className="mt-8">
        <TabsList className="flex flex-wrap">
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
        </TabsList>

        <TabsContent value="pending" className="mt-6"><SubmissionsTab /></TabsContent>
        <TabsContent value="offers" className="mt-6"><OffersTab /></TabsContent>
        <TabsContent value="messages" className="mt-6"><MessagesTab /></TabsContent>
        <TabsContent value="profiles" className="mt-6"><ProfilesTab /></TabsContent>
        <TabsContent value="media" className="mt-6"><MediaTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{children}</p>;
}

type Counts = { pendingSubmissions: number; newOffers: number; newMessages: number };
const EMPTY_COUNTS: Counts = { pendingSubmissions: 0, newOffers: 0, newMessages: 0 };

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
  const total = counts.pendingSubmissions + counts.newOffers + counts.newMessages;
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


// ---------- Submissions ----------
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
    onSuccess: () => { toast.success("Updated."); qc.invalidateQueries({ queryKey: ["admin-offers"] }); },
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
    onSuccess: () => { toast.success("Updated."); qc.invalidateQueries({ queryKey: ["admin-messages"] }); },
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
