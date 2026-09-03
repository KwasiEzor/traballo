import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { FOOTER_NAV } from "@/lib/marketing/nav";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Le business pack des artisans francophones. Site web, factures
              conformes, agent IA et rendez-vous — dans un seul tableau de bord.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              France · Belgique · Luxembourg
            </p>
          </div>

          {FOOTER_NAV.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {year} Traballo. Tous droits réservés.</p>
          <p>
            Conforme à la facturation électronique{" "}
            <span className="text-foreground">2026 / 2027</span> (Factur-X · PEPPOL).
          </p>
        </div>
      </div>
    </footer>
  );
}
