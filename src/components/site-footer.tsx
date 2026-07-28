import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, LogIn, LogOut, ShieldCheck } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";


const socials = [
  { label: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { label: "Twitter / X", icon: Twitter, href: "https://twitter.com" },
  { label: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { label: "YouTube", icon: Youtube, href: "https://youtube.com" },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();

  async function handleTeamSignOut() {
    await signOut();
    router.invalidate();
  }


  /** Newsletter sign-up. Wire to a subscribers table later. */
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
            <img src={logoAsset.url} alt="" width={44} height={44} loading="lazy" className="h-11 w-11 object-contain" />
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
            <li><Link to="/profiles" className="hover:text-gold">Voices Inside</Link></li>
            <li><Link to="/bills" className="hover:text-gold">Bills &amp; Laws</Link></li>
            <li><Link to="/education" className="hover:text-gold">Education &amp; Law</Link></li>
            <li><Link to="/petitions" className="hover:text-gold">Petitions</Link></li>
            <li><Link to="/podcast" className="hover:text-gold">Podcast &amp; Video</Link></li>
            <li><Link to="/resources" className="hover:text-gold">Resources</Link></li>
          </ul>
        </nav>

        <div className="text-sm">
          <h2 className="font-display text-base font-bold">Get involved</h2>
          <ul className="mt-4 space-y-2.5 text-primary-foreground/75">
            <li><Link to="/submit" className="hover:text-gold">Submit content</Link></li>
            <li><Link to="/donate" className="hover:text-gold">Donate or volunteer</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact us</Link></li>
          </ul>
          <ul className="mt-5 space-y-3 text-primary-foreground/75">
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <a href="mailto:Mississippi.Struggle@gmail.com" className="hover:text-gold break-all">
                Mississippi.Struggle@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span>Jackson, Mississippi</span>
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

      <div className="border-t border-primary-foreground/15 bg-primary/95">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-primary-foreground/75 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 font-semibold uppercase tracking-widest text-primary-foreground/80">
            <ShieldCheck className="h-4 w-4 text-gold" aria-hidden="true" />
            Team member access
          </div>
          {user ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-primary-foreground/70 truncate max-w-[220px]">
                Signed in as {user.email}
              </span>
              {isAdmin && (
                <Link to="/admin" className="rounded px-2 py-1 font-semibold hover:text-gold">
                  Admin dashboard
                </Link>
              )}
              <button
                onClick={handleTeamSignOut}
                className="inline-flex items-center gap-1 rounded border border-primary-foreground/30 px-3 py-1.5 font-semibold hover:border-gold hover:text-gold"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Team sign out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1 rounded border border-primary-foreground/30 px-3 py-1.5 font-semibold hover:border-gold hover:text-gold"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" /> Team sign in
            </Link>
          )}
        </div>
        <div className="container-page pb-6 text-xs text-primary-foreground/55">
          © {new Date().getFullYear()} Mississippi Struggle Prison Reform Initiative.
          A registered 501(c)(3) nonprofit. EIN 00-0000000. Contributions are
          tax-deductible to the extent allowed by law.
        </div>
      </div>

    </footer>
  );
}
