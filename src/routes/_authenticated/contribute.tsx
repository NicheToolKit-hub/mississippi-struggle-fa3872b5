import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ShieldCheck, LogOut, FileText, Landmark, Lightbulb, Upload, X } from "lucide-react";
import { submitCmsContent, listMyContent } from "@/lib/cms.functions";
import { uploadSubmissionFile } from "@/lib/upload";
import { CMS_CONTENT_TYPES, CMS_CATEGORIES, cmsTypeLabel } from "@/lib/cms";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/contribute")({
  head: () => ({
    meta: [
      { title: "Contribute Content | Mississippi Struggle" },
      {
        name: "description",
        content:
          "Supporters can suggest resources, legislation, and community proposals. Every submission is reviewed by our admin team before it goes live.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ContributePage,
});

const TYPE_ICON: Record<string, typeof FileText> = {
  resource: FileText,
  legislation: Landmark,
  proposal: Lightbulb,
};

const SUCCESS_MESSAGE =
  "Thank you for your submission. It is currently under review by our administration team.";

function ContributePage() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const submitFn = useServerFn(submitCmsContent);
  const listFn = useServerFn(listMyContent);

  const [contentType, setContentType] = useState<string>("resource");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CMS_CATEGORIES[0]);
  const [externalUrl, setExternalUrl] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const mine = useQuery({ queryKey: ["my-content"], queryFn: () => listFn() });

  const submit = useMutation({
    mutationFn: async () => {
      // If the supporter attached a PDF/document, upload it first and store the
      // resulting private storage path in attachment_url (signed on read).
      let attachment = attachmentUrl || null;
      if (attachmentFile) {
        attachment = await uploadSubmissionFile(attachmentFile, "cms");
      }
      return submitFn({
        data: {
          contentType: contentType as "resource" | "legislation" | "proposal",
          title,
          description,
          category: category || null,
          externalUrl: externalUrl || null,
          attachmentUrl: attachment,
        },
      });
    },
    onSuccess: () => {
      setDone(true);
      setTitle("");
      setDescription("");
      setExternalUrl("");
      setAttachmentUrl("");
      setAttachmentFile(null);
      setFileError(null);
      qc.invalidateQueries({ queryKey: ["my-content"] });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > 20 * 1024 * 1024) {
      setFileError("File is too large (max 20MB).");
      e.target.value = "";
      return;
    }
    setAttachmentFile(f);
  }


  async function handleSignOut() {
    await signOut();
    navigate({ to: "/auth", replace: true });
  }

  const items = mine.data?.items ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Supporter Contribution"
        title="Suggest content for the community"
        description="Share a resource, a bill or law worth tracking, or a community proposal. Our admin team reviews everything before it appears on the public site."
      />

      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1.4fr_0.8fr]">
        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{user?.email}</span>
            </p>
            <div className="flex gap-2">
              {isAdmin && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin">Admin dashboard</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>

          {done ? (
            <Card className="border-success/30 bg-success/5">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
                <h2 className="mt-4 text-2xl">Submission received</h2>
                <p className="mx-auto mt-2 max-w-md text-muted-foreground">{SUCCESS_MESSAGE}</p>
                <div className="mt-6 flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setDone(false)}>
                    Submit another
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit.mutate();
              }}
              className="space-y-5"
            >
              <div>
                <Label htmlFor="ctype">What are you submitting?</Label>
                <select
                  id="ctype"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {CMS_CONTENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {CMS_CONTENT_TYPES.find((t) => t.value === contentType)?.blurb}
                </p>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={160}
                  className="mt-1.5"
                  placeholder="A clear, descriptive title"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {CMS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={5000}
                  rows={5}
                  className="mt-1.5"
                  placeholder="Explain what this is and why it matters to the community."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="external">External link (optional)</Label>
                  <Input
                    id="external"
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    maxLength={500}
                    className="mt-1.5"
                    placeholder="https://…"
                  />
                </div>
                <div>
                  <Label htmlFor="attachment">Attachment / PDF link (optional)</Label>
                  <Input
                    id="attachment"
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    disabled={!!attachmentFile}
                    maxLength={500}
                    className="mt-1.5"
                    placeholder="https://… (or upload a file below)"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="attachment-file">Upload a PDF or document (optional)</Label>
                {attachmentFile ? (
                  <div className="mt-1.5 flex items-center justify-between gap-3 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="truncate">{attachmentFile.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachmentFile(null)}
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-crimson"
                    >
                      <X className="h-4 w-4" aria-hidden="true" /> Remove
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="attachment-file"
                    className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input bg-background px-3 py-2.5 text-sm text-muted-foreground hover:border-gold hover:text-foreground"
                  >
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    Choose a PDF or document (max 20MB)
                  </label>
                )}
                <input
                  id="attachment-file"
                  type="file"
                  accept="application/pdf,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Uploaded files are stored securely and reviewed before publishing.
                </p>
                {fileError && (
                  <p role="alert" className="mt-1.5 text-sm text-crimson">
                    {fileError}
                  </p>
                )}
              </div>


              {submit.isError && (
                <p role="alert" className="text-sm text-crimson">
                  {submit.error instanceof Error
                    ? submit.error.message
                    : "Something went wrong. Please try again."}
                </p>
              )}

              <Button type="submit" size="lg" variant="donate" disabled={submit.isPending}>
                {submit.isPending ? "Submitting…" : "Submit for review"}
              </Button>
            </form>
          )}

          {/* The supporter's own submissions and their review status */}
          <div className="mt-12">
            <h2 className="text-xl">Your submissions</h2>
            {mine.isLoading ? (
              <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
            ) : items.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                You haven't submitted anything yet. Use the form above to suggest your first item.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {items.map((it: any) => {
                  const Icon = TYPE_ICON[it.contentType] ?? FileText;
                  return (
                    <li key={it.id}>
                      <Card className="shadow-[var(--shadow-card)]">
                        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                          <div className="flex items-start gap-3">
                            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                            <div>
                              <p className="font-semibold">{it.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {cmsTypeLabel(it.contentType)}
                                {it.category ? ` · ${it.category}` : ""}
                              </p>
                              {it.status === "rejected" && it.reviewNote && (
                                <p className="mt-1 text-xs text-crimson">Note: {it.reviewNote}</p>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={
                              it.status === "approved"
                                ? "default"
                                : it.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {it.status === "approved"
                              ? "Published"
                              : it.status === "rejected"
                                ? "Rejected"
                                : "Pending review"}
                          </Badge>
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <aside>
          <Card className="bg-secondary">
            <CardContent className="p-6">
              <ShieldCheck className="h-8 w-8 text-gold" aria-hidden="true" />
              <h2 className="mt-3 text-lg">How review works</h2>
              <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
                <li>
                  <strong className="text-foreground">1. You submit.</strong> Your item is saved as
                  pending. Nothing is published automatically.
                </li>
                <li>
                  <strong className="text-foreground">2. We review.</strong> An admin checks every
                  submission for accuracy and safety, and may edit for clarity.
                </li>
                <li>
                  <strong className="text-foreground">3. We publish.</strong> Approved items appear on
                  the Resources, Bills &amp; Laws, or Proposals pages.
                </li>
              </ol>
              <p className="mt-4 text-xs text-muted-foreground">
                Questions? Email{" "}
                <a
                  href="mailto:Mississippi.Struggle@gmail.com"
                  className="text-primary hover:text-gold"
                >
                  Mississippi.Struggle@gmail.com
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
