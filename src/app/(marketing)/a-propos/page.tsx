import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  Compass,
  Lock,
  Zap,
  Ear,
  FlaskConical,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { Section, SectionIntro, Eyebrow } from "@/components/marketing/section";
import { CtaBand } from "@/components/marketing/cta-band";
import { GrainGradient } from "@/components/marketing/grain-gradient";
import { DimensionMark } from "@/components/marketing/dimension-mark";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/lib/marketing/nav";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Traballo outille les artisans francophones qui font un travail excellent mais que le numérique désavantage. Notre mission, nos valeurs, notre approche.",
};

const VALUES = [
  {
    icon: Heart,
    title: "La dignité du travail bien fait",
    text: "Nos utilisateurs sont des experts de leur métier. L'outil doit être à leur service, jamais l'inverse. Rien dans Traballo ne suppose que vous avez du temps à perdre.",
  },
  {
    icon: Compass,
    title: "Simple par défaut",
    text: "Chaque écran est pensé pour quelqu'un qui n'aime pas les logiciels. Gros boutons, français clair, zéro jargon, une action évidente par page.",
  },
  {
    icon: Lock,
    title: "Vos données restent les vôtres",
    text: "Hébergement en Europe, isolation stricte entre comptes, export complet en un clic. On construit la fidélité par l'utilité, pas par la contrainte.",
  },
  {
    icon: Zap,
    title: "Conforme dès le premier jour",
    text: "La facturation électronique devient obligatoire. Plutôt que d'ajouter une couche de complexité, on l'absorbe : vous facturez normalement, le format est géré.",
  },
];

const MARKET = [
  { value: 1_000_000, prefix: "≈ ", label: "artisans inscrits en France (INSEE)" },
  { value: 180_000, prefix: "≈ ", label: "indépendants du BTP en Belgique" },
  {
    value: 400_000,
    prefix: "≈ ",
    label: "cibles qualifiées sur le marché adressable FR + BE",
  },
];

const APPROACH = [
  {
    n: "01",
    icon: Ear,
    title: "On écoute le terrain",
    text: "On passe du temps avec des plombiers, des électriciens, des entreprises de nettoyage. On regarde comment ils travaillent vraiment, pas comment on imagine qu'ils travaillent.",
  },
  {
    n: "02",
    icon: FlaskConical,
    title: "On teste chaque écran",
    text: "Aucune fonctionnalité ne sort sans avoir été mise entre les mains d'un artisan. Si l'action n'est pas évidente en trois secondes, on recommence.",
  },
  {
    n: "03",
    icon: Rocket,
    title: "On livre, puis on ajuste",
    text: "Des mises à jour fréquentes, guidées par les retours d'usage. Le produit s'améliore avec vous, à un rythme que vous n'avez pas à suivre.",
  },
];

export default function AProposPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <GrainGradient />
        <div className="container-page relative py-20 sm:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
            <Reveal>
              <DimensionMark label="À propos · Manifeste" />
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
                Le numérique fait pour ceux qui font
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
                Les artisans et les petites entreprises de service sont des
                professionnels hautement qualifiés. Dans l&apos;économie
                numérique, ils sont pourtant structurellement désavantagés :
                outils anglophones et coûteux, pensés pour des équipes de
                cinquante techniciens — ou bricolages entre papier, Excel et
                WhatsApp personnel.
              </p>
              <p className="mt-4 max-w-xl text-lg font-medium leading-relaxed text-pretty text-foreground">
                Traballo réunit le site web, la facturation conforme,
                l&apos;agent IA et les rendez-vous dans un seul tableau de bord —
                pour 0 à 49 € par mois, prêt en trente minutes, sans compétence
                technique.
              </p>
              <div className="mt-8">
                <Button asChild size="lg">
                  <a href={`${APP_URL}/auth/signup`}>
                    Créer un compte gratuit
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              </div>
            </Reveal>

            {/* Dictionary-entry card — the brand name, defined */}
            <Reveal delay={0.1}>
              <figure className="relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-lg">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-blueprint opacity-[0.35] [mask-image:radial-gradient(ellipse_80%_70%_at_100%_0%,black,transparent)]"
                />
                <div className="relative">
                  <DimensionMark label="étymologie" />
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-display text-2xl font-semibold text-foreground">
                      traballo
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      n.&nbsp;m.
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground text-pretty">
                    Du galicien et du portugais archaïque. Même racine que{" "}
                    <span className="text-foreground">travail</span>,{" "}
                    <span className="text-foreground">trabajo</span>,{" "}
                    <span className="text-foreground">trabalho</span>. Désigne
                    l&apos;ouvrage réalisé de ses mains — et la fierté qui va
                    avec.
                  </p>
                  <hr className="my-5 border-border" />
                  <p className="font-mono text-xs leading-relaxed text-copper">
                    « L&apos;outil doit être à leur service, pas l&apos;inverse. »
                  </p>
                </div>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Le constat */}
      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionIntro
            align="left"
            eyebrow="Le constat"
            title="Un excellent artisan ne devrait pas perdre un chantier pour une mauvaise présentation en ligne"
          />
          <div className="mt-8 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>
              C&apos;est pourtant ce qui arrive tous les jours : un plombier
              irréprochable passe après un concurrent moins bon mais mieux
              référencé. Une entreprise de nettoyage use ses soirées à répondre
              à des messages. Un électricien jongle avec cinq abonnements qui ne
              se parlent pas.
            </p>
            <blockquote className="border-l-2 border-copper pl-5">
              <p className="font-display text-xl font-medium text-foreground text-pretty">
                Le savoir-faire est là. Ce qui manque, c&apos;est un outil qui ne
                se met pas en travers.
              </p>
            </blockquote>
            <p>
              Traballo existe pour combler cet écart — sans transformer
              l&apos;artisan en gestionnaire de logiciels.
            </p>
          </div>
        </div>
      </Section>

      {/* Valeurs */}
      <Section className="border-y border-border bg-muted/40">
        <SectionIntro eyebrow="Ce qui nous guide" title="Nos partis pris" />
        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-2">
          {VALUES.map((v, i) => (
            <RevealItem key={v.title}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-primary-subtle opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
                />
                <div className="relative flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-lg bg-primary-subtle text-primary">
                    <v.icon className="size-5" />
                  </div>
                  <span className="font-mono text-xs font-medium text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="relative mt-4 font-display text-lg font-semibold text-foreground">
                  {v.title}
                </h3>
                <p className="relative mt-2 text-[15px] leading-relaxed text-muted-foreground text-pretty">
                  {v.text}
                </p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Marché */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <SectionIntro
            align="left"
            eyebrow="Marché"
            title="Un créneau que personne n'occupe"
            lede="Des centaines de milliers de professionnels, un calendrier réglementaire qui se resserre, et aucune offre pensée pour eux dans leur langue."
          />
          <RevealGroup className="grid gap-4 sm:grid-cols-2">
            {MARKET.map((s) => (
              <RevealItem key={s.label}>
                <div className="h-full rounded-xl border border-border bg-card p-5 shadow-sm">
                  <DimensionMark />
                  <div className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
                    <CountUp value={s.value} prefix={s.prefix} locale="fr-FR" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground text-pretty">
                    {s.label}
                  </p>
                </div>
              </RevealItem>
            ))}
            <RevealItem>
              <div className="flex h-full flex-col justify-center rounded-xl border border-copper/30 bg-copper-subtle p-5">
                <div className="font-display text-2xl font-semibold tracking-tight text-copper">
                  2026 – 2027
                </div>
                <p className="mt-1 text-sm text-copper/90 text-pretty">
                  calendrier d&apos;obligation de la facture électronique (BE
                  puis FR)
                </p>
              </div>
            </RevealItem>
          </RevealGroup>
        </div>
      </Section>

      {/* Notre approche */}
      <Section className="border-y border-border bg-muted/40">
        <SectionIntro
          eyebrow="Notre approche"
          title="Construit avec des artisans, pas seulement pour eux"
        />
        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {APPROACH.map((step) => (
            <RevealItem key={step.n}>
              <div className="relative h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
                <span className="font-mono text-sm font-semibold text-copper">
                  {step.n}
                </span>
                <div className="mt-3 grid size-11 place-items-center rounded-lg bg-primary-subtle text-primary">
                  <step.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground text-pretty">
                  {step.text}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Équipe */}
      <Section>
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>L&apos;équipe</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Une petite équipe, proche du terrain
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            Traballo est construit par des personnes qui parlent régulièrement à
            des artisans et testent chaque écran avec eux. Nous recrutons — si le
            projet vous parle, écrivez-nous.
          </p>
          <div className="mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">
                Nous écrire
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </Section>

      <CtaBand
        title="Rejoignez les artisans qui ont repris la main"
        subtitle="Créez votre compte gratuitement, gardez-le aussi longtemps que vous voulez."
      />
    </>
  );
}
