import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Bell,
  Palette,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  BarChart3,
  MessageSquare,
  Receipt,
  Download,
  MapPin,
  Clock,
  Globe,
  FileCheck2,
  Sparkles,
  CalendarDays,
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import { Section, SectionIntro } from "@/components/marketing/section";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { CtaBand } from "@/components/marketing/cta-band";
import { GrainGradient } from "@/components/marketing/grain-gradient";
import { DimensionMark } from "@/components/marketing/dimension-mark";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import {
  InvoiceMock,
  SiteMock,
  ChatMock,
  DashboardMock,
} from "@/components/marketing/mockups";

export const metadata: Metadata = {
  title: "Fonctionnalités",
  description:
    "Site web, facturation Factur-X / PEPPOL, agent IA, rendez-vous, carnet clients : le détail de tout ce que Traballo fait pour votre activité d'artisan.",
};

const PILLAR_LINKS = [
  { id: "site", icon: Globe, label: "Site web" },
  { id: "facturation", icon: FileCheck2, label: "Facturation" },
  { id: "agent-ia", icon: Sparkles, label: "Agent IA" },
  { id: "rendez-vous", icon: CalendarDays, label: "Rendez-vous" },
];

const showcase = [
  {
    id: "site",
    eyebrow: "Site web",
    title: "Un site professionnel, sans agence",
    description:
      "Choisissez un template à votre métier, ajustez le texte et les couleurs, publiez. Votre site est optimisé pour le mobile et le référencement local dès le départ.",
    points: [
      "Templates plomberie, électricité, nettoyage, BTP, jardinage…",
      "Sections hero, services, réalisations, avis, zone d'intervention, contact",
      "Boutons d'appel et de devis toujours accessibles",
      "Nom de domaine personnalisé et certificat HTTPS automatique (Pro)",
      "Formulaire de contact relié à votre boîte e-mail",
    ],
    frameUrl: "elec-martin.fr",
    visual: <SiteMock />,
  },
  {
    id: "facturation",
    eyebrow: "Facturation",
    title: "Devis, factures et conformité 2026 / 2027",
    description:
      "Un flux simple du devis à l'encaissement, avec la conformité e-facturation gérée pour vous : format Factur-X, transmission PEPPOL, numérotation légale.",
    points: [
      "Devis convertibles en facture en un clic",
      "Factur-X (PDF + XML) et envoi via le réseau PEPPOL",
      "Numérotation séquentielle continue, remise à zéro annuelle",
      "TVA multi-taux FR / BE / LU et mentions légales pré-remplies",
      "Relances automatiques et tableau de bord des impayés",
      "Export CSV, FEC et pièces pour votre comptable",
    ],
    frameUrl: "app.traballo.pro/factures",
    visual: <InvoiceMock />,
  },
  {
    id: "agent-ia",
    eyebrow: "Agent IA",
    title: "Un standard téléphonique qui écrit",
    description:
      "L'agent répond aux visiteurs de votre site à toute heure, dans le ton que vous choisissez. Il qualifie la demande, propose un créneau et vous transmet le lead.",
    points: [
      "Paramétrage guidé : services, tarifs indicatifs, zone, horaires, FAQ",
      "Ton personnalisable (tutoiement / vouvoiement, formel / direct)",
      "Ne communique jamais un prix ferme sans votre validation",
      "Capture nom, e-mail, téléphone et objet de la demande",
      "Notification immédiate par e-mail et dans le tableau de bord",
      "Disponible aussi sur WhatsApp Business (plan Business)",
    ],
    frameUrl: "elec-martin.fr",
    visual: <ChatMock />,
  },
  {
    id: "rendez-vous",
    eyebrow: "Rendez-vous",
    title: "Un agenda qui se remplit tout seul",
    description:
      "Définissez vos disponibilités hebdomadaires une fois. Vos clients réservent en ligne, reçoivent une confirmation et des rappels — vous validez d'un geste.",
    points: [
      "Créneaux calculés à partir de vos disponibilités réelles",
      "Confirmation et rappels automatiques par e-mail (Pro) et SMS (Business)",
      "Synchronisation Google Agenda dans les deux sens",
      "Statuts en attente / confirmé / terminé / annulé",
      "Historique par client relié au carnet de contacts",
    ],
    frameUrl: "app.traballo.pro/rendez-vous",
    visual: <DashboardMock />,
  },
];

const GRID = [
  { icon: Users, title: "Carnet de clients", text: "Fiches contacts, historique des factures et rendez-vous, notes internes." },
  { icon: Bell, title: "Notifications", text: "E-mail et SMS pour les nouveaux leads, RDV et paiements reçus." },
  { icon: Palette, title: "Votre identité", text: "Logo, couleur principale, appliqués au site, aux factures et aux e-mails." },
  { icon: Smartphone, title: "Mobile d'abord", text: "Tableau de bord et création de facture pensés pour le téléphone, sur le chantier." },
  { icon: ShieldCheck, title: "Isolation des données", text: "Chaque compte est cloisonné au niveau de la base de données (RLS)." },
  { icon: RefreshCw, title: "Réversibilité", text: "Export complet JSON / CSV à tout moment, aucune donnée prise en otage." },
  { icon: BarChart3, title: "Tableau de bord", text: "Encaissé, en attente, RDV de la semaine, activité du site en un coup d'œil." },
  { icon: MessageSquare, title: "Inbox unifiée", text: "Messages du site et de WhatsApp au même endroit (Business)." },
  { icon: Receipt, title: "Suivi des paiements", text: "Marquage payé, relances programmées, échéancier des impayés." },
  { icon: Download, title: "Export comptable", text: "Formats attendus par votre expert-comptable, sur la période de votre choix." },
  { icon: MapPin, title: "Zone d'intervention", text: "Affichée sur le site, utilisée par l'agent IA pour filtrer les demandes." },
  { icon: Clock, title: "Prêt en 30 minutes", text: "De l'inscription au site publié, sans formation." },
];

const WITHOUT = [
  "Un constructeur de site (16–45 €)",
  "Un logiciel de facturation (15–80 €)",
  "Un outil de prise de RDV (10–30 €)",
  "Un chatbot ou un secrétariat externalisé",
  "Des données éparpillées, ressaisies à la main",
];

const WITH = [
  "0 à 49 € par mois, tout compris",
  "Le client du site devient le contact du carnet",
  "Le devis accepté devient la facture",
  "Le lead de l'agent IA devient le rendez-vous",
  "Une seule connexion, un seul interlocuteur",
];

export default function FonctionnalitesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <GrainGradient />
        <div className="container-page relative py-20 text-center sm:py-24">
          <Reveal className="mx-auto flex max-w-2xl flex-col items-center">
            <DimensionMark label="Fonctionnalités" />
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              Tout ce qu&apos;il faut pour gérer votre activité
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground">
              Quatre outils principaux qui se parlent, et une multitude de
              détails pensés pour l&apos;artisan indépendant.
            </p>
          </Reveal>

          <RevealGroup className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-2">
            {PILLAR_LINKS.map((p) => (
              <RevealItem key={p.id}>
                <a
                  href={`#${p.id}`}
                  className="hover-lift inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground shadow-sm"
                >
                  <p.icon className="size-4 text-primary" />
                  {p.label}
                </a>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Les 4 piliers */}
      <Section className="pt-16 sm:pt-20">
        <FeatureShowcase items={showcase} />
      </Section>

      {/* Et aussi */}
      <Section className="border-y border-border bg-muted/40">
        <SectionIntro eyebrow="Et aussi" title="Les détails qui comptent" />
        <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GRID.map((f) => (
            <RevealItem key={f.title}>
              <Card className="hover-lift h-full rounded-2xl p-6">
                <div className="grid size-11 place-items-center rounded-lg bg-primary-subtle text-primary">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {f.text}
                </p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* La différence */}
      <Section>
        <SectionIntro
          eyebrow="La différence"
          title="Cinq abonnements qui s'ignorent, ou un seul outil cohérent"
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-muted/40 p-6 sm:p-7">
              <p className="text-sm font-semibold text-muted-foreground">
                Sans Traballo
              </p>
              <ul className="mt-4 space-y-3">
                {WITHOUT.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-[15px] text-muted-foreground"
                  >
                    <X className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative h-full overflow-hidden rounded-2xl border border-primary/25 bg-primary-subtle p-6 sm:p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-blueprint opacity-[0.4] [mask-image:radial-gradient(ellipse_70%_60%_at_100%_0%,black,transparent)]"
              />
              <div className="relative">
                <p className="text-sm font-semibold text-primary">
                  Avec Traballo
                </p>
                <ul className="mt-4 space-y-3">
                  {WITH.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-[15px] text-foreground"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-8">
          <Link
            href="/tarifs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Comparer les plans en détail
            <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </Section>

      <CtaBand
        title="Un seul outil, à la place de cinq"
        subtitle="Créez votre compte gratuitement et testez chaque fonctionnalité."
      />
    </>
  );
}
