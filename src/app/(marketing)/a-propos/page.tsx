import type { Metadata } from "next";
import { Heart, Compass, Lock, Zap } from "lucide-react";
import { Section, SectionIntro } from "@/components/marketing/section";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Traballo outille les artisans francophones qui font un travail excellent mais que le numérique désavantage. Notre mission, nos valeurs, notre approche.",
};

const VALUES = [
  {
    icon: Heart,
    title: "La dignité du travail bien fait",
    text: "« Traballo » vient du galicien et du portugais archaïque : la racine commune de travail, trabajo, trabalho. Nos utilisateurs sont des experts de leur métier. L'outil doit être à leur service, pas l'inverse.",
  },
  {
    icon: Compass,
    title: "Simple par défaut",
    text: "Chaque écran est pensé pour quelqu'un qui n'a pas le temps et qui n'aime pas les logiciels. Gros boutons, français clair, zéro jargon, une action évidente par page.",
  },
  {
    icon: Lock,
    title: "Vos données restent les vôtres",
    text: "Hébergement en Europe, isolation stricte entre comptes, export complet en un clic. On ne construit pas de rétention par la contrainte, mais par l'utilité.",
  },
  {
    icon: Zap,
    title: "Conforme dès le premier jour",
    text: "La facturation électronique devient obligatoire. Plutôt que d'ajouter une couche de complexité, on l'absorbe : vous facturez normalement, le format est géré.",
  },
];

export default function AProposPage() {
  return (
    <>
      <Section className="border-b border-border">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            À propos
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Le numérique fait pour ceux qui font
          </h1>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>
              Les artisans et les petites entreprises de service sont des
              professionnels hautement qualifiés. Dans l&apos;économie numérique,
              ils sont pourtant structurellement désavantagés : outils anglophones
              et coûteux, pensés pour des équipes de cinquante techniciens, ou
              bricolages entre papier, Excel et WhatsApp personnel.
            </p>
            <p>
              Le résultat, c&apos;est un plombier excellent qui perd un chantier
              face à un concurrent moins bon mais mieux présenté en ligne. Une
              entreprise de nettoyage qui passe ses soirées à répondre à des
              messages. Un électricien qui jongle avec cinq abonnements.
            </p>
            <p className="font-medium text-foreground">
              Traballo réunit le site web, la facturation conforme, l&apos;agent
              IA et les rendez-vous dans un seul tableau de bord, pour 0 à 49 €
              par mois. Prêt en trente minutes, sans compétence technique.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <SectionIntro eyebrow="Ce qui nous guide" title="Nos partis pris" />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="grid size-11 place-items-center rounded-lg bg-primary-subtle text-primary">
                <v.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                {v.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {v.text}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-y border-border bg-muted/40">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <SectionIntro
            align="left"
            eyebrow="Marché"
            title="Un créneau que personne n'occupe"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { k: "≈ 1 000 000", v: "artisans inscrits en France (INSEE)" },
              { k: "≈ 180 000", v: "indépendants du BTP en Belgique" },
              { k: "≈ 400 000", v: "cibles qualifiées sur le marché adressable FR + BE" },
              { k: "2026 – 2027", v: "calendrier d'obligation de la facture électronique" },
            ].map((s) => (
              <div
                key={s.v}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="font-display text-2xl font-semibold text-foreground">
                  {s.k}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionIntro
            eyebrow="L'équipe"
            title="Une petite équipe, proche du terrain"
            lede="Traballo est construit par des personnes qui parlent régulièrement à des artisans et testent chaque écran avec eux. Nous recrutons — écrivez-nous si le projet vous parle."
          />
        </div>
      </Section>

      <CtaBand
        title="Rejoignez les artisans qui ont repris la main"
        subtitle="Créez votre compte gratuitement, gardez-le aussi longtemps que vous voulez."
      />
    </>
  );
}
