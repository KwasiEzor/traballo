import Link from "next/link";
import { ShieldCheck, MapPin, FileCheck2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductFrame } from "@/components/marketing/product-frame";
import { DashboardMock } from "@/components/marketing/mockups";
import { APP_URL } from "@/lib/marketing/nav";

const trust = [
  { icon: MapPin, label: "Données hébergées en Europe" },
  { icon: FileCheck2, label: "Factur-X & PEPPOL" },
  { icon: ShieldCheck, label: "Sans engagement" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="container-page relative pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mx-auto bg-card">
            <span className="size-1.5 rounded-full bg-primary" />
            Facturation électronique obligatoire dès 2026
          </Badge>

          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl md:text-6xl">
            Tout votre business d&apos;artisan.
            <span className="block text-primary">Un seul tableau de bord.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
            Site web professionnel, factures conformes Factur-X, agent IA qui
            répond à vos clients 24&nbsp;h/24 et rendez-vous automatisés. Prêt en
            30&nbsp;minutes, à partir de&nbsp;0&nbsp;€.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href={`${APP_URL}/auth/signup`}>
                Commencer gratuitement
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/tarifs">Voir les tarifs</Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {trust.map((t) => (
              <li key={t.label} className="flex items-center gap-2">
                <t.icon className="size-4 text-primary" />
                {t.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <ProductFrame>
            <DashboardMock />
          </ProductFrame>
          <div className="absolute -bottom-6 -left-4 hidden w-56 rounded-lg border border-border bg-card p-3 shadow-lg sm:block">
            <div className="flex items-center gap-2 text-xs font-medium text-success">
              <FileCheck2 className="size-4" />
              Facture transmise à PEPPOL
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              2026-0042 · accusé de réception reçu
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
