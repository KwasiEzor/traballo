import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";

// Auth pages are served on app.<rootDomain>, where middleware rewrites "/"
// to the (authenticated) dashboard — so "back to home" must point at the
// marketing site's root domain explicitly, not a relative "/".
const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.pro";
const homeUrl = `https://${rootDomain}`;

/**
 * Two-pane auth layout: form on the left, an institutional-trust panel on the
 * right. On mobile the right panel collapses.
 */
export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link href={homeUrl} className="w-fit rounded-md">
            <Logo />
          </Link>
          <Link
            href={homeUrl}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Retour à l&apos;accueil
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
            <div className="mt-8">{children}</div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Traballo ·{" "}
          <Link href="/cgu" className="hover:text-foreground">
            Conditions
          </Link>{" "}
          ·{" "}
          <Link href="/confidentialite" className="hover:text-foreground">
            Confidentialité
          </Link>
        </p>
      </div>

      <div className="relative hidden overflow-hidden border-l border-border bg-primary lg:block">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.15]" />
        <div className="relative flex h-full flex-col justify-center px-14 text-primary-foreground">
          <blockquote className="max-w-md">
            <p className="font-display text-2xl font-medium leading-snug text-balance">
              « En une demi-heure j&apos;avais un site propre et des factures aux
              normes. Un seul abonnement au lieu de cinq. »
            </p>
            <footer className="mt-6 text-sm text-primary-foreground/70">
              Luca F. — Électricien indépendant, Luxembourg
            </footer>
          </blockquote>

          <ul className="mt-12 space-y-3 text-sm text-primary-foreground/80">
            {[
              "Données hébergées en Europe (RGPD)",
              "Factures conformes Factur-X & PEPPOL",
              "Sans engagement, résiliable à tout moment",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <span className="grid size-5 place-items-center rounded-full bg-primary-foreground/15">
                  <svg viewBox="0 0 20 20" className="size-3" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 10a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
