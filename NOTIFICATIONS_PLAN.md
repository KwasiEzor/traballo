# Système de notifications Traballo — évaluation & plan d'implémentation

> Rédigé le 2026-09-06. Recherche + évaluation, pré-implémentation.
> Références PRD : TRB-056→060, TRB-071, TRB-087, TRB-094→098, TRB-107, TRB-115.

## Statut

| Phase | État |
|---|---|
| **0 — Fondations** (schéma + `createNotification` + types + tests) | ✅ commit `f7d7f09` — **migration 0010 pas encore appliquée en base** (`pnpm db:migrate` à lancer) |
| 1 — Centre in-app artisan | à faire |
| 2→9 | à faire |

**Câblage des événements existants** (leads site/IA, paiement échoué → `createNotification`) : à faire **après** application de la migration 0010, sinon `db.insert(notifications)` échoue en prod.

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

### Phase 1 — Centre in-app artisan (~1 j)

- `<NotificationBell>` dans `src/components/dashboard/topbar.tsx` (cluster `ml-auto`) — compteur non-lus, dropdown 10 derniers, « tout marquer lu », lien page complète.
- `src/app/dashboard/notifications/page.tsx` — liste paginée + filtres.
- Actions : `markRead`, `markAllRead` + `revalidatePath`. Rafraîchissement `router.refresh()` toutes les 60 s (pas de websocket à cette échelle).
- `src/app/dashboard/settings` — onglet « Notifications » : matrice de toggles (email / in-app / push par catégorie). Le toggle push déclenche la permission navigateur + sauvegarde subscription.

### Phase 2 — Emails abonnement manquants (~0,5 j)

- White-label `EmailLayout` → prop `brand` ; `artisanBrandFromProfile(profile)`.
- Nouveaux templates : `subscription-started`, `subscription-changed`, `subscription-canceled`, `quota-warning`.
- Câbler dans `src/app/api/webhooks/stripe/route.ts` : `checkout.session.completed` → started ; `customer.subscription.updated` (changement de prix) → changed ; `customer.subscription.deleted` → canceled.
- Tests dans `tests/lib/email/templates.test.ts` (harnais existant).

### Phase 3 — Relances de factures / cron (~1,5 j) — TRB-056→060

- Migration : settings tenant `invoice_reminder_enabled` (défaut on) + `invoice_reminder_template` ; `invoices` `reminder_override` (`default|off`).
- `vercel.json` : `crons: [{ path: "/api/cron/invoice-reminders", schedule: "0 7 * * *" }]`.
- `src/app/api/cron/invoice-reminders/route.ts` — garde `CRON_SECRET` ; factures statut ∈ (`sent`,`viewed`,`overdue`), `due_date < today` ; fonction pure `dueReminders(invoice, today, ledger)` → jalons J+7 / J+30 non déjà envoyés → `InvoiceReminderEmail` (marque artisan, reply-to artisan) au client + `createNotification` artisan ; passe statut `overdue` ; écrit le registre.
- Relance manuelle : bouton dans la liste des factures → action `sendInvoiceReminder(invoiceId)` (`kind='manual'`, ignore les jalons).
- Template éditable : placeholders `{{client}} {{number}} {{amount}} {{days}} {{link}}` ; défaut FR.
- On/off : toggle tenant dans settings + case par facture dans le formulaire.
- Tests : `dueReminders` (pur), route mince.

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

1. **Plan Vercel ?** (Hobby = 2 crons/jour seulement → Phases 3/4 impossibles telles quelles ; Pro requis).
2. **Prise de RDV publique** : la construire (débloque toute la suite RDV) ou limiter les notifs RDV aux rendez-vous créés dans le dashboard ?
3. **Fournisseur SMS** : EU/FR (Brevo, OVH — meilleur RGPD, sender ID) vs Twilio (plus simple, global) ?
4. **Reçus de paiement** : e-mails brandés maison, ou déléguer aux reçus Stripe natifs ?
5. **Gating exact** : transactionnel = tous · relances/rappels auto = Pro+ · SMS/WhatsApp = Business · **push = Pro+ ou tous ?**
6. **Digest vs temps réel** pour le bruyant (nouvelle conversation IA) — défaut ?
