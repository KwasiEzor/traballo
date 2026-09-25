---
name: wrap-up
description: Clore une session Traballo proprement. Lance les vérifications, committe ce qui est terminé, met à jour docs/STATE.md (et DECISIONS.md si besoin) pour que la prochaine session reprenne sans perte. À utiliser quand l'utilisateur dit "on s'arrête", "fin de session", "wrap up" ou avant de changer de chantier.
---

# wrap-up — fin de session

Objectif : laisser le repo dans un état que `resume` peut relire sans ambiguïté.

## Étapes

1. **Vérifier** : `pgrep -fl "next dev"` (si le serveur tourne, ne pas lancer typecheck/build), puis `pnpm check`. Noter le résultat exact.
2. **Trier le travail** (`git status`) :
   - terminé et vert → committer (message court en français, détail, ligne `Co-Authored-By` de `CLAUDE.md`) ;
   - incomplet ou rouge → **ne pas committer** (règle du projet : pas de WIP qui ne compile pas). Le décrire dans `STATE.md`, section « En cours ».
3. **Mettre à jour `docs/STATE.md`** :
   - date et HEAD de « Dernière vérification » ;
   - déplacer le terminé vers « Fait » (avec le hash de commit) ;
   - « Prochaine action exacte » : numérotée, exécutable sans contexte ;
   - « Ouvert » : ajouter ce qui a été découvert, retirer ce qui est résolu, **seulement si vérifié** ;
   - pièges découverts : les ajouter à `.claude/rules/` si réutilisables.
4. **Décisions** : toute décision non évidente prise pendant la session (choix technique, arbitrage produit, compromis) → une entrée datée dans `docs/DECISIONS.md` avec le pourquoi.
5. **Mémoire (`memory/`)** : uniquement une préférence de travail de l'utilisateur, ou un pointeur externe durable. Jamais d'état projet.
6. **Committer** `STATE.md` / `DECISIONS.md` / `rules` dans un commit séparé du code produit. Ne pas pousser sans demande.
7. **Annoncer** en 3 lignes : ce qui est fait, ce qui est rouge ou non vérifié, la prochaine action.

## Règles

- Ne jamais écrire « vérifié » sans avoir exécuté la vérification dans cette session.
- Si `pnpm check` échoue, le dire tel quel avec la sortie, et le consigner dans `STATE.md`.
- `STATE.md` reste court : le détail va dans les plans (`docs/plans/`) ou `DECISIONS.md`.
