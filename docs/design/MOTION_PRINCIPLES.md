# Motion principles — Traballo

Ce document codifie les conventions déjà en usage dans le code
(`src/components/motion/*`, `src/components/shared/mascot.tsx`) pour que
toute nouvelle animation reste cohérente avec l'existant.

## Easing & durée

Une seule courbe pour toute l'app, un "expo-out" confiant, sans rebond :

```ts
const EASE = [0.16, 1, 0.3, 1] as const;
```

- **Entrées de contenu** (reveal, mascotte, cartes) : `duration: 0.5–0.6s`
- **Micro-interactions** (hover, focus, changement d'état d'un bouton) :
  `duration: 0.15–0.25s`, `ease: "easeOut"` ou la courbe ci-dessus
- **Décors en boucle continue** (marquee, drift) : `linear`, jamais l'expo-out
  (réservée aux transitions avec un début et une fin) — une vitesse
  constante évite l'à-coup au point de bouclage.
- **Boucles oscillantes** (respiration, pulse — va-et-vient, pas de
  bouclage brut) : `easeInOut` + `repeatType: "mirror"`. C'est l'inverse
  du cas précédent : ici l'accélération/décélération aux extrêmes est ce
  qui rend le mouvement organique plutôt que mécanique.

Ne pas introduire de nouvelle courbe d'easing sans raison — la cohérence
prime sur la nouveauté.

## Quand animer

Animer un changement d'état a un coût (attention, batterie, distraction).
Trois catégories :

1. **Toujours animer** — une transition d'état qui aide à comprendre ce qui
   vient de se passer : un élément qui apparaît dans le flux (`Reveal`,
   `RevealGroup`), une réussite qui mérite d'être remarquée (`celebrate()`,
   mascotte `success`), un changement de valeur numérique (`CountUp`).
2. **Animer avec parcimonie** — décors marketing (hero, marquee de logos,
   tilt de carte) : jamais dans le dashboard artisan, où la vitesse prime.
3. **Ne jamais animer** — actions répétitives à fort volume (lignes d'une
   liste de factures/clients au scroll normal, tableaux), et tout ce qui
   retarderait une action bloquante (validation de formulaire, navigation).

Règle pratique : si l'utilisateur va revoir cet écran dix fois par jour,
l'animation doit être courte ou absente. Le dashboard est un outil de
travail quotidien, pas une démo.

## `prefers-reduced-motion`

Non négociable. Chaque composant animé doit lire `useReducedMotion()` (via
`motion/react`) et désactiver `initial`/`animate`/`whileInView`, ou fournir
un équivalent statique — voir `Reveal`, `RevealGroup`, `Mascot`. Pour du CSS
pur (`animate-marquee`, `hover-lift`), désactiver via
`@media (prefers-reduced-motion: reduce)` dans `globals.css`.

## La mascotte ("Trabby")

Le castor est l'unique porteur d'émotion animée de l'interface — pas de
confettis, pas d'illustrations concurrentes. Poses actuelles :
`welcome` · `success` · `empty` · `error` · `loading`
(`src/components/shared/mascot.tsx`). Chaque pose entre avec le même
fade + scale + rise (`opacity 0→1, scale 0.9→1, y 8→0`, 0.5s, expo-out) —
ne pas varier cette entrée pose par pose, la reconnaissance vient de la
cohérence.

Aujourd'hui : PNG statique détouré + entrée `motion` (fade + scale + rise),
puis une respiration au repos en boucle (`y: 0 ↔ -4px`, 1.8s, easeInOut +
mirror) une fois l'entrée terminée — un entre-deux peu coûteux en attendant
mieux.

Lottie (Phase 5) est **en pause** : ni les PNG ni les SVG vectorisés
(`public/mascot/SVG/`, auto-tracés, non riggés) ne peuvent servir de base à
une vraie animation par calques — il faudrait repartir d'un art vectoriel
propre avec les éléments séparés (yeux, bouche, bras, queue), donc un vrai
travail de motion design. On y reviendra quand ce budget existera.

## Où regarder le code de référence

- `src/components/motion/reveal.tsx` — `Reveal`, `RevealGroup`, `RevealItem`
- `src/components/motion/count-up.tsx` — valeurs chiffrées
- `src/components/motion/tilt-card.tsx` — survol marketing
- `src/components/shared/mascot.tsx` — mascotte par pose
- `src/components/shared/celebrate.tsx` — toast de succès avec la mascotte
- `src/app/globals.css` — `.hover-lift`, `.animate-marquee`, media queries
  `prefers-reduced-motion`
