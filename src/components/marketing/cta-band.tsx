import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/lib/marketing/nav";

export function CtaBand({
  title = "Votre activité en ligne aujourd'hui, pas dans trois mois.",
  subtitle = "Créez votre compte gratuitement. Aucune carte bancaire requise.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="border-t border-border bg-primary text-primary-foreground">
      <div className="container-page py-16 text-center sm:py-20">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:w-auto"
          >
            <a href={`${APP_URL}/auth/signup`}>
              Commencer gratuitement
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="w-full text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
          >
            <Link href="/contact">Parler à l&apos;équipe</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
