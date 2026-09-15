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
- **Décors en boucle** (marquee, drift) : `linear`, jamais l'expo-out
  (réservée aux transitions avec un début et une fin)

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

Aujourd'hui : PNG statique détouré + wrapper `motion`. La bascule vers une
mascotte réellement animée (Lottie, décision prise pour la Phase 5) se fera
poste par poste, en gardant le PNG comme repli si le fichier Lottie n'est
pas encore disponible pour une pose donnée.

## Où regarder le code de référence

- `src/components/motion/reveal.tsx` — `Reveal`, `RevealGroup`, `RevealItem`
- `src/components/motion/count-up.tsx` — valeurs chiffrées
- `src/components/motion/tilt-card.tsx` — survol marketing
- `src/components/shared/mascot.tsx` — mascotte par pose
- `src/components/shared/celebrate.tsx` — toast de succès avec la mascotte
- `src/app/globals.css` — `.hover-lift`, `.animate-marquee`, media queries
  `prefers-reduced-motion`
