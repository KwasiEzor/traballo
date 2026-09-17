# Beta Launch Plan

## Contexte

Suivi de la mise en ligne du correctif "retour à l'accueil" sur les pages
d'authentification, et préparation de l'instrumentation observabilité
(erreurs + analytics produit) pour la phase bêta.

## Fait

1. **Fix `AuthShell`** — les liens "Retour à l'accueil" et logo sur
   `/auth/*` pointaient vers `href="/"`, réécrit par le middleware en
   `/dashboard/` sur `app.traballo.pro` (route protégée) : un visiteur non
   connecté rebondissait sur `/auth/signin` au lieu d'atteindre la page
   d'accueil marketing. Corrigé pour pointer explicitement vers
   `https://<NEXT_PUBLIC_ROOT_DOMAIN>`. Test de régression ajouté
   (`tests/components/auth-shell.test.tsx`).
2. **PR [#8](https://github.com/KwasiEzor/traballo/pull/8)** — créée,
   mergée dans `main` (commit `e6cb52d`), déployée en production sur
   Vercel (`traballo.pro`, `www.traballo.pro`, `app.traballo.pro`).

## À faire — Observabilité bêta (Sentry + PostHog)

### Sentry (erreurs + performance)

- Plan **Developer (gratuit)** : 5 000 erreurs/mois + 10 000 unités de
  performance/mois, 1 utilisateur, rétention 30 jours. Le quota erreurs et
  transactions est partagé.
- Plan **Team** : à partir de **26 $/mois** (facturation annuelle, 29 $/mois
  en mensuel) pour 50 000 erreurs + 5M spans inclus, puis dépassement
  facturé à l'usage (~0,00029 $/erreur au-delà).
- Plan **Business** : à partir de **80 $/mois** (facturation annuelle,
  89 $/mois en mensuel) — mêmes quotas de base que Team, ajoute SSO/SAML,
  audit logs, rétention étendue.
- **Recommandation bêta** : démarrer sur le plan Developer gratuit. Pour un
  petit groupe d'artisans testeurs (quelques dizaines à ~100 utilisateurs
  actifs), 5 000 erreurs/mois suffisent largement en usage normal. Passer
  au plan Team (~26 $/mois) seulement si le volume d'erreurs dépasse le
  quota gratuit, ou si un deuxième compte utilisateur est nécessaire.

### PostHog (analytics produit + session replay + feature flags)

- **Tier gratuit** : 1M événements analytics/mois, 5 000 session
  replays/mois, 1M requêtes feature flags/mois — sans carte bancaire.
  PostHog indique que ~97 % des comptes restent sur ce tier.
- Au-delà du gratuit, facturation à l'usage, dégressive par palier :
  - **Analytics produit** : ~0,00005 $/événement (1-2M), puis dégressif
    jusqu'à ~0,000009 $/événement au-delà de 250M.
  - **Session replay** : ~0,005 $/enregistrement (5-15K), dégressif jusqu'à
    ~0,0015 $/enregistrement au-delà de 500K.
  - **Feature flags** : ~0,0001 $/requête (1-2M), dégressif jusqu'à
    ~0,00001 $/requête au-delà de 50M.
- **Recommandation bêta** : le tier gratuit couvre très confortablement une
  bêta fermée ou un lancement progressif (le seuil de 1M événements/mois
  correspond à un volume d'usage largement au-dessus de ce qu'une poignée
  d'artisans testeurs générera). Coût attendu en bêta : **0 €**.

### Estimation coût combiné bêta (échelle réduite : dizaines/petites
centaines d'utilisateurs actifs)

| Service  | Plan recommandé | Coût mensuel estimé |
| -------- | ---------------- | -------------------- |
| Sentry   | Developer (gratuit) | 0 $ |
| PostHog  | Free tier | 0 $ |
| **Total** | | **0 $/mois** |

À surveiller pour déclencher un upgrade :
- Sentry : volume d'erreurs approchant 5 000/mois, ou besoin d'un second
  compte/rôle admin → passer à Team (~26 $/mois).
- PostHog : volume d'événements approchant 1M/mois ou de session replays
  approchant 5 000/mois → basculer sur facturation à l'usage (coût encore
  marginal aux volumes bêta, de l'ordre de quelques dizaines de $/mois).

*Sources : recherche web du 2026-09-17, pricing sujet à changement — à
revérifier sur sentry.io/pricing et posthog.com/pricing avant décision
finale de budget.*
