# DECISIONS — journal des décisions non évidentes

Format : décision · pourquoi · conséquence. Une entrée par décision. Ne pas réécrire l'histoire : ajouter une nouvelle entrée qui remplace l'ancienne.

## 2026-09-03 — Supabase → Neon Postgres + Better Auth

- **Pourquoi** : Better Auth auto-hébergé dans la même base que l'app (tables `user/session/account/verification`), moins de dépendances externes.
- **Conséquence** : `users.id` passe en `text` (FK vers `user.id`). Le rôle `neondb_owner` a `BYPASSRLS` : l'export `db` contourne la RLS. `authenticated` est le rôle non-bypass utilisé par `withTenant()`.
- **RGPD** : la base de prod doit être en `eu-central-1` (Francfort). Le projet dev est en us-east-2.
- **Dépendances imposées** : zod 4, drizzle-orm 0.45, drizzle-kit 0.31, drizzle-zod 0.8, @hookform/resolvers 5.

## 2026-09-03 — Provisioning du tenant dans un hook Better Auth

`ensureTenantForUser()` est appelé depuis `databaseHooks.user.create.after`. Couvre email/mot de passe **et** Google d'un seul point.

## 2026-09-05 — Assistant IA du site vitrine réservé au plan Business

- **Pourquoi** : c'est la fonctionnalité « Agent IA 24h/24 », donc le levier d'upsell, et elle a un coût Anthropic par message.
- **Conséquence** : `resolvePublicSite` et `loadAgentContext` filtrent sur `plan === "business"`. `/dashboard/agent` reste utilisable pour préparer l'agent. `menuiserie-demo` est en `business` via le seed.
- **Quotas** : free 50 / pro 500 / business illimité, par mois. Modèle : Haiku 4.5.

## 2026-09-05 — Clé Anthropic configurable côté admin

Stockée chiffrée (AES-256-GCM, clé dérivée de `BETTER_AUTH_SECRET`) dans `app_settings`, avec repli sur la variable d'environnement.

## 2026-09-05 — Turnstile : échec « ouvert »

La vérification échoue ouverte si le widget est absent ou injoignable, fermée seulement sur rejet explicite. **Pourquoi** : un widget cassé ne doit pas mettre le formulaire de contact hors service. La garantie réelle contre l'abus est le plafond de leads par tenant/jour, pas Turnstile.

## 2026-09-06 — Console admin : impersonation par jeton signé

HMAC (`BETTER_AUTH_SECRET`), 60 min, cookie httpOnly `traballo_imp`. `requireAuth()` le prend en compte. Toute action admin est journalisée dans `admin_audit_log` (RLS deny-all).

## 2026-09-06 — Facturation par Stripe Checkout + portail

État du plan mis à jour de façon **déclarative et idempotente** depuis le webhook (`syncSubscriptionToTenant`), pas de logique impérative par événement.

## 2026-09-07 — Anti-abus en couches sur les endpoints publics

Turnstile + rate limit en mémoire (par instance, best effort) + honeypot + **plafond dur par tenant/jour** (`SITE_LEAD_DAILY_CAP`, défaut 30, les leads au-delà sont écartés silencieusement). **Pourquoi** : borner le pire cas même si les autres couches sont contournées. Détail : `docs/SECURITY_FORMS.md`.

## 2026-09-25 — `main` protégée, CI requise, sans approbation

- **Pourquoi** : du code arrive par plusieurs canaux (sessions locales, sessions Claude web). La CI n'a de valeur que si elle bloque. `enforce_admins` activé, sinon les pushes faits avec le compte admin la contourneraient.
- **Sans approbation** (0 review) : développeur solo, une review obligatoire bloquerait sans rien apporter.
- **Non strict** (branche pas forcément à jour avec `main`) : moins de friction ; à durcir si des merges verts cassent `main`.

## 2026-09-25 — Mémoire projet : état dans le repo, pas dans `memory/`

- **Pourquoi** : les mémoires « état du projet » périment (contradictions constatées le 2026-09-25 : migration 0010 à la fois « non appliquée » et « appliquée »).
- **Conséquence** : l'état vit dans `docs/STATE.md` (versionné, daté, revérifié). `memory/` ne garde que préférences, leçons et références externes.

## 2026-09-26 — Phase 1 des notifications coupée en 1a / 1b

- **1a** (cloche, page, marquer lu) livrée seule : aucune migration, donc aucun risque sur la base partagée dev/prod.
- **1b** (préférences) à part : elle exige une nouvelle table `notification_prefs` (absente de la migration 0010 malgré le plan) et une migration sur la base partagée.
- **Rafraîchissement** de la cloche : `router.refresh()` toutes les 60 s, seulement si l'onglet est visible. Pas de websocket à cette échelle.
- **`actionUrl`** limité aux chemins internes (`safeActionUrl`) : il est rendu comme lien, un `javascript:` ou `//hôte` serait une faille.
- Les requêtes du fil prennent la transaction en paramètre (`readSummary`, `readPage`, `stampRead`) pour être testables contre la vraie base dans une transaction annulée.

## 2026-09-26 — Préférences de notification (Phase 1b)

- **Réglables** : in-app et e-mail, par catégorie (`leads`, `invoices`, `appointments`). `billing` reste transactionnel, non réglable. Push en Phase 5.
- **E-mail des demandes de contact verrouillé** (`alwaysOn` dans le catalogue) : une demande manquée, c'est un client perdu.
- **Stockage par utilisateur** (pk `user_id, category`, pas de ligne = défauts). Une notification adressée au tenant (`userId` null) suit les préférences du **propriétaire**. Avec les équipes, il faudra une ligne de notification par destinataire.
- **Échec ouvert** : si la lecture des préférences échoue à la livraison, on livre avec les défauts. Une notification coupée par erreur coûte moins qu'une demande perdue.
- **Reportés** : *quiet hours* (utile seulement au SMS, Phase 6) et *digest* (conversations IA).
- Enregistrement refusé en mode support (impersonation) : c'est un réglage personnel de l'artisan.
- Migration 0012 appliquée **avant** le merge : la page Paramètres lit la table.

## 2026-09-26 — Phase 2 des notifications coupée en 2a / 2b

- **Pourquoi** : le seul quota réel est celui des messages de l'agent IA ; l'alerte touche une route publique et demande une garde « une fois par mois ». Les e-mails d'abonnement n'en dépendent pas.
- **Déclencheur des e-mails d'abonnement = transition d'état**, pas l'événement Stripe : Stripe émet 3 à 4 événements pour une souscription (`checkout.session.completed`, `customer.subscription.created`, `invoice.paid`, `customer.subscription.updated`) et les rejoue. L'état `(plan, abonnement)` est lu et écrit sous verrou de ligne : une transition = un envoi, même avec des événements concurrents.
- **« Annulé »** part au retour effectif en Free, pas à la demande d'annulation (l'artisan garde son plan jusqu'à la fin de la période).
- **Alerte quota ouverte au plan Free** : c'est là qu'elle sert (moment de passer au plan supérieur).
- **White-label `EmailLayout` reporté en Phase 3** : aucun e-mail d'abonnement n'en a besoin (ils vont à l'artisan, marque Traballo).

## 2026-09-26 — Phase 2b sans objet

- Remplace la partie 2b de l'entrée « Phase 2 des notifications coupée en 2a / 2b ».
- **Constat** : l'agent IA du site est réservé au plan Business (`loadAgentContext`), qui n'a pas de quota (`messageQuota("business") === null`). Le quota Free / Pro (50 / 500) de `/api/agent` n'est donc jamais atteint. La limite « 10 factures / mois » du plan Free, annoncée sur la page tarifs, n'est pas appliquée non plus.
- **Conséquence** : aucun quota réel, pas d'alerte à construire. `billing.quota_warning` reste au catalogue, inutilisé. La limite Free non appliquée est un point ouvert (`STATE.md`).

## 2026-09-26 — Phase 3 (relances de factures) : cadrage 3a / 3b

- **3a** : relances automatiques + statut en retard + white-label. **3b** : relance manuelle, template éditable, override par facture.
- **Qui** : relances automatiques pour Pro / Business (promesse de la page tarifs). Le passage en `overdue` vaut pour tous les plans.
- **Jalons** : J+7 et J+30 après l'échéance, chacun une fois (`notification_deliveries`). Si le cron a raté un jalon, on envoie le plus récent atteint, jamais deux d'un coup. Le claim est libéré si l'envoi échoue : le cron du lendemain réessaie.
- **E-mail au client** : marque de l'artisan, reply-to artisan, PDF en pièce jointe (il n'existe pas de page publique de facture et le PDF est un data URL en base).
- **Interrupteur** `artisan_profiles.invoice_reminders`, défaut **on** : une seule facture en base au 2026-09-26 (un brouillon de démo), aucun client réel ne reçoit de relance surprise. L'artisan est notifié à chaque relance.
- **« Facture en retard »** à l'artisan : premier e-mail artisan qui passe par les préférences (`createNotification` envoie l'e-mail si le canal est actif).
- **Cron** : quotidien à 07:00 UTC ; « aujourd'hui » = date à Europe/Paris. Protégé par `CRON_SECRET`.

## 2026-09-26 — Phase 3b recadrée

- **Bouton « Relancer »** pour tous les plans, 1 par jour et par facture (registre, kind `manual:<date>`), **sans changer le statut**. Il remplace « Envoyer » sur une facture en retard : renvoyer la facture la repassait en `sent`, le cron la remettait `overdue` et renvoyait la notif « en retard » (doublon introduit par la 3a).
- **IBAN + référence** ajoutés aux relances (et à l'envoi initial) quand l'artisan a renseigné son IBAN : aujourd'hui l'IBAN n'apparaît nulle part, ni sur le PDF ni dans les e-mails.
- **Template éditable abandonné** : peu de valeur face au texte par défaut, pour un éditeur, un aperçu et une surface d'injection. L'IBAN apporte davantage.
- **Suspension par facture** (`invoices.reminders_paused`, migration 0014) : cas d'un échéancier convenu avec le client.
- **PDF réellement joint** à l'envoi initial (`sendInvoiceEmail`) : le dialogue le promettait, l'e-mail portait un lien data URL que les clients mail bloquent.
