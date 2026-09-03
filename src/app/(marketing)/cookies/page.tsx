import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/marketing/legal-page";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Politique de cookies",
};

const COOKIES = [
  {
    name: "traballo_session",
    purpose: "Maintenir votre session connectée",
    type: "Essentiel",
    duration: "30 jours",
  },
  {
    name: "traballo_theme",
    purpose: "Mémoriser le thème clair / sombre choisi",
    type: "Préférence",
    duration: "1 an",
  },
  {
    name: "__Host-csrf",
    purpose: "Protection contre la falsification de requête",
    type: "Essentiel",
    duration: "Session",
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Politique de cookies"
      updatedAt="1er septembre 2026"
      toc={[
        { id: "definition", label: "Qu'est-ce qu'un cookie" },
        { id: "utilises", label: "Cookies utilisés" },
        { id: "sites-artisans", label: "Sites des artisans" },
        { id: "gestion", label: "Gérer vos préférences" },
      ]}
    >
      <LegalSection id="definition" title="Qu'est-ce qu'un cookie">
        <p>
          Un cookie est un petit fichier déposé sur votre appareil lors de la
          visite d&apos;un site. Traballo n&apos;utilise que des cookies
          strictement nécessaires au fonctionnement du service et des cookies de
          préférence. Aucun cookie publicitaire ni traceur tiers n&apos;est
          déposé sur le site vitrine ni dans l&apos;application.
        </p>
      </LegalSection>

      <LegalSection id="utilises" title="Cookies utilisés">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Finalité</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Durée</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {COOKIES.map((c) => (
              <TableRow key={c.name}>
                <TableCell className="font-mono text-xs">{c.name}</TableCell>
                <TableCell>{c.purpose}</TableCell>
                <TableCell>{c.type}</TableCell>
                <TableCell>{c.duration}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p>
          Les cookies essentiels ne nécessitent pas de consentement car ils sont
          indispensables à la fourniture d&apos;un service que vous avez
          expressément demandé.
        </p>
      </LegalSection>

      <LegalSection id="sites-artisans" title="Sites publiés par les artisans">
        <p>
          Les sites vitrines publiés par les artisans via Traballo n&apos;intègrent
          par défaut aucun cookie non essentiel. Si un artisan active la mesure
          d&apos;audience de ses visiteurs (plan Business), un bandeau de
          consentement conforme est affiché sur son site, et les statistiques sont
          agrégées et anonymisées.
        </p>
      </LegalSection>

      <LegalSection id="gestion" title="Gérer vos préférences">
        <p>
          Vous pouvez à tout moment supprimer les cookies déposés et empêcher
          leur dépôt via les réglages de votre navigateur. Le blocage des cookies
          essentiels empêchera toutefois la connexion à votre espace.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
