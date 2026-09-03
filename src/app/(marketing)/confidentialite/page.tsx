import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      updatedAt="1er septembre 2026"
      toc={[
        { id: "roles", label: "Rôles : responsable et sous-traitant" },
        { id: "donnees", label: "Données traitées" },
        { id: "finalites", label: "Finalités et bases légales" },
        { id: "sous-traitants", label: "Sous-traitants et hébergement" },
        { id: "duree", label: "Durée de conservation" },
        { id: "droits", label: "Vos droits" },
        { id: "securite", label: "Sécurité" },
      ]}
    >
      <p className="rounded-lg border border-warning/30 bg-warning-subtle p-4 text-sm text-warning-foreground">
        Modèle à faire valider par un DPO ou un conseil. Les sous-traitants et
        durées indiqués doivent être vérifiés et tenus à jour.
      </p>

      <LegalSection id="roles" title="1. Rôles : responsable et sous-traitant">
        <p>
          Pour les données des <strong>artisans utilisateurs</strong> (compte,
          facturation de l&apos;abonnement, usage du service), la société éditrice
          de Traballo agit en qualité de <strong>responsable de traitement</strong>.
        </p>
        <p>
          Pour les données des <strong>clients des artisans</strong> (carnet de
          contacts, destinataires de factures, visiteurs échangeant avec
          l&apos;agent IA), Traballo agit en qualité de{" "}
          <strong>sous-traitant</strong> au sens de l&apos;article 28 du RGPD :
          l&apos;artisan est responsable de traitement, Traballo traite ces
          données uniquement sur ses instructions et pour lui fournir le service.
        </p>
      </LegalSection>

      <LegalSection id="donnees" title="2. Données traitées">
        <ul className="ml-4 list-disc space-y-1.5">
          <li>
            <strong>Compte :</strong> nom de l&apos;entreprise, nom du dirigeant,
            e-mail, mot de passe (haché), rôle.
          </li>
          <li>
            <strong>Profil professionnel :</strong> adresse, téléphone, WhatsApp,
            numéro de TVA, IBAN, logo, métier.
          </li>
          <li>
            <strong>Abonnement :</strong> plan, identifiants Stripe client et
            abonnement (aucune donnée de carte n&apos;est stockée par Traballo).
          </li>
          <li>
            <strong>Contenu métier :</strong> clients, devis, factures,
            rendez-vous, configuration du site et de l&apos;agent IA,
            conversations.
          </li>
          <li>
            <strong>Techniques :</strong> journaux de connexion, adresse IP,
            agent utilisateur, à des fins de sécurité.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="finalites" title="3. Finalités et bases légales">
        <ul className="ml-4 list-disc space-y-1.5">
          <li>
            Fourniture du service et exécution du contrat —{" "}
            <em>exécution contractuelle</em>.
          </li>
          <li>
            Facturation et obligations comptables —{" "}
            <em>obligation légale</em>.
          </li>
          <li>
            Sécurité, prévention de la fraude, journalisation —{" "}
            <em>intérêt légitime</em>.
          </li>
          <li>
            Communications d&apos;information sur le service — <em>intérêt légitime</em>,
            avec possibilité d&apos;opposition.
          </li>
          <li>
            Cookies de mesure d&apos;audience éventuels — <em>consentement</em>{" "}
            (voir la <a href="/cookies">politique cookies</a>).
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="sous-traitants" title="4. Sous-traitants et hébergement">
        <p>
          Les données sont hébergées et traitées dans l&apos;Union européenne.
          Principaux sous-traitants :
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li><strong>Vercel</strong> — hébergement applicatif (régions UE).</li>
          <li><strong>Neon</strong> — base de données PostgreSQL (Francfort).</li>
          <li><strong>Resend</strong> — envoi d&apos;e-mails transactionnels (UE).</li>
          <li><strong>Stripe</strong> — traitement des paiements d&apos;abonnement.</li>
          <li>
            <strong>Anthropic</strong> — modèle de langage de l&apos;agent IA, sans
            réutilisation des données pour l&apos;entraînement.
          </li>
        </ul>
        <p>
          Chaque sous-traitant est lié par un accord de traitement conforme au
          RGPD.
        </p>
      </LegalSection>

      <LegalSection id="duree" title="5. Durée de conservation">
        <ul className="ml-4 list-disc space-y-1.5">
          <li>Compte actif : pendant toute la durée d&apos;utilisation du service.</li>
          <li>
            Après suppression du compte : effacement des données personnelles sous
            30 jours.
          </li>
          <li>
            Factures et pièces comptables : conservées selon la durée légale
            applicable (généralement 10 ans).
          </li>
          <li>Journaux techniques : 12 mois maximum.</li>
        </ul>
      </LegalSection>

      <LegalSection id="droits" title="6. Vos droits">
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification,
          d&apos;effacement, de limitation, d&apos;opposition et de portabilité.
          Vous pouvez exercer ces droits à tout moment :
        </p>
        <ul className="ml-4 list-disc space-y-1.5">
          <li>
            depuis votre tableau de bord (export JSON / CSV, suppression du
            compte) ;
          </li>
          <li>
            par e-mail à <strong>privacy@traballo.pro</strong>.
          </li>
        </ul>
        <p>
          Vous pouvez également introduire une réclamation auprès de
          l&apos;autorité de contrôle compétente (CNIL en France, APD en
          Belgique, CNPD au Luxembourg).
        </p>
      </LegalSection>

      <LegalSection id="securite" title="7. Sécurité">
        <p>
          Traballo applique une isolation stricte des données entre comptes
          (Row-Level Security au niveau de la base), le chiffrement des connexions
          (TLS) et des sauvegardes régulières avec restauration à un instant
          donné. L&apos;accès aux données de production est limité et journalisé.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
