import * as React from "react";
import Link from "next/link";
import { Section } from "@/components/marketing/section";

export function LegalPage({
  title,
  updatedAt,
  children,
  toc,
}: {
  title: string;
  updatedAt: string;
  toc?: { id: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <Section className="pt-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Informations légales
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dernière mise à jour : {updatedAt}
        </p>

        {toc && (
          <nav className="mt-8 rounded-xl border border-border bg-muted/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sommaire
            </p>
            <ol className="mt-3 space-y-1.5 text-sm">
              {toc.map((t, i) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className="text-primary hover:underline"
                  >
                    {i + 1}. {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="mt-10 space-y-10">{children}</div>

        <div className="mt-14 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Une question sur ce document ?{" "}
          <Link href="/contact" className="font-medium text-primary hover:underline">
            Contactez-nous
          </Link>
          .
        </div>
      </div>
    </Section>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
