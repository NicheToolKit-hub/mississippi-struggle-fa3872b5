import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Mic, Video, Upload } from "lucide-react";
import { listMediaPosts, createSubmission } from "@/lib/public.functions";
import { uploadSubmissionFile } from "@/lib/upload";
import { toEmbedUrl, MEDIA_KINDS } from "@/lib/media";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/podcast")({
  head: () => ({
    meta: [
      { title: "Podcast & Video | Mississippi Struggle" },
      {
        name: "description",
        content:
          "Listen and watch: voices from the movement for prison reform in Mississippi. Submit your own podcast episode or video for review.",
      },
      { property: "og:title", content: "Podcast & Video | Mississippi Struggle" },
      { property: "og:description", content: "Voices from the movement — audio and video." },
    ],
  }),
  loader: () => listMediaPosts(),
  component: PodcastPage,
  errorComponent: () => (
    <div className="container-page py-24 text-center text-muted-foreground">
      We couldn't load media right now. Please try again.
    </div>
  ),
});

type Post = {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  source: string;
  embedUrl: string | null;
  fileUrl: string | null;
  publishedAt: string;
};

function PodcastPage() {
  const { posts } = Route.useLoaderData() as { posts: Post[] };

  return (
    <>
      <PageHeader
        eyebrow="Podcast & Video"
        title="Voices from the movement"
        description="Conversations, testimony, and stories on justice and prison reform in Mississippi. Have something to share? Submit an episode or video for our team to review."
      />

      <div className="container-page py-16">
        {posts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <h2 className="text-xl">No episodes published yet</h2>
              <p className="mt-2 text-muted-foreground">Check back soon, or submit the first one below.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {posts.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
                <MediaPlayer post={p} />
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {p.kind === "video" ? <Video className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {p.kind}
                  </div>
                  <h2 className="mt-1.5 text-lg font-semibold">{p.title}</h2>
                  {p.description && <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>}
                </div>
              </article>
            ))}
          </div>
        )}

        <SubmitMedia />
      </div>
    </>
  );
}

function MediaPlayer({ post }: { post: Post }) {
  if (post.source === "upload" && post.fileUrl) {
    if (post.kind === "video") {
      return <video controls preload="metadata" className="aspect-video w-full bg-black" src={post.fileUrl} />;
    }
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-secondary p-6">
        <audio controls preload="metadata" className="w-full" src={post.fileUrl} />
      </div>
    );
  }
  const embed = toEmbedUrl(post.embedUrl);
  if (embed) {
    return (
      <iframe
        src={embed}
        title={post.title}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full border-0"
      />
    );
  }
  return <div className="flex aspect-video w-full items-center justify-center bg-secondary text-muted-foreground">Media unavailable</div>;
}

function SubmitMedia() {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("podcast");
  const [embedUrl, setEmbedUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!embedUrl && !file) {
      setError("Paste a link or upload a file.");
      return;
    }
    setBusy(true);
    try {
      const paths: string[] = [];
      if (file) paths.push(await uploadSubmissionFile(file, "media"));
      await createSubmission({
        data: {
          type: "media",
          title: title || null,
          body: description || null,
          mediaKind: kind,
          mediaPaths: paths,
          embedUrl: embedUrl || null,
          submitterName: name || null,
          submitterEmail: email || null,
        },
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-20 rounded-2xl bg-secondary p-8 md:p-12" aria-labelledby="submit-media-heading">
      <div className="mx-auto max-w-2xl">
        <h2 id="submit-media-heading" className="text-2xl md:text-3xl">Submit an episode or video</h2>
        <p className="mt-2 text-muted-foreground">
          Share a podcast or video link, or upload a file. Our team reviews every submission before it's published.
        </p>

        {done ? (
          <Card className="mt-6 border-success/30 bg-success/5">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
              <p className="mt-3 font-medium">Thank you! Your media is pending review.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setDone(false); setTitle(""); setEmbedUrl(""); setFile(null); setDescription(""); }}>
                Submit another
              </Button>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="pm-title">Title</Label>
              <Input id="pm-title" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pm-kind">Type</Label>
                <select id="pm-kind" value={kind} onChange={(e) => setKind(e.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {MEDIA_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="pm-url">Link</Label>
                <Input id="pm-url" type="url" value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} placeholder="https://…" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="pm-file">Or upload a file</Label>
              <div className="mt-1.5 flex items-center gap-3 rounded-md border border-dashed border-input p-4">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <input id="pm-file" type="file" accept="audio/*,video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
              </div>
            </div>
            <div>
              <Label htmlFor="pm-desc">Description</Label>
              <Textarea id="pm-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1.5" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pm-name">Your name (optional)</Label>
                <Input id="pm-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="pm-email">Your email (optional)</Label>
                <Input id="pm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            {error && <p role="alert" className="text-sm text-crimson">{error}</p>}
            <Button type="submit" variant="donate" disabled={busy}>{busy ? "Submitting…" : "Submit for review"}</Button>
          </form>
        )}
      </div>
    </section>
  );
}
