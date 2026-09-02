import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Mail, MapPin } from "lucide-react";
import { submitContact } from "@/lib/public.functions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Mississippi Struggle" },
      {
        name: "description",
        content:
          "Get in touch with the Mississippi Struggle Prison Reform Initiative. Email Mississippi.Struggle@gmail.com or send us a message.",
      },
      { property: "og:title", content: "Contact | Mississippi Struggle" },
      { property: "og:description", content: "Reach the Mississippi Struggle team." },
      { property: "og:url", content: "https://mississippi-struggle.lovable.app/contact" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://mississippi-struggle.lovable.app/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await submitContact({ data: { name, email, subject: subject || null, message } });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Contact our team"
        description="Questions, partnerships, media inquiries, or support — we'd love to hear from you."
      />

      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1.3fr_0.7fr]">
        <section>
          {done ? (
            <Card className="border-success/30 bg-success/5">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
                <h2 className="mt-4 text-2xl">Message sent</h2>
                <p className="mt-2 text-muted-foreground">
                  Thank you for reaching out. Our team will respond as soon as we can.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => { setDone(false); setName(""); setEmail(""); setSubject(""); setMessage(""); }}>
                  Send another
                </Button>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="c-name">Name</Label>
                  <Input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="c-email">Email</Label>
                  <Input id="c-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="c-subject">Subject</Label>
                <Input id="c-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={160} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="c-message">Message</Label>
                <Textarea id="c-message" required value={message} onChange={(e) => setMessage(e.target.value)} maxLength={3000} rows={6} className="mt-1.5" />
              </div>
              {error && <p role="alert" className="text-sm text-crimson">{error}</p>}
              <Button type="submit" size="lg" variant="donate" disabled={busy}>
                {busy ? "Sending…" : "Send message"}
              </Button>
            </form>
          )}
        </section>

        <aside className="space-y-4">
          <Card className="bg-secondary">
            <CardContent className="p-6">
              <h2 className="text-lg">Reach us directly</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  <a href="mailto:Mississippi.Struggle@gmail.com" className="text-primary hover:text-gold break-all">
                    Mississippi.Struggle@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  <span className="text-muted-foreground">Jackson, Mississippi</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
