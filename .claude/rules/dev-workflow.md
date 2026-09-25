# Workflow de développement — pièges constatés

- **Ne jamais lancer `pnpm typecheck` ou `pnpm build` pendant que `pnpm dev` tourne** : les deux écrivent dans `.next` et le corrompent. Arrêter le serveur d'abord.
- **Vérifier avec `pnpm build`, pas seulement `typecheck`** : certaines erreurs (imports client/serveur) ne cassent que le build. Voir `client-server.md`.
- Resend rejette les destinataires en `.test` (pas un bug). Utiliser une vraie adresse pour les essais.
- Carte Leaflet : `fadeAnimation={false}` est **obligatoire** sur `MapContainer` (sinon tuiles à `opacity:0`, carte grise quand elle monte dans un conteneur révélé au scroll). Garder `<ResizeOnMount>`.
- Tuiles Stadia : authentification **par domaine**. `localhost` marche d'office ; en prod `traballo.pro` et `*.traballo.pro` doivent être allow-listés chez Stadia, sinon définir `NEXT_PUBLIC_STADIA_MAPS_API_KEY`.
- CLI Vercel : version ≥ 53 requise (`env add` par stdin est sans effet avant). Les suppressions de stores Blob et `env rm` isolés passent par un script committé ou par l'utilisateur.
- Après chaque `vercel deploy` de preview : `vercel alias set <url> traballo-preview.vercel.app`.
- Variables d'environnement : les pousser avec `scripts/vercel-env-sync.sh <APP_URL> <environnements...>`.
