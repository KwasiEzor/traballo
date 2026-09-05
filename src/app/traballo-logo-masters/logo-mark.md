# Traballo — monogramme de marque

## Construction

Un T capitale plein, à empattements rectangulaires, sur une grille 100×100 :
- Bras horizontal : largeur pleine, hauteur 22 unités
- Empattements (feet) sous les extrémités du bras : hauteur 12, créant deux
  contreformes (encoches) de 12 unités de large
- Fût central : largeur 22 (même module que la hauteur du bras)
- Biseau : coupe diagonale de la pointe du fût, épaisseur perpendiculaire
  ≈ 9,7 unités (≈ 1/8,7 de la largeur totale du mark) — le geste de dessin
  qui distingue ce T d'une lettre générique. Il évoque le tranchant d'un
  outil (ciseau, burin) sans dérive vers la pointe ou la lame.

Tous les angles sont à 90° exacts, toutes les arêtes sont rectilignes.
Tracé vectoriel construit par coordonnées, pas de retraçage d'image.

## Couleurs

| Usage | Valeur | Contexte |
|---|---|---|
| Mark principal | `#155BA2` | fond clair, usage général |
| Mark encre | `#141B24` | impression N&B, contextes sombres discrets |
| Mark blanc | `#FFFFFF` | sur `#155BA2` ou sur fond dashboard `#0C121B` |
| Mark azur clair (mode sombre) | `#448CDB` | sur fond dashboard `#0C121B` uniquement |

Le mark ne fonctionne qu'en aplat unique — jamais de dégradé, jamais de
seconde teinte, jamais d'ombre portée.

## Taille minimale

Validé lisible à 16 px (favicon, avatar). En dessous, ne pas utiliser le
mark seul — utiliser un pastille pleine couleur sans le détail du biseau
si un contexte plus petit l'exige (rare).

## Fichiers fournis

- `traballo-mark-blue.svg` / `-ink.svg` / `-white.svg` — masters vectoriels
- `traballo-mark-white-on-blue.svg` — mark blanc sur carré `#155BA2`
- `traballo-mark-on-darkbg.svg` — mark `#448CDB` sur fond dashboard `#0C121B`
- `png/` — exports rasterisés 16 à 1024 px, toutes variantes
- `png/favicon.ico` — favicon multi-résolution (16/32/48)
- `png/traballo-avatar-512.png` — avatar carré à coins arrondis, fond bleu,
  mark blanc (réseaux sociaux, app icon)

## À ne pas faire

Ne pas recolorer en dehors de la palette ci-dessus. Ne pas incliner,
arrondir les angles, ou ajouter un effet de profondeur. Ne pas isoler le
biseau sans le reste du T — il n'a de sens qu'intégré à la lettre.
