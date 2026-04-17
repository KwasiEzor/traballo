# Traballo - Guide de Déploiement Production

## Configuration du domaine traballo.pro (Hostinger)

### 1. Déployer sur Vercel

**A. Créer un compte Vercel:**
- Aller sur https://vercel.com
- Se connecter avec GitHub
- Importer le repository: `KwasiEzor/traballo`

**B. Configuration du projet:**
```bash
Framework Preset: Next.js
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
```

**C. Variables d'environnement (Vercel Dashboard):**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mdonhimuipkyllzbydni.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (secret)
DATABASE_URL=postgresql://... (pooled)
DIRECT_URL=postgresql://... (direct)

# App URLs
NEXT_PUBLIC_APP_URL=https://app.traballo.pro
NEXT_PUBLIC_ROOT_DOMAIN=traballo.pro

# API Keys (à obtenir)
ANTHROPIC_API_KEY=sk-ant-... (anthropic.com)
STRIPE_SECRET_KEY=sk_live_... (dashboard.stripe.com)
STRIPE_WEBHOOK_SECRET=whsec_... (après config webhook)
RESEND_API_KEY=re_... (resend.com)
```

**D. Déployer:**
- Cliquer sur "Deploy"
- Attendre la fin du build (~2-3 min)
- Noter l'URL Vercel: `traballo-xxx.vercel.app`

---

### 2. Configuration DNS sur Hostinger

**A. Accéder au DNS Hostinger:**
1. Se connecter à Hostinger
2. Aller dans "Domaines" → `traballo.pro`
3. Cliquer sur "Gérer" → "DNS / Nameservers"

**B. Ajouter les enregistrements DNS pour Vercel:**

**Domaine principal (traballo.pro):**
```
Type: A
Nom: @
Valeur: 76.76.21.21
TTL: 3600
```

**Wildcard pour sous-domaines (*.traballo.pro):**
```
Type: A
Nom: *
Valeur: 76.76.21.21
TTL: 3600
```

**Sous-domaines spécifiques (recommandé):**
```
Type: CNAME
Nom: app
Valeur: cname.vercel-dns.com
TTL: 3600

Type: CNAME
Nom: admin
Valeur: cname.vercel-dns.com
TTL: 3600

Type: CNAME
Nom: www
Valeur: cname.vercel-dns.com
TTL: 3600
```

---

### 3. Ajouter les domaines dans Vercel

**A. Dans Vercel Dashboard → Settings → Domains:**

Ajouter ces domaines:
```
traballo.pro (domaine principal)
www.traballo.pro (redirect vers traballo.pro)
app.traballo.pro (dashboard artisans)
admin.traballo.pro (super admin)
*.traballo.pro (wildcard pour sites artisans)
```

**B. Vérification DNS:**
- Vercel va vérifier les enregistrements DNS
- Attendre 5-30 min pour propagation
- Certificats SSL générés automatiquement

---

### 4. Configuration Supabase Production

**A. Créer un projet production (optionnel):**
Si vous voulez séparer dev/prod:
1. Aller sur dashboard.supabase.com
2. Créer un nouveau projet "traballo-production"
3. Région: Europe (Frankfurt ou Ireland)
4. Copier les nouvelles credentials

**B. Ou utiliser le projet existant:**
- Garder `mdonhimuipkyllzbydni` pour prod
- Créer un backup régulier

**C. Ajouter les domaines autorisés:**
Dans Supabase Dashboard → Authentication → URL Configuration:
```
Site URL: https://app.traballo.pro
Redirect URLs:
  https://app.traballo.pro/**
  https://admin.traballo.pro/**
  https://*.traballo.pro/**
```

---

### 5. Configuration Stripe (Production)

**A. Mode Production:**
1. Aller sur dashboard.stripe.com
2. Basculer en mode "Production"
3. Copier les clés de production

**B. Webhook Stripe:**
1. Dashboard → Developers → Webhooks
2. Ajouter un endpoint: `https://app.traballo.pro/api/webhooks/stripe`
3. Événements à écouter:
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copier le `Signing Secret` (STRIPE_WEBHOOK_SECRET)

---

### 6. Configuration Resend (Email)

**A. Vérifier le domaine:**
1. Aller sur resend.com → Domains
2. Ajouter `traballo.pro`
3. Ajouter les enregistrements DNS dans Hostinger:

```
Type: TXT
Nom: @
Valeur: [fourni par Resend]

Type: CNAME
Nom: resend._domainkey
Valeur: [fourni par Resend]

Type: MX
Nom: @
Valeur: feedback-smtp.eu-west-1.amazonses.com
Priorité: 10
```

**B. Email d'envoi:**
- Par défaut: `noreply@traballo.pro`
- Ou personnalisé: `factures@traballo.pro`

---

### 7. Vérifications Post-Déploiement

**A. Tester les routes:**
```
✓ https://traballo.pro → Landing page
✓ https://app.traballo.pro → Dashboard (redirect login)
✓ https://admin.traballo.pro → Admin panel
```

**B. Tester les fonctionnalités:**
- [ ] Création de compte
- [ ] Login/Logout
- [ ] Création facture
- [ ] Génération PDF
- [ ] Envoi email
- [ ] Création client
- [ ] Création rendez-vous

**C. Performance:**
- Lighthouse score > 90
- Time to First Byte < 200ms
- First Contentful Paint < 1s

---

### 8. Monitoring & Maintenance

**A. Vercel Analytics:**
- Activer dans Dashboard → Analytics
- Surveiller les erreurs et performances

**B. Sentry (optionnel):**
```bash
pnpm add @sentry/nextjs
```

**C. Backups Supabase:**
- Backups automatiques activés (payant)
- Ou exports manuels réguliers

**D. Logs:**
- Vercel Dashboard → Logs
- Supabase Dashboard → Logs

---

### 9. Sécurité Production

**A. Variables d'environnement:**
- ✓ Toutes les clés secrètes en `Secret` sur Vercel
- ✓ Jamais de commit de `.env.local` ou `.env.production`

**B. RLS Supabase:**
- ✓ Row Level Security activé sur toutes les tables
- ✓ Policies testées

**C. Rate Limiting:**
À ajouter avec Vercel Edge Config ou Upstash:
```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
```

---

### 10. Coûts Estimés

**Infrastructure:**
- Hostinger (domaine): ~10-15€/an
- Vercel Pro: 20$/mois (ou Hobby gratuit)
- Supabase Pro: 25$/mois (ou Free tier)
- Stripe: 1.4% + 0.25€ par transaction
- Resend: Gratuit jusqu'à 3000 emails/mois
- Anthropic: Pay-as-you-go

**Total estimé:** 45-70€/mois + usage variable

---

## Commandes Utiles

**Déploiement manuel:**
```bash
# Installer Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Déployer
vercel --prod

# Voir les logs
vercel logs
```

**Rollback:**
```bash
# Dashboard Vercel → Deployments → Trois points → Promote to Production
```

---

## Support

**Vercel:** https://vercel.com/docs
**Supabase:** https://supabase.com/docs
**Stripe:** https://stripe.com/docs
**Resend:** https://resend.com/docs

---

**Prochaines étapes recommandées:**
1. Déployer sur Vercel
2. Configurer DNS Hostinger
3. Tester app.traballo.pro
4. Configurer Stripe webhooks
5. Vérifier domaine Resend
6. Lancer en production! 🚀
