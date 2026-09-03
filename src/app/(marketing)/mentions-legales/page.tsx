import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      updatedAt="1er septembre 2026"
      toc={[
        { id: "editeur", label: "Éditeur du site" },
        { id: "hebergement", label: "Hébergement" },
        { id: "propriete", label: "Propriété intellectuelle" },
        { id: "responsabilite", label: "Responsabilité" },
        { id: "contact", label: "Contact" },
      ]}
    >
      <p className="rounded-lg border border-warning/30 bg-warning-subtle p-4 text-sm text-warning-foreground">
        Modèle à compléter avec les informations réelles de la société éditrice
        (dénomination, forme juridique, capital, RCS / BCE, siège, numéro de TVA,
        directeur de la publication) avant mise en production, et à faire valider
        par un conseil juridique.
      </p>

      <LegalSection id="editeur" title="Éditeur du site">
        <p>
          Le site <strong>traballo.pro</strong> et l&apos;application Traballo
          sont édités par <strong>[Dénomination sociale]</strong>,{" "}
          <strong>[forme juridique]</strong> au capital de{" "}
          <strong>[montant]</strong>, immatriculée au{" "}
          <strong>[RCS / BCE n° …]</strong>, dont le siège social est situé{" "}
          <strong>[adresse complète]</strong>.
        </p>
        <p>
          Numéro de TVA intracommunautaire : <strong>[FR/BE… …]</strong>. Adresse
          e-mail : <strong>contact@traballo.pro</strong>. Directeur de la
          publication : <strong>[nom du représentant légal]</strong>.
        </p>
      </LegalSection>

      <LegalSection id="hebergement" title="Hébergement">
        <p>
          L&apos;application est hébergée par <strong>Vercel Inc.</strong>{" "}
          (340 S Lemon Ave #4133, Walnut, CA 91789, USA) pour la couche
          applicative, avec exécution et stockage des données dans des régions
          situées au sein de l&apos;Union européenne.
        </p>
        <p>
          La base de données est hébergée par <strong>Neon Inc.</strong> dans la
          région <strong>Europe (Francfort)</strong>. Les e-mails transactionnels
          sont acheminés par <strong>Resend</strong> (région UE).
        </p>
      </LegalSection>

      <LegalSection id="propriete" title="Propriété intellectuelle">
        <p>
          La structure du site, les textes, la charte graphique, le logo Traballo
          et les éléments logiciels sont la propriété exclusive de la société
          éditrice ou de ses partenaires, et sont protégés par le droit de la
          propriété intellectuelle. Toute reproduction ou représentation, totale
          ou partielle, sans autorisation écrite préalable, est interdite.
        </p>
        <p>
          Les contenus publiés par les artisans utilisateurs sur leur site
          (textes, photos, logo) restent leur propriété. Ils garantissent
          disposer des droits nécessaires à leur diffusion.
        </p>
      </LegalSection>

      <LegalSection id="responsabilite" title="Responsabilité">
        <p>
          La société éditrice s&apos;efforce d&apos;assurer l&apos;exactitude des
          informations diffusées sur le site vitrine, sans pouvoir en garantir
          l&apos;exhaustivité. Les informations relatives à la réglementation
          (facturation électronique, TVA) sont fournies à titre indicatif et ne
          constituent pas un conseil juridique ou comptable.
        </p>
        <p>
          Les conditions d&apos;utilisation du service applicatif sont détaillées
          dans les <a href="/cgu">Conditions générales d&apos;utilisation</a>.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Pour toute question relative au site ou au service :{" "}
          <strong>contact@traballo.pro</strong>. Pour les demandes relatives aux
          données personnelles : <strong>privacy@traballo.pro</strong>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
