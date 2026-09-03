import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
};

export default function CguPage() {
  return (
    <LegalPage
      title="Conditions générales d'utilisation et de vente"
      updatedAt="1er septembre 2026"
      toc={[
        { id: "objet", label: "Objet" },
        { id: "compte", label: "Compte et éligibilité" },
        { id: "abonnement", label: "Abonnements et paiement" },
        { id: "obligations", label: "Obligations de l'utilisateur" },
        { id: "disponibilite", label: "Disponibilité du service" },
        { id: "donnees", label: "Données et réversibilité" },
        { id: "resiliation", label: "Résiliation" },
        { id: "responsabilite", label: "Responsabilité" },
        { id: "droit", label: "Droit applicable" },
      ]}
    >
      <p className="rounded-lg border border-warning/30 bg-warning-subtle p-4 text-sm text-warning-foreground">
        Modèle de travail. À adapter à la forme juridique et au pays
        d&apos;établissement de l&apos;éditeur, et à faire réviser par un avocat
        avant toute mise en production.
      </p>

      <LegalSection id="objet" title="1. Objet">
        <p>
          Les présentes conditions régissent l&apos;accès et l&apos;utilisation de
          la plateforme Traballo (le « Service »), qui met à disposition des
          artisans et petites entreprises un ensemble d&apos;outils : site web
          vitrine, facturation, prise de rendez-vous et agent conversationnel.
        </p>
        <p>
          Toute création de compte emporte acceptation pleine et entière des
          présentes conditions.
        </p>
      </LegalSection>

      <LegalSection id="compte" title="2. Compte et éligibilité">
        <p>
          Le Service est réservé aux professionnels agissant dans le cadre de leur
          activité. L&apos;utilisateur s&apos;engage à fournir des informations
          exactes lors de l&apos;inscription et à les tenir à jour. Il est
          responsable de la confidentialité de ses identifiants.
        </p>
        <p>
          Une adresse e-mail valide et vérifiée est requise. L&apos;éditeur peut
          suspendre un compte en cas d&apos;usage frauduleux ou contraire aux
          présentes conditions.
        </p>
      </LegalSection>

      <LegalSection id="abonnement" title="3. Abonnements et paiement">
        <p>
          Le plan <strong>Free</strong> est gratuit et sans limite de durée. Les
          plans <strong>Pro</strong> et <strong>Business</strong> sont des
          abonnements payants, facturés mensuellement ou annuellement, prélevés
          d&apos;avance par l&apos;intermédiaire du prestataire de paiement
          Stripe.
        </p>
        <p>
          Les prix sont indiqués hors taxes ; la TVA applicable est celle du pays
          de l&apos;utilisateur. Un changement de plan vers une offre supérieure
          est facturé au prorata ; une rétrogradation prend effet à
          l&apos;échéance suivante. Aucun remboursement n&apos;est dû pour une
          période entamée, sauf disposition légale impérative.
        </p>
      </LegalSection>

      <LegalSection id="obligations" title="4. Obligations de l'utilisateur">
        <p>
          L&apos;utilisateur s&apos;engage à ne pas diffuser de contenu illicite,
          trompeur ou portant atteinte aux droits de tiers, et à respecter la
          réglementation applicable à son activité (mentions obligatoires sur les
          factures, obligations fiscales et sociales, protection des données de
          ses propres clients).
        </p>
        <p>
          L&apos;utilisateur reste seul responsable du contenu de son site, de ses
          devis et factures, ainsi que des échanges tenus par l&apos;agent
          conversationnel qu&apos;il a paramétré.
        </p>
      </LegalSection>

      <LegalSection id="disponibilite" title="5. Disponibilité du service">
        <p>
          L&apos;éditeur met en œuvre les moyens raisonnables pour assurer une
          disponibilité élevée du Service, sans garantie d&apos;absence totale
          d&apos;interruption. Des opérations de maintenance peuvent être
          planifiées, avec information préalable lorsque cela est possible.
        </p>
      </LegalSection>

      <LegalSection id="donnees" title="6. Données et réversibilité">
        <p>
          L&apos;utilisateur peut à tout moment exporter l&apos;intégralité de ses
          données (clients, factures, contenu du site) aux formats JSON et CSV
          depuis son tableau de bord. En cas de résiliation d&apos;un plan payant,
          le compte bascule en plan Free : le site reste accessible sur le
          sous-domaine <em>traballo.pro</em> et l&apos;historique reste
          consultable et exportable.
        </p>
        <p>
          Le traitement des données personnelles est décrit dans la{" "}
          <a href="/confidentialite">Politique de confidentialité</a>.
        </p>
      </LegalSection>

      <LegalSection id="resiliation" title="7. Résiliation">
        <p>
          L&apos;utilisateur peut résilier son abonnement à tout moment depuis son
          espace ; la résiliation prend effet à la fin de la période en cours.
          L&apos;éditeur peut résilier un compte, avec préavis raisonnable, en cas
          de manquement grave aux présentes conditions.
        </p>
        <p>
          La suppression définitive du compte entraîne l&apos;effacement des
          données personnelles associées dans un délai de 30 jours, sous réserve
          des obligations légales de conservation.
        </p>
      </LegalSection>

      <LegalSection id="responsabilite" title="8. Responsabilité">
        <p>
          Le Service facilite la production de documents conformes aux formats de
          facturation électronique (Factur-X, PEPPOL) mais ne se substitue pas au
          conseil d&apos;un expert-comptable. L&apos;éditeur ne saurait être tenu
          responsable des conséquences d&apos;informations erronées saisies par
          l&apos;utilisateur.
        </p>
        <p>
          La responsabilité de l&apos;éditeur, toutes causes confondues, est
          limitée au montant des sommes versées par l&apos;utilisateur au cours
          des douze derniers mois.
        </p>
      </LegalSection>

      <LegalSection id="droit" title="9. Droit applicable et litiges">
        <p>
          Les présentes conditions sont soumises au droit de{" "}
          <strong>[pays d&apos;établissement de l&apos;éditeur]</strong>. À défaut
          de résolution amiable, tout litige relève de la compétence des
          tribunaux <strong>[du ressort du siège de l&apos;éditeur]</strong>, sous
          réserve des règles impératives protégeant le consommateur lorsque
          celles-ci s&apos;appliquent.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
