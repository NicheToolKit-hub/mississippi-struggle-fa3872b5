import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const socials = [
  { label: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { label: "Twitter / X", icon: Twitter, href: "https://twitter.com" },
  { label: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { label: "YouTube", icon: Youtube, href: "https://youtube.com" },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  /** Newsletter sign-up. Wire to Lovable Cloud / Supabase `subscribers` table later. */
  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail("");
  }

  return (
    <footer className="mt-20 border-t border-border bg-primary text-primary-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" width={40} height={40} loading="lazy" className="h-10 w-10" />
            <span className="font-display text-lg font-bold">Mississippi Struggle</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/75">
            A community-driven coalition fighting for a fairer, more humane justice
            system across the state of Mississippi.
          </p>
          <div className="mt-5 flex gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-foreground/10 transition-colors hover:bg-gold hover:text-gold-foreground"
              >
                <s.icon className="h-5 w-5" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer" className="text-sm">
          <h2 className="font-display text-base font-bold">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-primary-foreground/75">
            <li><Link to="/bills" className="hover:text-gold">Bills &amp; Laws</Link></li>
            <li><Link to="/education" className="hover:text-gold">Education &amp; Law</Link></li>
            <li><Link to="/petitions" className="hover:text-gold">Petitions</Link></li>
            <li><Link to="/resources" className="hover:text-gold">Resources</Link></li>
            <li><Link to="/donate" className="hover:text-gold">Donate</Link></li>
          </ul>
        </nav>

        <div className="text-sm">
          <h2 className="font-display text-base font-bold">Contact</h2>
          <ul className="mt-4 space-y-3 text-primary-foreground/75">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span>200 Justice Way, Suite 4<br />Jackson, MS 39201</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <a href="tel:+16015550199" className="hover:text-gold">(601) 555-0199</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <a href="mailto:hello@msstruggle.org" className="hover:text-gold">hello@msstruggle.org</a>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <h2 className="font-display text-base font-bold">Stay informed</h2>
          <p className="mt-4 text-primary-foreground/75">
            Get reform updates, action alerts, and legislative news.
          </p>
          <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-2">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <Input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50"
            />
            <Button type="submit" variant="donate">Subscribe</Button>
            {done && (
              <p role="status" className="text-xs text-gold">
                Thanks for subscribing — check your inbox to confirm.
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-primary-foreground/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Mississippi Struggle Prison Reform Initiative.
            A registered 501(c)(3) nonprofit. EIN 00-0000000. Contributions are
            tax-deductible to the extent allowed by law.
          </p>
          <p className="text-primary-foreground/50">
            This is a demonstration site. Statistics and donor data are illustrative.
          </p>
        </div>
      </div>
    </footer>
  );
}
