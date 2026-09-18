# Système de notifications Traballo — évaluation & plan d'implémentation

> Rédigé le 2026-09-06. Recherche + évaluation, pré-implémentation.
> Références PRD : TRB-056→060, TRB-071, TRB-087, TRB-094→098, TRB-107, TRB-115.

## Statut

| Phase | État |
|---|---|
| **0 — Fondations** (schéma + `createNotification` + types + tests) | ✅ commit `f7d7f09` · migration 0010 appliquée en base |
| **Câblage événements existants** (leads site/IA, paiement échoué) | ✅ commit `b8ffe1c` |
| 1 — Centre in-app artisan (cloche + page + préférences) | ✅ migration 0012 (`notification_prefs`) — appliquée en base |
| 2 — Emails abonnement manquants | ✅ voir détail ci-dessous |
| 3 — Relances de factures + cron | ✅ voir détail ci-dessous — migration 0013 à appliquer |
| 4→9 | à faire |

### Décisions prises par défaut (à confirmer)

1. Plan Vercel — **supposé Pro** (crons horaires/minute OK). À vérifier avant Phase 3/4.
2. Prise de RDV publique — **option (b)** : notifs RDV limitées aux rendez-vous créés dans le dashboard.
3. Fournisseur SMS — non tranché (Phase 6).
4. Reçus de paiement — délégués à Stripe pour l'instant.
5. Gating — transactionnel = tous · relances/rappels auto = Pro+ · SMS/WhatsApp = Business · **push = Pro+** (voir `minPlan` dans `types.ts`).
6. Digest vs temps réel — **temps réel** immédiat ; `leads.ai_conversation` marqué `digestable` pour plus tard.

## 1. État des lieux

### Ce qui existe

| Brique | État |
|---|---|
| Toasts in-app (`sonner`) | OK — éphémère, dashboard only |
| Emails transactionnels + shell brandé (`src/lib/email/layout.tsx`, `EMAIL_BRAND`, Resend `sendEmail`) | Fondation solide |
| Auth : vérif e-mail / reset / magic link / bienvenue | OK (`AuthLinkEmail`, `WelcomeEmail` via `afterEmailVerification`) |
| Paiement échoué → artisan | OK (`PaymentFailedEmail`, webhook `invoice.payment_failed`) |
| Lead site public → artisan | OK (`submitLead` → `LeadEmail`) |
| Lead agent IA → artisan | OK (`/api/agent/lead` → `LeadEmail`) |
| Lead marketing → équipe | OK (`MarketingLeadEmail`) |
| Facture → client (envoi manuel) | OK (`InvoiceEmail`, `replyTo` = e-mail artisan) |

### Ce qui manque

- **Centre de notifications in-app** (cloche + liste + page) — inexistant, aucune table `notifications`
- **Préférences de notification** — aucun champ, aucun écran
- **Cron** — `vercel.json` n'a **aucun** cron ; pas de `CRON_SECRET`
- **Relances de factures** (TRB-056→060) — rien ; statut `overdue` jamais appliqué
- **Notifications RDV** (TRB-087, 094→098) — rien ; **pas de prise de RDV publique** (`sites/[slug]` n'a qu'un formulaire de contact ; les RDV sont créés à la main par l'artisan dans le dashboard)
- **Notif nouvelle conversation IA** (TRB-071) — rien
- **Emails abonnement** : activé / changé / annulé / reçu — rien (seul l'échec est câblé)
- **SMS** (Business, 100/mois) — rien
- **WhatsApp** (TRB-107) — rien
- **Web push** (TRB-115) — manifest PWA seul (`src/app/manifest.ts`), **pas de service worker**, pas de `web-push`, pas de clés VAPID
- **Notifications opérateur / super-admin** — rien
- **Annonces globales / maintenance** — rien (prévu Phase C super-admin)

## 2. Évaluation — tous les types de notifications

### Par canal

| Canal | Public | État | Usage |
|---|---|---|---|
| Toast in-app | artisan | OK | feedback immédiat d'action |
| Centre in-app (cloche) | artisan | à construire | historique, non-bloquant, tout événement |
| Email — shell Traballo | artisan, opérateur | OK | compte, facturation, alertes |
| Email — marque artisan (white-label) | client final | à construire (variante `EmailLayout`) | factures, relances, RDV (TRB-098) |
| SMS | client final, artisan | à construire | rappels RDV (Business) |
| WhatsApp | client final | à construire | rappels (Business, TRB-107) |
| Web push | artisan | à construire | nouveau lead / RDV / conversation IA |

Le **client final n'a pas de compte** → email + SMS/WhatsApp uniquement. L'opérateur → console admin + email.

### Par déclencheur

**A. Compte / auth (artisan)**
- vérif e-mail ✅ · reset ✅ · magic link ✅ · bienvenue ✅
- nouvelle connexion suspecte ❌ (nice-to-have) · e-mail/mot de passe changé ❌

**B. Abonnement Traballo (artisan)**
- échec paiement ✅
- abonnement activé ❌ · plan changé (up/downgrade) ❌ · abonnement annulé → retour Free ❌
- reçu / renouvellement ❌ (ou déléguer à Stripe)
- relance carte (dunning J+3/J+5) ⚠️ (Stripe smart-retries fait le gros ; 1 seul e-mail chez nous)
- quota atteint (100 SMS, limites Free) ❌

**C. Factures artisan → client (métier)**
- envoi ✅
- vue par le client ❌ (statut `viewed` existe, jamais posé — pixel/route de suivi)
- payée → reçu client ❌
- **relance J+7** ❌ (TRB-056) · **relance J+30** ❌ (TRB-057) · **relance manuelle 1-clic** ❌ (TRB-059)
- passage auto `overdue` ❌ · notif artisan « facture en retard » ❌
- **template de relance personnalisable** ❌ (TRB-060) · **on/off par facture ou global** ❌ (TRB-058)

**D. Rendez-vous (métier)** — *dépend d'une prise de RDV publique qui n'existe pas*
- nouveau RDV → artisan ❌ (TRB-087) · confirmation → client ❌ (TRB-094)
- **rappel client 24h avant** (config 24h/48h/1h) ❌ (TRB-095) · **rappel artisan 1h avant** ❌ (TRB-096)
- annulation → client (excuse + reprog.) ❌ (TRB-097) · RDV confirmé/refusé → client ❌
- templates brandés artisan ❌ (TRB-098)

**E. Agent IA (métier)**
- nouveau lead → artisan ✅
- **nouvelle conversation → artisan** (push/email configurable) ❌ (TRB-071)
- résumé quotidien des conversations ❌ (nice)

**F. Site public (métier)**
- demande de contact → artisan ✅
- accusé de réception → visiteur ❌ (nice)

**G. Opérateur / super-admin**
- nouvelle inscription ❌ · nouvel abonnement payant ❌ · churn ❌
- digest quotidien des paiements échoués ❌
- alerte coût API (Anthropic/Resend/SMS > seuil) ❌
- échecs webhook Stripe répétés ❌ · rapport hebdo KPI ❌

**H. Système / annonces**
- maintenance planifiée ❌ · changelog in-app ❌ · bannière globale ❌ (Phase C)

### Découpage par plan (d'après le PRD)

- **Free** : transactionnel seulement (auth, facture envoyée manuellement). Pas de relances/rappels automatiques.
- **Pro** : + centre in-app, + relances factures, + rappels RDV par e-mail, + web push.
- **Business** : + SMS (100/mois), + WhatsApp.

## 3. Best practices (recherche)

1. **Transactionnel vs marketing** — séparer strictement. RGPD/CAN-SPAM : le transactionnel (facture, RDV, paiement, auth) ne requiert pas d'opt-out ; le produit/marketing exige opt-in + désabonnement + en-têtes `List-Unsubscribe` / `List-Unsubscribe-Post` (obligatoire Gmail/Yahoo pour envois en masse). Idéalement sous-domaines d'envoi distincts (`notifications@` vs `hello@`).
2. **Centre de notifications = une ligne par destinataire** — table `notifications` (recipient, type, title, body, `data` jsonb, `action_url`, `read_at`, `created_at`), index `(user_id, read_at, created_at)`, badge = `count(*) where read_at is null`, purge > 90 j par cron.
3. **Préférences = matrice type × canal** avec défauts sains, + *quiet hours* (SMS client interdit 21h–8h), + option **digest** (immédiat vs résumé quotidien) pour le bruyant (nouvelle conversation IA).
4. **Idempotence** — tout envoi planifié est clé `(entity_id, kind)` dans un registre `notification_deliveries` avec contrainte unique → un cron rejoué ne double-envoie jamais.
5. **Vercel Cron** — endpoints protégés par `Authorization: Bearer ${CRON_SECRET}` (Vercel l'injecte). Idempotent, batch, borné < 60 s (paginer sinon), logs structurés. Rappels factures = quotidien ; rappels RDV = **horaire** (fenêtres 24h/1h). ⚠️ La granularité dépend du plan Vercel (Hobby = 2 crons/jour ; Pro = fréquence libre) — à confirmer.
6. **Suivi de délivrabilité** — webhooks Resend (`delivered`/`bounced`/`complained`) → statut + liste de suppression + **prévenir l'artisan si l'e-mail de son client bounce**.
7. **Double audience (artisan + son client)** — les e-mails vers le client final portent la **marque de l'artisan** (nom, logo, couleur, reply-to = e-mail artisan), pas Traballo (TRB-098). `EmailLayout` a besoin d'une variante `brand`. `InvoiceEmail` le fait déjà à moitié (signature).
8. **Rate limiting** — plafond par tenant/heure ; debounce « nouvelle conversation IA » à 1/visiteur/heure.
9. **SMS** — pour l'EU francophone + RGPD, privilégier un fournisseur EU (Brevo, OVH SMS, Octopush) vs Twilio ; **sender ID alphanumérique à pré-déclarer** en FR/BE ; ~0,045 €/SMS ; compteur d'usage + blocage/upsell au-delà de 100.
10. **WhatsApp** — WhatsApp Business Cloud API (Meta) ou via fournisseur ; **vérification Meta Business + templates HSM pré-approuvés** (délai long → démarrer tôt).
11. **Web push** — `web-push` + VAPID ; service worker avec handlers `push` + `notificationclick` ; table `push_subscriptions` ; purge sur `410 Gone` ; iOS = uniquement PWA installée (16.4+) ; prompt contextuel, jamais au chargement.
12. **Observabilité** — page super-admin « Notifications » : volume, échecs, coût par canal.

## 4. Plan d'implémentation détaillé

### Phase 0 — Fondations (~0,5 j)

- **Migration 0010** : `notifications`, `notification_prefs`, `notification_deliveries` (registre idempotence), `push_subscriptions`. RLS + `REVOKE ALL ... FROM authenticated` comme 0008/0009. `notifications` : policy `tenant_isolation` sur `tenant_id`. Registre + subs = owner only.
- `src/lib/notifications/types.ts` — union `NotificationType` + map métadonnées (canaux par défaut, catégorie, plan minimal, digestable).
- `src/lib/notifications/create.ts` — `createNotification({tenantId, userId?, type, title, body, data, actionUrl})` : écrit la ligne in-app, puis dispatch email/push selon prefs. **Point d'entrée unique.**
- `src/lib/notifications/prefs.ts` — lecture + merge défauts avec `db.select()` core (⚠️ pas le query builder relationnel — hang connu via pooler Neon).
- Câbler les événements **déjà en place** vers `createNotification` (in-app) : nouveau lead site, nouveau lead IA, paiement échoué.
- Env : `CRON_SECRET`.

### Phase 1 — Centre in-app artisan (~1 j) ✅

- `<NotificationBell>` dans `src/components/dashboard/topbar.tsx` — compteur non-lus, dropdown 10 derniers, « tout marquer lu », lien page complète. Fait.
- `src/app/dashboard/notifications/page.tsx` — liste paginée (20/page) + filtres par catégorie. Fait.
- Actions : `markReadAction`, `markAllReadAction` (`src/app/dashboard/notifications/actions.ts`) + `revalidatePath`. Rafraîchissement `router.refresh()` toutes les 60 s (pas de websocket à cette échelle). Fait.
- `src/app/dashboard/settings` — onglet « Notifications » : matrice de toggles (email / in-app / push par catégorie), `src/app/dashboard/settings/notification-prefs-form.tsx` + `setNotificationPref`. Fait — **note** : le toggle push n'appelle pas encore la permission navigateur (`Notification.requestPermission` + sauvegarde `push_subscriptions`) car le web push arrive en Phase 5 ; pour l'instant il n'enregistre qu'une préférence inerte.
- Migration 0012 (`notification_prefs` : `tenant_id`, `user_id`, `category`, `email`/`in_app`/`push`/`sms` bool, pk `(user_id, category)`, RLS `authenticated` sur `tenant_id`) — générée et appliquée en base.
- `createNotification` consulte désormais les préférences (`src/lib/notifications/prefs.ts`) et saute l'écriture in-app pour un type non transactionnel si le destinataire a coupé `in_app` sur sa catégorie.

### Phase 2 — Emails abonnement manquants (~0,5 j) ✅

- Nouveaux templates (`src/lib/email/templates/`) : `subscription-started-email`,
  `subscription-changed-email`, `subscription-canceled-email`,
  `quota-warning-email`. Coquille Traballo standard (pas de marque
  artisan — ces mails vont à l'artisan, pas à son client).
- **Écart volontaire par rapport au plan initial** : plutôt que de
  mapper un type d'e-mail par type d'événement Stripe
  (`checkout.session.completed` → started, `subscription.updated` →
  changed, `subscription.deleted` → canceled), `syncSubscriptionToTenant`
  (`src/lib/stripe/billing.ts`) retourne désormais `{previousPlan,
  newPlan}` et un helper `notifyPlanTransition`
  (`src/app/api/webhooks/stripe/route.ts`) réagit à la **transition
  réelle** de plan, peu importe l'événement qui l'a déclenchée :
  free→payant = started, payant→payant différent = changed,
  payant→free = canceled, plan inchangé = rien. `customer.subscription.updated`
  se déclenche pour beaucoup de changements sans rapport avec le plan
  (fin d'essai, métadonnées, proration) — le mapper directement aurait
  spammé l'artisan. Bénéfice secondaire : Checkout envoie
  `checkout.session.completed` *et* `customer.subscription.created` pour
  un même abonnement — avec le diff, le deuxième événement ne renvoie
  rien puisque la transition est déjà persistée par le premier
  (idempotent sans registre supplémentaire).
- Câblé sur les 3 event handlers qui appellent déjà
  `syncSubscriptionToTenant` : `checkout.session.completed`,
  `customer.subscription.{created,updated,deleted}`, `invoice.paid`.
- `billing.subscription_started` / `_changed` / `_canceled` : notif
  in-app en plus de l'e-mail (déjà déclarées dans `NOTIFICATION_TYPES`
  côté Phase 0).
- `quota_warning` : template construit (la matrice email/in-app/push le
  couvre déjà côté préférences) mais **pas câblé** — aucun quota mesuré
  n'existe encore côté produit (les SMS de la Phase 6 sont le premier
  cas d'usage réel).
- Tests : `tests/lib/email/templates.test.ts` (5 nouveaux cas),
  `tests/lib/stripe/billing.test.ts` (retour `{previousPlan, newPlan}`),
  `tests/integration/api/stripe-webhook.test.ts` (nouveau — les 4
  transitions via le handler complet).

### Phase 3 — Relances de factures / cron (~1,5 j) — TRB-056→060 ✅

- Migration 0013 : `artisan_profiles.invoice_reminder_enabled` (bool, défaut
  `true`) + `artisan_profiles.invoice_reminder_template` (text nullable —
  `null` = modèle FR par défaut) ; `invoices.reminder_override`
  (`default|off`). Pas de nouvelle table de settings dédiée — deux colonnes
  ne justifiaient pas d'en créer une, `artisan_profiles` est déjà le
  "settings métier" par tenant.
- `vercel.json` : `crons: [{ path: "/api/cron/invoice-reminders", schedule: "0 7 * * *" }]`.
  Un cron quotidien tient dans les limites du plan Hobby (contrairement à un
  cron horaire, cf. Phase 4) — la décision "plan Vercel" du §8 ne bloquait
  donc pas cette phase.
- `src/lib/invoices/reminders.ts` — pur, testé isolément :
  `dueReminders(invoice, today, alreadySentKinds)` (jalons J+7/J+30 dus,
  respecte `reminderOverride` + statut), `shouldMarkOverdue`,
  `renderReminderTemplate` (placeholders `{{client}} {{number}} {{amount}}
  {{days}} {{link}}`), `DEFAULT_REMINDER_TEMPLATE`.
- `src/app/api/cron/invoice-reminders/route.ts` — `GET`, garde
  `Authorization: Bearer $CRON_SECRET` ; requête cross-tenant (connexion
  `db` propriétaire, comme le webhook Stripe — pas de `withTenant`, il n'y
  a pas de tenant de la requête ici) sur les factures `sent|viewed|overdue`
  en retard. Bascule `overdue` pour **tous les plans** (hygiène de statut,
  pas une "relance") ; envoie les rappels e-mail **Pro+ uniquement**
  (`isPremiumPlan`), idempotent via `notification_deliveries`
  (`entityType='invoice', kind='j7'|'j30', channel='email'`,
  `onConflictDoNothing`).
- Relance manuelle : bouton « Relancer » sur la fiche facture (Pro+,
  statuts `sent|viewed|overdue`, client avec e-mail) → action
  `sendInvoiceReminder(invoiceId)` (`src/app/dashboard/invoices/actions/send-reminder.ts`).
  N'écrit pas dans le registre — c'est un envoi volontaire, pas une relance
  planifiée à dédupliquer.
- Toggle par facture : `InvoiceReminderToggle` sur la fiche facture →
  `updateInvoiceReminderOverride`. Toggle + modèle éditable au niveau
  tenant : onglet « Factures » dans les paramètres (verrouillé Free avec
  upsell `UpgradeButton`, comme l'onglet Agent IA) →
  `saveInvoiceReminderSettings`.
- `InvoiceReminderEmail` (`src/lib/email/templates/`) — même schéma de
  branding léger que `InvoiceEmail` (`signature`/`footnote`, pas de
  variante `brand` dédiée sur `EmailLayout` — inutile pour ce qui existe
  aujourd'hui).
- Tests : `tests/lib/invoices/reminders.test.ts` (16, pur),
  `tests/integration/api/cron-invoice-reminders.test.ts` (7),
  `tests/integration/actions/send-reminder.test.ts` (5),
  `tests/integration/actions/invoice-reminder-settings.test.ts` (6),
  + 1 cas dans `templates.test.ts`.

### Phase 4 — Notifications RDV / cron (~2 j) — TRB-087, 094→098

- **Dépendance** : pas de prise de RDV publique. Deux options :
  - **(a)** construire d'abord la prise de RDV publique (débloque toute la suite),
  - **(b)** limiter aux RDV créés par l'artisan : rappel client si `client.email`/`phone` connu + rappel artisan.
  - **Recommandation : (b) maintenant, (a) comme feature séparée.**
- Migration : `appointments` `reminder_offset_minutes` (défaut 1440) ; registre réutilisé.
- `vercel.json` : `{ path: "/api/cron/appointment-reminders", schedule: "0 * * * *" }` (horaire).
- Route : RDV statut ∈ (`pending`,`confirmed`) ; `start_time` dans [maintenant+offset ±30 min] → rappel client (brandé artisan) ; dans [maintenant+45–75 min] → rappel artisan (in-app + push + email) ; registre.
- `create-appointment` → confirmation client si joignable. `update-status` → `confirmed`/`cancelled` → notif client (annulation = excuse + CTA reprise de contact).
- Templates : `AppointmentConfirmationEmail`, `AppointmentReminderEmail`, `AppointmentCancelledEmail` — brandés artisan.
- Câbler aussi TRB-071 : `src/app/api/agent/route.ts` à la 1ʳᵉ création de conversation → `createNotification` artisan (debounce 1/visiteur/h, digestable).

### Phase 5 — Web push PWA (~1,5 j) — TRB-115

- `pnpm add web-push` ; env `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT`.
- `public/sw.js` — handlers `push` → `showNotification`, `notificationclick` → focus/ouvre `action_url`. Enregistrement dans un composant client.
- `push_subscriptions` (Phase 0). Sauvegarde à l'octroi de permission. Purge sur `410`.
- `src/lib/notifications/push.ts` — `sendPush(userId, {title, body, url})`. Branché dans le dispatch de `createNotification`.

### Phase 6 — SMS Business (~2 j) — PRD 100/mois

- Choix fournisseur via skill `marketplace` (Brevo/OVH EU vs Twilio). Sender ID FR/BE, RGPD.
- `src/lib/notifications/sms.ts` — `sendSms(to, body)`. Env.
- Compteur `sms_usage` par tenant/mois → plafond 100, affichage settings, blocage + upsell au dépassement.
- Branché dans rappels RDV client (et factures en option) si plan = business ∧ téléphone connu ∧ sous quota. Quiet hours 21h–8h.

### Phase 7 — WhatsApp Business (~3 j) — TRB-107

- Meta Cloud API ou via fournisseur. Vérif Business + templates approuvés (**démarrer la procédure tôt**).
- `src/lib/notifications/whatsapp.ts`, même hook de dispatch.

### Phase 8 — Notifications opérateur (~1 j)

- `createNotification` avec destinataire « opérateur », ou table `admin_notifications` + digest e-mail vers `ADMIN_EMAILS`.
- Événements : inscription, abonnement payant, churn, digest quotidien paiements échoués, KPI hebdo, seuil coût API, échecs webhook Stripe répétés.
- `vercel.json` : `{ path: "/api/cron/operator-digest", schedule: "0 6 * * *" }`.

### Phase 9 — Annonces / système (plus tard, avec Phase C super-admin)

- Table `announcements`, bannière in-app ciblée par plan ; mode maintenance via flag Edge Config.

### Transverse

- `/api/webhooks/resend` — `delivered`/`bounced`/`complained` → statut `notification_deliveries` + suppression + notif artisan si bounce client.
- En-têtes `List-Unsubscribe` sur le non-critique.
- Page super-admin « Notifications » : volume / échecs / coût par canal.
- **Règle** : tout e-mail vers un client final = marque artisan ; tout e-mail vers l'artisan/opérateur = shell Traballo.

## 5. Schémas DB (migration 0010)

```
notifications
  id uuid pk · tenant_id uuid fk · user_id text fk (destinataire)
  type text · title text · body text · data jsonb · action_url text
  read_at timestamp null · created_at timestamp
  idx (user_id, read_at, created_at)

notification_prefs
  tenant_id uuid · user_id text · category text
  email bool · in_app bool · push bool · sms bool
  pk (user_id, category)   -- ou 1 colonne jsonb sur un settings table à cette échelle

notification_deliveries      -- registre d'idempotence
  id uuid pk · entity_type text · entity_id uuid · kind text  (ex: 'invoice' / 'j7')
  channel text · status text · sent_at timestamp
  unique (entity_type, entity_id, kind, channel)

push_subscriptions
  id uuid pk · user_id text · endpoint text unique
  p256dh text · auth text · created_at timestamp
```

Toutes : `ENABLE ROW LEVEL SECURITY` + `REVOKE ALL ... FROM authenticated`. `notifications` : policy `tenant_isolation` sur `tenant_id`.

## 6. Crons (`vercel.json`)

```
0 7 * * *   /api/cron/invoice-reminders      quotidien 09h Paris (été)
0 * * * *   /api/cron/appointment-reminders  horaire
0 6 * * *   /api/cron/operator-digest        quotidien
0 3 * * 0   /api/cron/notifications-purge    hebdo, > 90 j
```

Garde commune : `if (req.headers.authorization !== \`Bearer ${process.env.CRON_SECRET}\`) return 401`.

## 7. Charge & séquencement

| Bloc | Effort |
|---|---|
| Cœur haute valeur : Phases 0→3 (centre + transactionnel + relances factures) | **~4,5 j** |
| + Phase 5 (push) + Phase 4b (RDV dashboard) + Phase 8 (opérateur) | +4,5 j |
| + Phases 6/7 (SMS/WhatsApp) + 9 (annonces) | +8 j |
| **Total** | **~20 j** |

Ordre conseillé : **0 → 1 → 2 → 3 → 5 → 4b → 8 → 6 → 7 → 9**.

## 8. Décisions nécessaires avant de coder

1. **Plan Vercel ?** — non bloquant pour la Phase 3 : un cron quotidien
   (`invoice-reminders`) passe sur Hobby. Reste bloquant pour la **Phase 4**
   (rappels RDV horaires) — Hobby limite à une fréquence quotidienne, Pro
   requis pour du horaire/minute.
2. **Prise de RDV publique** : la construire (débloque toute la suite RDV) ou limiter les notifs RDV aux rendez-vous créés dans le dashboard ?
3. **Fournisseur SMS** : EU/FR (Brevo, OVH — meilleur RGPD, sender ID) vs Twilio (plus simple, global) ?
4. **Reçus de paiement** : e-mails brandés maison, ou déléguer aux reçus Stripe natifs ?
5. **Gating exact** : transactionnel = tous · relances/rappels auto = Pro+ · SMS/WhatsApp = Business · **push = Pro+ ou tous ?**
6. **Digest vs temps réel** pour le bruyant (nouvelle conversation IA) — défaut ?
