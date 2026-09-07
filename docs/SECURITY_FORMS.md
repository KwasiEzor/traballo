# Protection des formulaires publics

Endpoints exposés sans authentification :

| Endpoint | Effet d'une soumission | Coût d'un abus |
|---|---|---|
| `submitLead` (`src/app/sites/[slug]/actions.ts`) | email Resend + notification | réputation domaine d'envoi (partagée entre tous les tenants) |
| `POST /api/agent` | appel Anthropic en streaming | facture API directe |
| `POST /api/agent/lead` | email Resend + notification | idem `submitLead` |
| `submitContact` (`src/app/(marketing)/contact/actions.ts`) | email Resend | inbox interne |

Aucun filtre anti-bot n'est fiable à 100 %. La stratégie : **borner le rayon
d'impact** avec des plafonds, et réduire la friction bot avec des filtres en
amont.

## Les couches, de l'edge vers le métier

### 1. Edge — Vercel (à configurer dans le dashboard, hors code)

- **Firewall rate-limit rule** sur `POST /api/agent*` et l'action lead. Couche
  autoritaire, cross-instance, appliquée avant la fonction.
- **BotID** — détection bot au niveau plateforme, fonctionne sur tout domaine
  routé par Vercel, y compris les `sites.custom_domain`.

C'est ce qui couvre le trou laissé par Turnstile sur les domaines custom.

### 2. Turnstile (`src/lib/security/turnstile.ts`)

- **Un seul widget, validation hostname désactivée** côté Cloudflare → la même
  clé marche sur `*.traballo.pro` ET les domaines custom des artisans.
- Le serveur vérifie chaque token. La vitrine passe `allowAnyHostname: true`
  pour ignorer `TURNSTILE_HOSTNAMES` (le formulaire marketing garde le contrôle
  strict).
- **Politique vitrine** : token `missing` ou `rejected` → blocage. Cloudflare
  `unreachable` ou widget `disabled` → passage. La disponibilité du tunnel de
  leads prime sur la stricte fermeture.

### 3. Rate limit applicatif (`src/lib/security/rate-limit.ts`)

Fenêtre fixe en mémoire, **best-effort par instance** (l'état ne traverse pas
les instances). Map auto-bornée pour ne pas devenir elle-même un vecteur de
DoS mémoire. Couche intermédiaire, pas une garantie — la garantie est le
plafond ci-dessous.

- `submitLead` : 5 / 10 min par `IP + slug`
- `/api/agent` : 30 / 5 min par IP (avant tout appel Anthropic)
- `/api/agent/lead` : 5 / 10 min par IP

### 4. Plafond quotidien par tenant (`src/lib/security/lead-cap.ts`) — la garantie

Un site artisan ne peut générer qu'un nombre borné d'emails + notifications de
lead par jour UTC (`SITE_LEAD_DAILY_CAP`, défaut 30). Au-delà : **drop
silencieux** (réponse `ok`, ni email ni notification — le bot n'obtient aucun
signal).

Le compteur est dérivé des `notifications` de type `leads.*` déjà écrites :
exact, cross-instance, aucune table ajoutée.

Pire cas sous attaque distribuée (beaucoup d'IP, token contourné) : un tas
fixe de lignes DB. Jamais de dépense Resend/Anthropic non bornée.

### 5. Honeypot

Champ `website` caché sur chaque formulaire. Rempli → drop silencieux. Toujours
actif, coût nul, indépendant de tout service tiers.

## Ordre d'exécution dans le code

`parse → honeypot → rate limit → Turnstile → résolution tenant → plafond → envoi`
