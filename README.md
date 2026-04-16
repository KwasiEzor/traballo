# Traballo — Setup Claude Code Agents

> Configuration complète pour un développement IA-assisté optimal de Traballo.

## Démarrage rapide

```bash
# Installer Claude Code
npm install -g @anthropic-ai/claude-code

# Lancer dans le projet
cd traballo/
claude

# Premier lancement — Claude lit automatiquement CLAUDE.md
# et charge la mémoire du projet
```

---

## Structure du setup

```
traballo/
├── CLAUDE.md                          ← Mémoire principale (chargée à chaque session)
├── .claude/
│   ├── settings.json                  ← Config Claude Code (modèle, permissions, hooks)
│   ├── agents/                        ← Sous-agents spécialisés
│   │   ├── architect.md               ← Décisions d'architecture (Opus 4.6)
│   │   ├── api-developer.md           ← Backend, Server Actions, API routes
│   │   ├── frontend-developer.md      ← Composants React, pages, formulaires
│   │   ├── tdd-engineer.md            ← Tests (toujours avant le code)
│   │   ├── database-engineer.md       ← Schéma Drizzle, migrations, RLS
│   │   └── security-reviewer.md       ← Audit sécurité, isolation tenant (lecture seule)
│   ├── commands/                      ← Commandes slash personnalisées
│   │   ├── implement.md               ← /implement [feature]
│   │   ├── review.md                  ← /review [cible]
│   │   └── migrate.md                 ← /migrate [description]
│   ├── rules/                         ← Règles spécifiques (chargées à la demande)
│   │   ├── tdd.md                     ← Convention TDD complète
│   │   ├── security.md                ← Règles de sécurité non-négociables
│   │   └── token-optimization.md      ← Gestion optimale du contexte
│   ├── hooks/                         ← Lifecycle hooks
│   │   ├── pre-bash.js                ← Bloque les commandes dangereuses
│   │   ├── post-write.js              ← Lint auto après écriture
│   │   └── on-stop.js                 ← Résumé de session
│   └── memory/
│       └── MEMORY.md                  ← Mémoire auto-persistée entre sessions
├── src/
│   ├── app/
│   │   ├── api/CLAUDE.md              ← Règles spécifiques aux API routes
│   │   └── (dashboard)/CLAUDE.md     ← Règles spécifiques au dashboard
│   ├── db/schema/index.ts             ← Schéma DB (importé dans CLAUDE.md)
│   └── lib/result.ts                  ← Pattern Result<T,E>
├── tests/
│   ├── setup.ts                       ← Config globale Vitest
│   ├── fixtures/index.ts              ← Données de test réutilisables
│   ├── mocks/
│   │   ├── server.ts                  ← Serveur MSW
│   │   └── handlers.ts                ← Mocks Stripe, Resend, Anthropic...
│   ├── integration/actions/           ← Tests des Server Actions
│   └── security/                      ← Tests d'isolation multi-tenant
├── vitest.config.ts                   ← Config tests unitaires + intégration
└── package.json                       ← Scripts pnpm
```

---

## Sous-agents — quand utiliser lequel

| Sous-agent | Quand l'utiliser | Modèle | Accès |
|---|---|---|---|
| `architect` | Design, ADR, schéma DB avant code | Opus 4.6 | Lecture seule |
| `api-developer` | API routes, Server Actions, logique backend | Sonnet 4.6 | Lecture + Écriture |
| `frontend-developer` | Composants React, pages, formulaires, UI | Sonnet 4.6 | Lecture + Écriture |
| `tdd-engineer` | Tests (toujours avant le code) | Sonnet 4.6 | Lecture + Écriture |
| `database-engineer` | Migrations Drizzle, schéma, RLS, index | Sonnet 4.6 | Lecture + Écriture |
| `security-reviewer` | Audit avant merge, isolation tenant | Opus 4.6 | **Lecture seule** |

**Syntaxe d'invocation :**
```
use architect pour concevoir le module de facturation
use tdd-engineer pour écrire les tests de createInvoiceAction
use security-reviewer pour auditer les routes /api/invoices/
```

---

## Commandes slash disponibles

```bash
/implement [feature]    # Implémenter une feature complète (suit le process TDD)
/review [cible]         # Review de code avant merge (sécurité + qualité)
/migrate [description]  # Créer une migration DB avec RLS
```

---

## Workflow TDD — à suivre impérativement

```
1. Identifier l'exigence (TRB-XXX dans le PRD)
2. use tdd-engineer → écrire le test (RED — doit échouer)
3. pnpm test [fichier] → confirmer l'échec
4. use api-developer ou frontend-developer → implémenter (GREEN)
5. pnpm test [fichier] → confirmer la réussite
6. Refactorer si nécessaire (tests toujours verts)
7. use security-reviewer → audit si route/action modifiée
8. pnpm check → typecheck + lint + tests complets avant commit
```

---

## Gestion optimale des tokens

**Principe : moins = mieux**

```bash
# Charger uniquement le module concerné
"Lis src/app/(dashboard)/invoices/ et implémente..."

# Ne PAS faire
"Lis tout le projet et..."

# Nouvelle session si contexte pollué
/clear  ou  /compact
```

Voir `.claude/rules/token-optimization.md` pour le guide complet.

---

## Hooks automatiques

| Hook | Déclencheur | Action |
|---|---|---|
| `pre-bash.js` | Avant toute commande bash | Bloque `rm -rf`, SQL DROP, écriture .env |
| `post-write.js` | Après écriture d'un fichier TS | Lance ESLint + fix auto |
| `on-stop.js` | Fin de session | Résumé : tests, erreurs TS, fichiers modifiés |

---

## Scripts utiles

```bash
pnpm check          # typecheck + lint + tests (avant chaque commit)
pnpm check:full     # check complet + coverage + build
pnpm test:watch     # mode développement TDD
pnpm test:coverage  # rapport de couverture HTML
pnpm db:studio      # GUI pour explorer la DB locale
pnpm supabase:start # démarrer la DB locale
```

---

## Ressources

- [Documentation Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview)
- [Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Drizzle ORM docs](https://orm.drizzle.team/docs/overview)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [PRD Traballo](./docs/prd.md)
