import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Primary site navigation. Links map 1:1 to the file-based routes. */
const navLinks = [
  { to: "/", label: "Home" },
  { to: "/profiles", label: "Voices Inside" },
  { to: "/bills", label: "Bills & Laws" },
  { to: "/proposals", label: "Proposals" },
  { to: "/education", label: "Education" },
  { to: "/petitions", label: "Petitions" },
  { to: "/resources", label: "Resources" },
  { to: "/podcast", label: "Podcast" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Mississippi Struggle home">
          <img src={logoAsset.url} alt="" width={40} height={40} className="h-10 w-10 shrink-0 object-contain" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-display text-base font-bold text-foreground">
              Mississippi Struggle
            </span>
            <span className="truncate text-[11px] uppercase tracking-widest text-muted-foreground">
              Prison Reform Initiative
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "text-foreground bg-accent" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="donate" size="default" className="hidden sm:inline-flex">
            <Link to="/donate">Donate Now</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border xl:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              activeProps={{ className: "text-foreground bg-accent" }}
              activeOptions={{ exact: link.to === "/" }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/submit"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Submit Content
          </Link>
          <Link
            to="/contribute"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Contribute (Supporters)
          </Link>
          <Button asChild variant="donate" className="mt-2">
            <Link to="/donate" onClick={() => setOpen(false)}>
              Donate Now
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
