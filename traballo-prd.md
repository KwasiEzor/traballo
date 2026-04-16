# Traballo — Product Requirements Document (PRD)

**Version** 1.0  
**Date** Avril 2026  
**Statut** Brouillon — Phase de définition  
**Auteur** Équipe Produit Traballo  

---

## Table des matières

1. [Vue d'ensemble du produit](#1-vue-densemble-du-produit)
2. [Contexte et opportunité](#2-contexte-et-opportunité)
3. [Utilisateurs cibles](#3-utilisateurs-cibles)
4. [Proposition de valeur](#4-proposition-de-valeur)
5. [Architecture fonctionnelle](#5-architecture-fonctionnelle)
6. [Exigences fonctionnelles détaillées](#6-exigences-fonctionnelles-détaillées)
7. [Exigences non fonctionnelles](#7-exigences-non-fonctionnelles)
8. [Architecture technique](#8-architecture-technique)
9. [Modèle de données](#9-modèle-de-données)
10. [Modèle économique & pricing](#10-modèle-économique--pricing)
11. [Roadmap & jalons](#11-roadmap--jalons)
12. [Métriques de succès](#12-métriques-de-succès)
13. [Risques & mitigations](#13-risques--mitigations)
14. [Hors périmètre (v1)](#14-hors-périmètre-v1)

---

## 1. Vue d'ensemble du produit

### 1.1 Résumé exécutif

**Traballo** est une plateforme SaaS multi-tenant qui permet aux artisans et petits entrepreneurs francophones (France, Belgique, Luxembourg) de créer une présence professionnelle en ligne complète, gérer leur facturation, automatiser leurs communications clients et booster leur visibilité — le tout depuis un tableau de bord unique, sans compétence technique requise.

Le nom "Traballo" est issu du galicien/portugais archaïque signifiant "travail" — racine commune des mots *travail* (FR), *trabajo* (ES), *trabalho* (PT). Il incarne la dignité du travail bien fait, universel et sans fioriture.

### 1.2 Énoncé du problème

Les artisans et petits entrepreneurs francophones sont des professionnels hautement qualifiés dans leur métier, mais structurellement désavantagés dans l'économie numérique :

- **89% d'entre eux n'ont pas d'outils numériques adaptés** à leurs opérations quotidiennes (rapport SBA Q3 2025)
- Ils jonglent entre papier, Excel, WhatsApp personnel et au mieux un site Wix basique
- Les solutions existantes (Jobber, ServiceTitan, Housecall Pro) sont anglophones, coûteuses (€59–500/mois) et pensées pour des équipes de 5-50 techniciens, pas pour le solo ou la très petite équipe
- Les outils de facturation francophones (Pennylane, Evoliz) ne proposent pas de site web ni d'automatisation client
- La facturation électronique devient obligatoire en FR/BE dès 2026–2027, créant une urgence réglementaire

**Le résultat** : des artisans excellents qui perdent des clients face à des concurrents moins qualifiés mais mieux présentés en ligne, et qui perdent des heures chaque semaine sur l'administratif au lieu de travailler.

### 1.3 Solution

Traballo est le **premier "business pack" tout-en-un** conçu spécifiquement pour l'artisan francophone solo ou en petite équipe. Pour €0 à €49/mois, il offre :

- Un site web professionnel à template métier, live en quelques minutes
- Un générateur de factures conforme à la réglementation e-facturation 2026/2027
- Un AI agent configurable pour le service client, disponible 24/7
- Un système de RDV avec notifications automatiques
- Un bouton WhatsApp flottant avec possibilité d'IA intégrée
- Un dashboard admin unique pour tout gérer

### 1.4 Tagline

> **"Traballo — le numérique fait pour ceux qui font"**

---

## 2. Contexte et opportunité

### 2.1 Taille du marché

| Segment | Volume | Source |
|---|---|---|
| Artisans inscrits France | ~1 000 000 | INSEE 2024 |
| Indépendants BTP Belgique | ~180 000 | SPF Économie 2024 |
| TPE services à domicile UE | ~12 000 000 | Eurostat 2024 |
| Marché SaaS construction mondial | $16,3 Mds (2025) | FMI 2025 |
| CAGR marché micro-SaaS niche | +340% vs. plateformes génériques | Gartner Q4 2025 |

**Marché adressable immédiat (SAM)** : artisans solo et équipes de 1–5 personnes en France et Belgique ayant un accès internet régulier → estimation 400 000 cibles qualifiées.

### 2.2 Fenêtre d'opportunité réglementaire

La réglementation e-facturation crée une urgence de marché unique :

- **Belgique** : Réception de factures électroniques obligatoire dès **1er janvier 2026** ; émission obligatoire pour tous dès **1er janvier 2026** (déjà effectif pour B2B)
- **France** : Réception obligatoire dès **1er septembre 2026** ; émission obligatoire pour PME/TPE dès **1er septembre 2027**

Traballo, positionné comme solution conforme dès le lancement, capture un besoin légalement contraint — le meilleur type de demande.

### 2.3 Analyse concurrentielle synthétique

| Acteur | Prix | Site web | Facturation | AI Agent | WhatsApp | Langue FR/BE |
|---|---|---|---|---|---|---|
| ServiceTitan | €200–500+ | Non | Non | Basique | Non | Non |
| Jobber | €29–149 | Non | Oui | Non | Non | Partiel |
| Housecall Pro | €59–149 | Non | Oui | Non | Non | Non |
| Pennylane / Evoliz | €15–80 | Non | Oui | Non | Non | Oui |
| Wix / Squarespace | €16–45 | Oui | Non | Non | Non | Partiel |
| **Traballo** | **€0–49** | **Oui** | **Oui** | **Oui** | **Oui** | **Oui** |

**Conclusion** : Aucun acteur n'occupe le créneau "tout-en-un + francophone + prix accessible". L'espace est libre.

---

## 3. Utilisateurs cibles

### 3.1 Personas principaux

#### Persona A — Jean, 42 ans, Plombier-chauffagiste indépendant (Belgique)

- Travaille seul ou avec un apprenti
- CA annuel : €60 000–90 000
- Utilise WhatsApp pour tous ses clients, facture encore sur Excel ou via un carnet
- A un vieux site WordPress fait par son beau-frère qui ne fonctionne plus
- Perd ~3h/semaine sur l'administratif
- **Douleur principale** : "Je perds des chantiers parce que les gens ne me trouvent pas sur Google"
- **Disposition à payer** : €20–40/mois si "ça marche vraiment"

#### Persona B — Samira, 35 ans, Entreprise d'entretien et nettoyage (Paris, 3 employées)

- Dirige une TPE avec 3 collaboratrices
- CA annuel : ~€150 000
- Gère les RDV par téléphone, perd des clients qui ne rappellent pas
- Utilise Google Agenda mais rien d'automatique pour les rappels
- **Douleur principale** : "Je passe mes soirées à répondre à des messages au lieu de me reposer"
- **Disposition à payer** : €40–60/mois pour gagner du temps

#### Persona C — Luca, 28 ans, Électricien freelance (Luxembourg)

- Vient de s'installer à son compte, veut bien démarrer
- Natif numérique, à l'aise avec les outils
- Cherche une solution "tout-en-un" pour ne pas avoir à gérer 5 abonnements
- **Douleur principale** : "Je veux un site professionnel et un outil de gestion sans me ruiner"
- **Disposition à payer** : €29/mois dès le départ

### 3.2 Utilisateurs secondaires

- **Artisans BTP** : Maçons, carreleurs, peintres, menuisiers, couvreurs
- **Services à la personne** : Jardiniers, déménageurs, réparateurs électroménager
- **Corps de métiers de bouche** : Boulangers artisanaux avec livraison, traiteurs indépendants
- **Professions libérales artisanales** : Photographes, graphistes freelance

### 3.3 Utilisateur admin (opérateur Traballo)

L'équipe Traballo elle-même, qui accède à un super-dashboard pour :
- Gérer tous les tenants (artisans)
- Consulter les métriques globales (MRR, churn, usage)
- Modérer les contenus
- Gérer les templates disponibles
- Configurer les plans et les features flags

---

## 4. Proposition de valeur

### 4.1 Pour l'artisan

> **En moins de 30 minutes, votre business professionnel est en ligne.**  
> Site web à votre image. Factures conformes. Clients rappelés automatiquement. IA disponible à votre place. Le tout pour moins que votre café quotidien.

**Bénéfices mesurables attendus :**

| Bénéfice | Avant Traballo | Après Traballo |
|---|---|---|
| Temps de réponse client | Heures/jours | Immédiat (AI agent) |
| Temps admin par semaine | 3–5h | < 1h |
| No-show rendez-vous | 20–30% | < 5% (rappels auto) |
| Factures impayées | Suivi manuel | Relances automatiques |
| Visibilité Google | Quasi-nulle | Site SEO-optimisé |
| Conformité e-facturation | Non conforme | Conforme dès J1 |

### 4.2 Pour l'opérateur (Traballo)

- Revenus récurrents prévisibles (MRR)
- Rétention forte : l'artisan ne peut pas "partir" sans perdre site + factures + historique clients
- Acquisition organique via le freemium : chaque site Traballo est une vitrine de la plateforme
- Upsell naturel : freemium → Pro → Business à mesure que l'artisan croît

---

## 5. Architecture fonctionnelle

### 5.1 Vue macro du produit

Traballo comprend deux surfaces principales :

**Surface 1 — Le site public de l'artisan**  
Ce que les clients finaux de l'artisan voient : `jean-plombier.traballo.be` ou `www.plomberie-dupont.be`

**Surface 2 — Le dashboard admin Traballo**  
Ce que l'artisan voit : `app.traballo.be/dashboard`

Et une surface cachée :

**Surface 3 — Le super-admin Traballo**  
Ce que l'équipe Traballo voit : `admin.traballo.be`

### 5.2 Modules fonctionnels

```
Traballo Platform
├── M1 — Site Builder (templates métier)
├── M2 — Invoice Generator (facturation)
├── M3 — AI Agent (service client)
├── M4 — Appointment System (RDV + notifications)
├── M5 — WhatsApp Integration (floating button + API)
├── M6 — Dashboard Admin (gestion globale)
└── M7 — Super Admin (opérateur Traballo)
```

---

## 6. Exigences fonctionnelles détaillées

### M1 — Site Builder (templates métier)

#### M1.1 Onboarding et création de site

**Description** : À l'inscription, l'artisan répond à un questionnaire court (5–7 questions) qui configure automatiquement son site.

**Exigences :**

- **TRB-001** : Le système doit proposer au moins 10 templates pré-configurés par corps de métier : plombier, électricien, menuisier, peintre, maçon, jardinier, nettoyage, carreleur, couvreur, général
- **TRB-002** : Chaque template doit inclure des sections pré-remplies avec textes de démonstration contextuel au métier (ex. : "Plomberie d'urgence 24h/7j" pour un plombier)
- **TRB-003** : L'onboarding doit permettre de créer un site live en moins de 10 minutes
- **TRB-004** : Le site doit être accessible immédiatement sur `[slug].traballo.be` après création
- **TRB-005** : Le questionnaire d'onboarding doit collecter : métier, zone géographique, nom, logo (optionnel), couleur principale, numéro WhatsApp, email, téléphone

#### M1.2 Personnalisation du site

**Exigences :**

- **TRB-006** : L'artisan doit pouvoir modifier les textes de toutes les sections depuis le dashboard (sans toucher au code)
- **TRB-007** : Le système doit permettre le téléchargement d'un logo (PNG/JPG, max 2MB) remplaçant le placeholder
- **TRB-008** : La couleur primaire du site doit être personnalisable via un color-picker
- **TRB-009** : L'artisan doit pouvoir activer/désactiver chaque section de la page (services, galerie, avis, contact)
- **TRB-010** : La galerie photos doit accepter jusqu'à 20 images (max 5MB par image) sur le plan Pro
- **TRB-011** : Le formulaire de contact doit être configurable (champs, email de réception)
- **TRB-012** : Les horaires d'ouverture doivent être configurables par jour avec possibilité de "fermé"

#### M1.3 Sections du site public

**Exigences :**

- **TRB-013** : Section "Hero" avec titre, sous-titre, CTA et image/couleur de fond
- **TRB-014** : Section "Services" avec liste des prestations, descriptions et tarifs optionnels (max 12 services)
- **TRB-015** : Section "À propos" avec texte, photo et badges de certification (ex : "Maître artisan")
- **TRB-016** : Section "Galerie" avec grid de photos de réalisations
- **TRB-017** : Section "Avis clients" (affichage manuel en v1, Google Reviews en v2)
- **TRB-018** : Section "Zone d'intervention" avec champ texte libre (carte Google Maps en v2)
- **TRB-019** : Section "Contact" avec formulaire, téléphone cliquable, email
- **TRB-020** : Footer avec mentions légales, lien vers politique de confidentialité, powered by Traballo (plan gratuit)

#### M1.4 Domaines et SEO

**Exigences :**

- **TRB-021** : Sous-domaine `[slug].traballo.be` inclus dans tous les plans, y compris gratuit
- **TRB-022** : Le plan Pro et Business doit permettre la connexion d'un domaine custom via CNAME
- **TRB-023** : Chaque site doit avoir des meta-tags (title, description) configurables
- **TRB-024** : Le site doit générer automatiquement un sitemap.xml
- **TRB-025** : Les pages doivent être rendues en SSR/SSG (Next.js) pour un score PageSpeed ≥ 90
- **TRB-026** : Les balises Open Graph doivent être générées automatiquement pour le partage sur réseaux sociaux

#### M1.5 Responsive et accessibilité

**Exigences :**

- **TRB-027** : Tous les templates doivent être parfaitement responsive (mobile, tablette, desktop)
- **TRB-028** : Le site doit respecter les critères WCAG 2.1 niveau AA pour l'accessibilité
- **TRB-029** : Le temps de chargement de la page doit être inférieur à 2 secondes sur 4G

---

### M2 — Invoice Generator (facturation)

#### M2.1 Création de factures

**Exigences :**

- **TRB-030** : L'artisan doit pouvoir créer une facture en moins de 2 minutes
- **TRB-031** : Le formulaire de facture doit inclure : numéro auto-incrémenté, date, date d'échéance, client (sélection ou création rapide), lignes de prestation (description, quantité, prix unitaire, TVA)
- **TRB-032** : Le système doit gérer plusieurs taux de TVA : 0%, 6%, 12%, 21% (Belgique) et 0%, 5,5%, 10%, 20% (France)
- **TRB-033** : Le calcul HT, TVA, TTC doit être automatique et mis à jour en temps réel
- **TRB-034** : Le système doit permettre l'application d'une remise en % ou en montant fixe
- **TRB-035** : Un bon de commande ou devis doit pouvoir être converti en facture en 1 clic
- **TRB-036** : Les mentions légales obligatoires (FR/BE) doivent être pré-remplies et éditables

#### M2.2 Génération PDF

**Exigences :**

- **TRB-037** : La facture doit être générée en PDF, design professionnel, avec logo de l'artisan
- **TRB-038** : Le PDF doit inclure : coordonnées artisan, coordonnées client, détail des lignes, totaux, conditions de paiement, numéro de compte bancaire (IBAN)
- **TRB-039** : Le PDF doit être téléchargeable directement depuis le dashboard
- **TRB-040** : Le PDF doit être envoyable par email en 1 clic directement depuis l'interface
- **TRB-041** : Le design du PDF doit être personnalisable (couleur, logo) conformément à la charte du site
- **TRB-042** : Le système doit conserver un historique des PDFs générés pendant 10 ans (conformité légale)

#### M2.3 Conformité e-facturation 2026/2027

**Exigences :**

- **TRB-043** : Les factures doivent être générées au format Factur-X (hybride PDF + XML) pour la France
- **TRB-044** : Les factures doivent être conformes au format PEPPOL BIS Billing 3.0 pour la Belgique
- **TRB-045** : Le système doit intégrer un mécanisme de réception de factures électroniques (inbox e-factures)
- **TRB-046** : Une PDP (Plateforme de Dématérialisation Partenaire) ou équivalent doit être intégré ou interfacé pour la France (partenariat à identifier)
- **TRB-047** : Le numéro de TVA intracommunautaire doit être validé automatiquement via l'API VIES (UE)

#### M2.4 Gestion des clients

**Exigences :**

- **TRB-048** : Un carnet de contacts clients doit être maintenu automatiquement à partir des factures
- **TRB-049** : Chaque fiche client doit afficher l'historique des factures, le montant total facturé, les impayés
- **TRB-050** : L'import de clients via CSV doit être supporté
- **TRB-051** : La recherche client doit fonctionner par nom, email ou téléphone

#### M2.5 Statuts et suivi des paiements

**Exigences :**

- **TRB-052** : Chaque facture doit avoir un statut : Brouillon, Envoyée, Vue, Payée, En retard, Annulée
- **TRB-053** : Le statut "Vue" doit être mis à jour automatiquement quand le client ouvre le lien de la facture
- **TRB-054** : Le tableau de bord doit afficher : total facturé (mois en cours), total encaissé, impayés en cours
- **TRB-055** : Un export CSV de toutes les factures doit être disponible pour la comptabilité

#### M2.6 Rappels de paiement

**Exigences :**

- **TRB-056** : Le système doit envoyer automatiquement un rappel email à J+7 pour toute facture impayée (configurable)
- **TRB-057** : Un second rappel doit être envoyé à J+30 (configurable)
- **TRB-058** : L'artisan doit pouvoir activer/désactiver les rappels automatiques par facture ou globalement
- **TRB-059** : L'artisan doit pouvoir envoyer un rappel manuel en 1 clic depuis la liste des factures
- **TRB-060** : Le template des emails de rappel doit être personnalisable (ton, message)

---

### M3 — AI Agent (service client)

#### M3.1 Configuration de l'agent

**Exigences :**

- **TRB-061** : L'artisan doit pouvoir configurer l'AI agent depuis le dashboard, sans compétence technique
- **TRB-062** : La configuration doit inclure : nom de l'agent, langue(s), ton de voix (formel/informel), horaires de disponibilité
- **TRB-063** : L'artisan doit pouvoir saisir des informations contextuelles : services proposés, tarifs indicatifs, zone d'intervention, FAQ personnalisée, politique de réservation
- **TRB-064** : Ces informations doivent être injectées automatiquement dans le prompt système de l'AI agent
- **TRB-065** : L'agent doit avoir un mode "test" permettant à l'artisan de simuler une conversation avant mise en ligne
- **TRB-066** : L'artisan doit pouvoir activer/désactiver l'agent en 1 clic
- **TRB-067** : En dehors des horaires configurés, l'agent doit afficher un message personnalisable ("Je reprends contact lundi matin...")

#### M3.2 Fonctionnalités de l'agent

**Exigences :**

- **TRB-068** : L'agent doit répondre aux questions fréquentes sur les services et tarifs de l'artisan
- **TRB-069** : L'agent doit être capable de proposer une prise de rendez-vous directement dans la conversation (integration M4)
- **TRB-070** : L'agent doit collecter les coordonnées du prospect (nom, téléphone, email) et les enregistrer en base
- **TRB-071** : L'agent doit signaler à l'artisan (notification push/email) chaque nouvelle conversation
- **TRB-072** : L'agent doit permettre un transfert vers l'artisan humain ("Je vous transfère à Jean")
- **TRB-073** : L'agent doit être multilingue : FR par défaut, possibilité d'ajouter NL, EN

#### M3.3 Interface du chat sur le site public

**Exigences :**

- **TRB-074** : Le chat doit apparaître comme un widget flottant (bulle) sur le site de l'artisan
- **TRB-075** : Le widget doit être personnalisable : couleur, nom affiché, avatar
- **TRB-076** : La première interaction doit se déclencher automatiquement après 10 secondes (configurable) avec un message d'accroche
- **TRB-077** : Les conversations doivent être sauvegardées et consultables depuis le dashboard artisan
- **TRB-078** : L'historique de conversation doit être conservé pour le visiteur qui revient (cookie, 30 jours)

#### M3.4 Limites et garde-fous

**Exigences :**

- **TRB-079** : L'agent ne doit jamais donner de prix fermes s'ils ne sont pas configurés (utiliser "à partir de" ou "sur devis")
- **TRB-080** : L'agent doit refuser poliment les demandes hors de son périmètre et rediriger vers l'artisan
- **TRB-081** : Un système de modération doit détecter les conversations problématiques (insultes, spam)
- **TRB-082** : Le coût API (Anthropic Claude) doit être plafonné par tenant par mois selon le plan (protection coûts)

---

### M4 — Appointment System (RDV + notifications)

#### M4.1 Prise de rendez-vous

**Exigences :**

- **TRB-083** : Un module de réservation en ligne doit être intégrable dans le site de l'artisan (section dédiée ou lien)
- **TRB-084** : L'artisan doit configurer ses disponibilités : créneaux par jour, durée par défaut d'un RDV, délai minimum avant réservation
- **TRB-085** : Le client doit pouvoir réserver un créneau disponible sans créer de compte
- **TRB-086** : La réservation doit collecter : nom, téléphone, email, type de prestation, message optionnel
- **TRB-087** : L'artisan doit recevoir une notification (email + push) à chaque nouvelle réservation
- **TRB-088** : L'artisan doit pouvoir valider, refuser ou proposer un autre créneau depuis le dashboard

#### M4.2 Calendrier artisan

**Exigences :**

- **TRB-089** : Un calendrier mensuel/hebdomadaire doit afficher tous les RDV confirmés
- **TRB-090** : L'artisan doit pouvoir créer, modifier et annuler des RDV manuellement
- **TRB-091** : L'artisan doit pouvoir bloquer des plages horaires (congés, indisponibilité)
- **TRB-092** : Une synchronisation bidirectionnelle avec Google Calendar doit être proposée (plan Pro)
- **TRB-093** : Un aperçu "journée" doit être accessible en format liste depuis le dashboard

#### M4.3 Notifications automatiques

**Exigences :**

- **TRB-094** : Un email de confirmation doit être envoyé automatiquement au client à la réservation
- **TRB-095** : Un rappel automatique doit être envoyé au client 24h avant le RDV (configurable : 24h, 48h, 1h)
- **TRB-096** : Un rappel doit être envoyé à l'artisan 1h avant chaque RDV
- **TRB-097** : En cas d'annulation par l'artisan, un email automatique d'excuse et de reprogrammation doit être envoyé au client
- **TRB-098** : Le template des emails de notification doit reprendre la charte graphique du site de l'artisan

---

### M5 — WhatsApp Integration

#### M5.1 Bouton WhatsApp flottant (Phase 1 — MVP)

**Exigences :**

- **TRB-099** : Un bouton WhatsApp flottant (icône verte reconnaissable) doit être disponible sur le site de l'artisan
- **TRB-100** : Le bouton doit ouvrir directement une conversation WhatsApp pré-remplie avec un message de bienvenue configurable
- **TRB-101** : Le numéro WhatsApp de l'artisan doit être configurable depuis le dashboard
- **TRB-102** : Le bouton doit être positionnable (bas gauche / bas droit) depuis le dashboard
- **TRB-103** : La visibilité du bouton doit être paramétrable : toujours visible, uniquement pendant les heures d'ouverture

#### M5.2 WhatsApp Business API — AI Agent (Phase 2 — Pro/Business)

**Exigences :**

- **TRB-104** : L'AI agent configuré en M3 doit pouvoir répondre également via WhatsApp Business
- **TRB-105** : L'artisan doit recevoir les conversations WhatsApp dans son dashboard Traballo (inbox unifiée)
- **TRB-106** : L'artisan doit pouvoir reprendre la main sur une conversation en cours avec l'AI agent
- **TRB-107** : Les messages automatiques (confirmations RDV, rappels factures) doivent être envoyables via WhatsApp en plus de l'email
- **TRB-108** : La mise en place WhatsApp Business doit être guidée par un wizard de 5 étapes depuis le dashboard

---

### M6 — Dashboard Admin (artisan)

#### M6.1 Vue d'ensemble (Home)

**Exigences :**

- **TRB-109** : La page d'accueil du dashboard doit afficher : revenus du mois, factures impayées, RDV du jour, nouvelles conversations AI, statut du site (online/offline)
- **TRB-110** : Une barre de progression "Complétez votre profil" doit guider l'artisan vers les étapes importantes (logo, services, first facture, etc.)
- **TRB-111** : Un feed d'activité récente doit afficher les 10 derniers événements (RDV créé, facture envoyée, nouveau message...)

#### M6.2 Navigation

**Exigences :**

- **TRB-112** : La sidebar de navigation doit inclure : Accueil, Mon Site, Factures, Clients, Rendez-vous, AI Agent, WhatsApp, Paramètres
- **TRB-113** : Une barre de recherche globale doit permettre de retrouver clients, factures et RDV
- **TRB-114** : Le dashboard doit être entièrement responsive (utilisable sur smartphone)
- **TRB-115** : Une application mobile Progressive Web App (PWA) doit être disponible (push notifications)

#### M6.3 Paramètres du compte

**Exigences :**

- **TRB-116** : L'artisan doit pouvoir gérer : informations professionnelles (nom, SIRET/BCE, TVA, adresse), coordonnées bancaires (IBAN), logo, signature email
- **TRB-117** : La gestion du plan et de la facturation Traballo (upgrade, downgrade, annulation) doit être accessible en self-service
- **TRB-118** : L'artisan doit pouvoir télécharger ses propres factures Traballo (conformité comptable)
- **TRB-119** : La suppression du compte doit être possible avec export préalable de toutes les données (RGPD)

---

### M7 — Super Admin (opérateur Traballo)

**Exigences :**

- **TRB-120** : Un tableau de bord global doit afficher : nombre de tenants actifs, MRR, nouveaux inscrits, churns, revenus par plan
- **TRB-121** : La liste de tous les tenants doit être consultable avec recherche par nom, email, plan, date d'inscription
- **TRB-122** : L'administrateur doit pouvoir impersonner un tenant pour le support (avec log de l'action)
- **TRB-123** : La gestion des templates disponibles (création, modification, activation/désactivation) doit être possible depuis le super-admin
- **TRB-124** : La gestion des plans et features flags doit être possible sans redéploiement
- **TRB-125** : Un système d'annonces globales (maintenance, nouveautés) doit être diffusable à tous les artisans

---

## 7. Exigences non fonctionnelles

### 7.1 Performance

| Métrique | Cible | Critique |
|---|---|---|
| Temps de chargement page publique artisan | < 2s (4G) | < 3s |
| Temps de réponse API dashboard | < 500ms (p95) | < 1s |
| Score PageSpeed (mobile) | ≥ 90 | ≥ 80 |
| Score Core Web Vitals (LCP) | < 2,5s | < 4s |
| Génération PDF facture | < 3s | < 5s |
| Réponse AI Agent | < 2s (streaming) | < 5s |

### 7.2 Disponibilité et fiabilité

- **Uptime cible** : 99,9% (soit max ~8h d'indisponibilité/an)
- **RTO** (Recovery Time Objective) : < 1 heure
- **RPO** (Recovery Point Objective) : < 1 heure (backups Supabase journaliers Pro)
- Déploiements continus sans downtime (Vercel rolling deployments)
- Monitoring via Vercel Analytics + Supabase Dashboard

### 7.3 Sécurité

- **TRB-S01** : Authentification via Supabase Auth (email/password + magic link + OAuth Google)
- **TRB-S02** : MFA (Multi-Factor Authentication) disponible sur le plan Business
- **TRB-S03** : Isolation complète des données par tenant via Row Level Security (RLS) PostgreSQL
- **TRB-S04** : Toutes les communications doivent être chiffrées en TLS 1.2+ (HTTPS forcé)
- **TRB-S05** : Les mots de passe ne doivent jamais être stockés en clair (bcrypt via Supabase Auth)
- **TRB-S06** : Les clés API (Stripe, Anthropic, WhatsApp) doivent être stockées dans des variables d'environnement serveur, jamais exposées au client
- **TRB-S07** : Un rate limiting doit être appliqué sur toutes les API routes (protection DDoS/spam)
- **TRB-S08** : Les données des artisans belges et français doivent être hébergées en Europe (conformité RGPD)

### 7.4 Conformité RGPD

- **TRB-RGPD-01** : Une politique de confidentialité et des CGU doivent être acceptées à l'inscription
- **TRB-RGPD-02** : L'artisan doit pouvoir exporter l'intégralité de ses données en JSON/CSV à tout moment
- **TRB-RGPD-03** : La suppression de compte doit entraîner la suppression de toutes les données personnelles dans un délai de 30 jours
- **TRB-RGPD-04** : Un bandeau cookies conforme doit être présent sur le site public de l'artisan
- **TRB-RGPD-05** : Les données clients des artisans (noms, emails dans le carnet de contacts) sont des données personnelles — Traballo agit en qualité de sous-traitant, l'artisan en qualité de responsable de traitement

### 7.5 Accessibilité

- Conformité WCAG 2.1 niveau AA pour les sites publics des artisans
- Support des lecteurs d'écran pour le dashboard admin

### 7.6 Internationalisation (i18n)

- Interface dashboard disponible en : Français (principal), Néerlandais (Belgique)
- Les sites publics des artisans doivent supporter le multilinguisme dès la v1 (FR/NL minimum) via une configuration simple
- Format de date, monnaie et numéro de téléphone adaptés selon le pays de l'artisan

---

## 8. Architecture technique

### 8.1 Stack technologique

| Couche | Technologie | Justification |
|---|---|---|
| Frontend / Fullstack | Next.js 15 (App Router) | SSR/SSG pour SEO, API Routes, middleware multi-tenant |
| Base de données | Supabase (PostgreSQL) | RLS natif, Auth intégrée, Storage, Realtime, gratuit jusqu'à 50k MAUs |
| ORM | Drizzle ORM | Léger, type-safe, migrations simples, compatible Supabase |
| UI Framework | Tailwind CSS + shadcn/ui | Composants copy-paste, no vendor lock-in, personnalisation facile |
| Authentification | Supabase Auth | Email, magic link, OAuth Google, MFA |
| Déploiement | Vercel | Native Next.js, wildcard subdomains, CI/CD automatique |
| Emails | Resend | 3 000/mois gratuit, SDK React Email, parfait pour Next.js |
| Paiements | Stripe | 0€ fixe + 1,5% par transaction, webhooks, abonnements |
| AI Agent | Anthropic Claude (claude-sonnet-4-6) | API streaming, multilingue, configurabilité du system prompt |
| Génération PDF | @react-pdf/renderer | Côté serveur, typesafe, composants React |
| Storage fichiers | Supabase Storage | Logos, photos galerie, PDF factures |
| Notifications cron | Vercel Cron Jobs | Rappels RDV et factures, serverless |
| Monitoring | Vercel Analytics + Sentry | Performance + suivi des erreurs |
| DNS / CDN | Cloudflare | Gratuit, DDoS, performance, gestion DNS custom domains |

### 8.2 Architecture multi-tenant

**Stratégie d'isolation : Schema partagé avec colonne tenant_id + RLS**

```
Requête entrante
       │
       ▼
Next.js Middleware (src/middleware.ts)
       │
       ├── hostname = app.traballo.be → Dashboard artisan
       ├── hostname = admin.traballo.be → Super Admin
       └── hostname = [slug].traballo.be OU custom domain → Site public artisan
              │
              ▼
       Résolution du tenant depuis DB (cache Redis optionnel)
              │
              ▼
       Rendu avec données isolées (RLS garantit l'isolation)
```

**Isolation des données :**

Toutes les tables métier ont une colonne `tenant_id` (UUID). Les policies RLS Supabase garantissent qu'un utilisateur ne peut lire/écrire que les données de son tenant.

```sql
-- Exemple de policy RLS sur la table invoices
CREATE POLICY "tenant_isolation" ON invoices
  USING (tenant_id = auth.jwt() ->> 'tenant_id');
```

### 8.3 Gestion des domaines

- Sous-domaine par défaut : `[slug].traballo.be` via wildcard DNS `*.traballo.be` sur Vercel
- Domaine custom (plans Pro/Business) : l'artisan ajoute un CNAME `www.mondomaine.be → cname.traballo.be` ; Vercel génère le SSL automatiquement via Vercel Platforms
- Un webhook déclenche l'ajout du domaine dans Vercel via l'API Vercel Domains

### 8.4 Architecture des emails

```
Événement déclencheur
      │
      ▼
Supabase Edge Function ou Next.js API Route
      │
      ▼
Template React Email (react-email)
      │
      ▼
Resend API → Inbox client ou artisan
```

Tous les emails transactionnels sont envoyés depuis `noreply@traballo.be` avec réponse possible vers l'artisan.

### 8.5 Architecture de l'AI Agent

```
Visiteur pose une question (widget site public)
      │
      ▼
Next.js API Route /api/ai/chat (streaming)
      │
      ▼
Construction du System Prompt :
  - Instructions générales (politesse, limites)
  - Données du tenant : services, tarifs, FAQ, horaires
  - Historique de la conversation (last 10 messages)
      │
      ▼
Anthropic API (claude-sonnet-4-6, stream: true)
      │
      ▼
Réponse streamée vers le widget du visiteur
      │
      ▼
Sauvegarde de la conversation en DB
      │
      ▼
Notification à l'artisan si lead capturé
```

---

## 9. Modèle de données

### 9.1 Tables principales (schéma simplifié)

```sql
-- Tenants (artisans)
tenants (
  id UUID PRIMARY KEY,
  slug VARCHAR UNIQUE,  -- pour le subdomain
  plan ENUM('free','pro','business'),
  created_at TIMESTAMPTZ,
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR
)

-- Profils artisans
artisan_profiles (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  business_name VARCHAR,
  owner_name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  whatsapp_number VARCHAR,
  address TEXT,
  vat_number VARCHAR,
  iban VARCHAR,
  logo_url VARCHAR,
  trade_type VARCHAR  -- plombier, electricien, etc.
)

-- Sites (configuration du site public)
sites (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  template_id VARCHAR,
  primary_color VARCHAR,
  custom_domain VARCHAR,
  is_published BOOLEAN,
  meta_title VARCHAR,
  meta_description TEXT,
  sections JSONB  -- configuration de chaque section
)

-- Clients (carnet de contacts de l'artisan)
clients (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ
)

-- Factures
invoices (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  client_id UUID REFERENCES clients(id),
  invoice_number VARCHAR,
  status ENUM('draft','sent','viewed','paid','overdue','cancelled'),
  issue_date DATE,
  due_date DATE,
  subtotal DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  total DECIMAL(10,2),
  notes TEXT,
  pdf_url VARCHAR,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
)

-- Lignes de facture
invoice_items (
  id UUID PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id),
  description TEXT,
  quantity DECIMAL(10,2),
  unit_price DECIMAL(10,2),
  tax_rate DECIMAL(5,2),
  total DECIMAL(10,2)
)

-- Rendez-vous
appointments (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  client_id UUID REFERENCES clients(id),
  title VARCHAR,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status ENUM('pending','confirmed','cancelled','completed'),
  notes TEXT,
  reminder_sent BOOLEAN
)

-- Disponibilités artisan
availability (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  day_of_week INT,  -- 0=lundi, 6=dimanche
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN
)

-- Configuration AI Agent
ai_agent_config (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  agent_name VARCHAR,
  is_enabled BOOLEAN,
  tone ENUM('formal','casual'),
  languages TEXT[],
  business_context TEXT,  -- services, tarifs, FAQ saisis par l'artisan
  opening_message TEXT,
  off_hours_message TEXT
)

-- Conversations AI
ai_conversations (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  visitor_id VARCHAR,  -- cookie anonyme
  lead_name VARCHAR,
  lead_email VARCHAR,
  lead_phone VARCHAR,
  channel ENUM('website','whatsapp'),
  created_at TIMESTAMPTZ
)

-- Messages des conversations
ai_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id),
  role ENUM('user','assistant'),
  content TEXT,
  created_at TIMESTAMPTZ
)
```

---

## 10. Modèle économique & pricing

### 10.1 Plans tarifaires

#### Plan Free — Gratuit (pour toujours)

**Objectif** : Acquisition et démonstration de valeur

- 1 site web (template de base)
- Sous-domaine `.traballo.be` inclus
- 5 factures par mois
- Bouton WhatsApp flottant (simple)
- 50 messages AI/mois
- Traballo branding sur le site ("Créé avec Traballo")
- Pas de notifications automatiques
- Support communautaire

#### Plan Pro — €29/mois (€24/mois si annuel)

**Objectif** : Plan principal, acquisition de revenu

Tout le plan Free, plus :
- Domaine custom (1 domaine)
- Factures illimitées
- Conformité e-facturation (Factur-X / PEPPOL)
- Rappels paiement automatiques
- Système de RDV complet
- Notifications RDV automatiques (email)
- AI Agent configurable (500 messages/mois)
- Galerie photos (20 images)
- Google Calendar sync
- Suppression branding Traballo
- Support email (< 48h)

#### Plan Business — €49/mois (€39/mois si annuel)

**Objectif** : Upsell pour artisans en croissance

Tout le plan Pro, plus :
- WhatsApp Business API + AI sur WhatsApp
- Notifications RDV par SMS (100/mois inclus)
- AI Agent avancé (messages illimités)
- Analytics visiteurs du site
- 2 domaines customs
- Inbox unifiée (site + WhatsApp)
- Export comptable complet
- Support prioritaire (< 24h)
- Accès bêta aux nouvelles fonctionnalités

### 10.2 Modèle de revenus

**Revenus primaires :**
- Abonnements mensuels/annuels (MRR)
- Upsell SMS (pack de 100 SMS supplémentaires = €5)

**Revenus secondaires (v2+) :**
- Commission sur paiements en ligne des factures (si module paiement Stripe intégré)
- Templates premium supplémentaires (marketplace)
- Domaines supplémentaires

### 10.3 Projections financières simplifiées

| Mois | Utilisateurs Free | Utilisateurs Pro | Utilisateurs Business | MRR |
|---|---|---|---|---|
| M3 (MVP) | 50 | 10 | 2 | €372 |
| M6 | 200 | 50 | 10 | €1 940 |
| M12 | 800 | 180 | 40 | €7 180 |
| M18 | 2 000 | 450 | 100 | €18 050 |

**Hypothèses :** taux de conversion freemium → Pro de 10%, Pro → Business de 15%, churn mensuel de 3%

---

## 11. Roadmap & jalons

### Phase 0 — Fondations (Semaines 1–2)

- [ ] Setup projet Next.js 15 + Supabase + Vercel
- [ ] Schéma de base de données + RLS policies
- [ ] Authentification (email + magic link)
- [ ] Middleware multi-tenant (routing par subdomain)
- [ ] Configuration DNS wildcard `*.traballo.be`
- [ ] CI/CD GitHub Actions → Vercel

**Livrable** : Infrastructure de base deployée sur `app.traballo.be`

### Phase 1 — MVP Site Builder (Semaines 3–5)

- [ ] 3 templates artisans (plombier, électricien, général)
- [ ] Dashboard d'édition du site (textes, couleurs, logo)
- [ ] Publication/dépublication du site
- [ ] Formulaire de contact fonctionnel (Resend)
- [ ] SEO basique (meta tags, sitemap)
- [ ] Bouton WhatsApp flottant

**Livrable** : Artisan peut créer et publier un site pro en < 10 min

### Phase 2 — Facturation (Semaines 6–8)

- [ ] Formulaire de création de facture
- [ ] Génération PDF (@react-pdf/renderer)
- [ ] Envoi par email (Resend)
- [ ] Carnet de contacts clients
- [ ] Statuts et suivi des paiements
- [ ] Rappels automatiques (Vercel Cron)
- [ ] Conformité TVA FR/BE

**Livrable** : Premier flux complet devis → facture → envoi → rappel

### Phase 3 — Stripe + Freemium (Semaine 9)

- [ ] Intégration Stripe Checkout
- [ ] Webhooks Stripe (activation/désactivation features)
- [ ] Feature flags par plan
- [ ] Page de pricing publique
- [ ] Onboarding flow complet

**Livrable** : Premiers abonnements payants possibles — lancement bêta

### Phase 4 — AI Agent (Semaines 10–12)

- [ ] Interface de configuration de l'agent
- [ ] Widget chat sur le site public (streaming)
- [ ] Intégration Anthropic API
- [ ] Capture de leads (coordonnées)
- [ ] Historique conversations dans le dashboard
- [ ] Notifications nouvelles conversations

**Livrable** : AI Agent live sur les sites artisans

### Phase 5 — RDV & Notifications (Semaines 13–15)

- [ ] Calendrier de disponibilités artisan
- [ ] Page de réservation publique
- [ ] Confirmations et rappels automatiques (email)
- [ ] Dashboard calendrier artisan
- [ ] Google Calendar sync

**Livrable** : Système de RDV complet

### Phase 6 — WhatsApp Business API (Semaines 16–18)

- [ ] Intégration WhatsApp Business API
- [ ] Inbox unifiée site + WhatsApp
- [ ] AI agent sur WhatsApp
- [ ] Rappels RDV + factures via WhatsApp

**Livrable** : Plan Business fonctionnel à 100%

### Phase 7 — Polish & Scale (Semaines 19–24)

- [ ] Conformité e-facturation Factur-X + PEPPOL
- [ ] Templates supplémentaires (7 nouveaux métiers)
- [ ] Analytics visiteurs
- [ ] Mobile PWA
- [ ] Internationalisation NL
- [ ] Super admin amélioré
- [ ] Partenariats fédérations artisans

**Livrable** : Produit v1.0 complet, prêt pour scale

---

## 12. Métriques de succès

### 12.1 Métriques produit (KPIs)

| Métrique | Cible M3 | Cible M6 | Cible M12 |
|---|---|---|---|
| Artisans inscrits | 60 | 250 | 1 000 |
| Sites publiés | 40 | 180 | 750 |
| Factures générées | 50/mois | 500/mois | 3 000/mois |
| Taux conversion Free → Pro | 10% | 12% | 15% |
| Churn mensuel | < 5% | < 4% | < 3% |
| NPS (Net Promoter Score) | > 30 | > 40 | > 50 |
| Temps d'onboarding | < 15 min | < 10 min | < 8 min |

### 12.2 Métriques financières

| Métrique | Cible M6 | Cible M12 | Cible M18 |
|---|---|---|---|
| MRR | €1 500+ | €7 000+ | €18 000+ |
| ARR | €18 000+ | €84 000+ | €216 000+ |
| ARPU (revenu moyen par utilisateur payant) | €32 | €33 | €34 |
| LTV estimé (12 mois de rétention) | €384 | €396 | €408 |
| CAC (coût d'acquisition) | < €50 | < €40 | < €30 |

### 12.3 Métriques techniques

| Métrique | Cible |
|---|---|
| Uptime | ≥ 99,9% |
| Score PageSpeed mobile | ≥ 90 |
| Temps de réponse p95 | < 500ms |
| Taux d'erreur API | < 0,1% |
| Score satisfaction support | ≥ 4,5/5 |

---

## 13. Risques & mitigations

### 13.1 Risques techniques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Dépassement coûts API Anthropic | Moyen | Moyen | Plafond de tokens par tenant par mois, monitoring alertes |
| Problème de compliance e-facturation | Faible | Élevé | Partenariat PDP dès Phase 6, veille réglementaire |
| Surcharge Supabase (free tier) | Moyen | Moyen | Migration Pro ($25/mois) dès les 30 premiers tenants actifs |
| Sécurité multi-tenant (fuite données) | Faible | Critique | RLS testé exhaustivement, tests de pénétration avant lancement |
| Complexité WhatsApp API | Moyen | Moyen | Phase 2 (non-bloquant MVP), prestataire 360dialog |

### 13.2 Risques marché

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Faible adoption numérique artisans | Élevé | Élevé | Plan gratuit agressif, onboarding ultra-simple, vidéos tutoriels |
| Concurrent qui copie le concept | Moyen | Moyen | Avantage réseau (base clients), moat réglementaire (e-fact.), vitesse d'itération |
| Résistance au changement (Excel/papier) | Élevé | Moyen | Framing "conformité obligatoire" pour la facturation électronique |
| Prix perçu trop élevé | Moyen | Moyen | Freemium généreux, démonstration de ROI (€29/mois = 1h de travail) |

### 13.3 Risques business

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Churn élevé plan gratuit (jamais convertis) | Élevé | Faible | Feature gating strict (5 factures/mois max), emails nurturing |
| Difficultés de support à l'échelle | Moyen | Moyen | Documentation complète, AI chatbot de support interne, FAQ |
| Problème de paiement Stripe (fraude) | Faible | Moyen | Radar Stripe activé, vérification manuelle premiers comptes |

---

## 14. Hors périmètre (v1)

Les fonctionnalités suivantes sont explicitement exclues de la version 1.0 et prévues pour des itérations futures :

- Gestion de la paie et des ressources humaines
- Comptabilité analytique avancée (intégration expert-comptable)
- Marketplace de mise en relation artisans/clients
- Application mobile native (iOS / Android) — la PWA est prioritaire
- Gestion de stock et inventaire
- Signature électronique des devis
- Intégration Google Reviews / Trustpilot
- Mode multi-utilisateurs / équipe (plusieurs collaborateurs par compte)
- Paiement en ligne des factures par le client final (Stripe Checkout côté client)
- Gestion des sous-traitants
- Export comptable FEC (prévu v1.5 pour conformité fiscale avancée)
- Chatbot vocal (prévu v2)
- Module formation / tutoriels intégrés

---

*Document produit par l'équipe Traballo — Version 1.0 — Avril 2026*  
*Révisions majeures planifiées : après chaque phase de lancement (M3, M6, M12)*

---

**Fin du document**
