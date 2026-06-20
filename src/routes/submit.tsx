import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Upload, ShieldCheck } from "lucide-react";
import { createSubmission } from "@/lib/public.functions";
import { uploadSubmissionFile } from "@/lib/upload";
import { SUBMISSION_TYPES, MEDIA_KINDS } from "@/lib/media";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit Content | Mississippi Struggle" },
      {
        name: "description",
        content:
          "Submit a prisoner profile, artwork, book, certificate, accomplishment, story, podcast, or idea. Every submission is reviewed by our team before publishing.",
      },
      { property: "og:title", content: "Submit Content | Mississippi Struggle" },
      { property: "og:description", content: "Share work and stories for review by our team." },
    ],
  }),
  component: SubmitPage,
});

function SubmitPage() {
  const [type, setType] = useState<string>("profile");
  const [title, setTitle] = useState("");
  const [personName, setPersonName] = useState("");
  const [facility, setFacility] = useState("");
  const [year, setYear] = useState("");
  const [body, setBody] = useState("");
  const [mediaKind, setMediaKind] = useState("podcast");
  const [embedUrl, setEmbedUrl] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isMedia = type === "media";
  const showPerson = type !== "media" && type !== "idea";
  const acceptFiles = isMedia ? "audio/*,video/*" : "image/*,application/pdf";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const paths: string[] = [];
      if (files && files.length) {
        for (const f of Array.from(files).slice(0, 6)) {
          paths.push(await uploadSubmissionFile(f));
        }
      }
      await createSubmission({
        data: {
          type,
          title: title || null,
          body: body || null,
          personName: showPerson ? personName || null : null,
          facility: showPerson ? facility || null : null,
          year: year ? Number(year) : null,
          mediaKind: isMedia ? mediaKind : null,
          mediaPaths: paths,
          embedUrl: isMedia ? embedUrl || null : null,
          submitterName: submitterName || null,
          submitterEmail: submitterEmail || null,
        },
      });
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Share a story"
        title="Submit content for review"
        description="Honor someone's accomplishments, art, or writing — or share a podcast, video, or idea. Our team reviews every submission before anything appears on the site."
      />

      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1.4fr_0.8fr]">
        <section>
          {done ? (
            <Card className="border-success/30 bg-success/5">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
                <h2 className="mt-4 text-2xl">Thank you — submission received</h2>
                <p className="mt-2 text-muted-foreground">
                  Your submission is now pending review by our team. Approved content will be published
                  on the site. We may reach out using the contact details you provided.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Button variant="outline" onClick={() => { setDone(false); setTitle(""); setBody(""); setPersonName(""); setFacility(""); setYear(""); setEmbedUrl(""); setFiles(null); }}>
                    Submit another
                  </Button>
                  <Button asChild variant="donate">
                    <Link to="/profiles">View profiles</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="type">What are you submitting?</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {SUBMISSION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} className="mt-1.5" placeholder={isMedia ? "Episode or video title" : "A short title"} />
              </div>

              {showPerson && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="person">Person's name</Label>
                    <Input id="person" value={personName} onChange={(e) => setPersonName(e.target.value)} maxLength={160} className="mt-1.5" placeholder="Whose work is this?" />
                  </div>
                  <div>
                    <Label htmlFor="facility">Facility (optional)</Label>
                    <Input id="facility" value={facility} onChange={(e) => setFacility(e.target.value)} maxLength={160} className="mt-1.5" />
                  </div>
                </div>
              )}

              {isMedia && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="mkind">Media type</Label>
                    <select id="mkind" value={mediaKind} onChange={(e) => setMediaKind(e.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      {MEDIA_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="embed">Link (YouTube, Spotify…)</Label>
                    <Input id="embed" type="url" value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} className="mt-1.5" placeholder="https://… (or upload a file below)" />
                  </div>
                </div>
              )}

              {(type === "book" || type === "art" || type === "certificate" || type === "accomplishment") && (
                <div>
                  <Label htmlFor="year">Year (optional)</Label>
                  <Input id="year" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, ""))} maxLength={4} className="mt-1.5 max-w-[10rem]" />
                </div>
              )}

              <div>
                <Label htmlFor="body">Details</Label>
                <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} rows={5} className="mt-1.5" placeholder="Tell us about the work, the person, and why it matters." />
              </div>

              <div>
                <Label htmlFor="files">
                  {isMedia ? "Upload audio/video (optional if you pasted a link)" : "Upload images or PDF (optional)"}
                </Label>
                <div className="mt-1.5 flex items-center gap-3 rounded-md border border-dashed border-input p-4">
                  <Upload className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="files"
                    type="file"
                    multiple
                    accept={acceptFiles}
                    onChange={(e) => setFiles(e.target.files)}
                    className="text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Up to 6 files, 20MB each.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="sname">Your name (optional)</Label>
                  <Input id="sname" value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} maxLength={120} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="semail">Your email (optional)</Label>
                  <Input id="semail" type="email" value={submitterEmail} onChange={(e) => setSubmitterEmail(e.target.value)} maxLength={255} className="mt-1.5" />
                </div>
              </div>

              {error && <p role="alert" className="text-sm text-crimson">{error}</p>}

              <Button type="submit" size="lg" variant="donate" disabled={busy}>
                {busy ? "Submitting…" : "Submit for review"}
              </Button>
            </form>
          )}
        </section>

        <aside>
          <Card className="bg-secondary">
            <CardContent className="p-6">
              <ShieldCheck className="h-8 w-8 text-gold" aria-hidden="true" />
              <h2 className="mt-3 text-lg">How review works</h2>
              <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
                <li><strong className="text-foreground">1. You submit.</strong> Nothing is published automatically.</li>
                <li><strong className="text-foreground">2. We review.</strong> Our admins check every submission for accuracy and safety.</li>
                <li><strong className="text-foreground">3. We publish.</strong> Approved work appears on the profiles or media pages.</li>
              </ol>
              <p className="mt-4 text-xs text-muted-foreground">
                Questions? Email{" "}
                <a href="mailto:Mississippi.Struggle@gmail.com" className="text-primary hover:text-gold">Mississippi.Struggle@gmail.com</a>.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
