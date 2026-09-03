export const FAQ_GENERAL = [
  {
    q: "Faut-il des compétences techniques pour utiliser Traballo ?",
    a: "Non. Vous répondez à quelques questions (métier, zone, coordonnées), choisissez une couleur, et votre site est en ligne. Les factures se créent en remplissant un formulaire simple. Tout est en français et pensé pour aller vite.",
  },
  {
    q: "Mes factures seront-elles vraiment conformes à la réglementation 2026 / 2027 ?",
    a: "Oui. Le plan Pro génère des factures au format Factur-X (PDF + données structurées) et permet la transmission via le réseau PEPPOL, conformément au calendrier belge (2026) et français (réception 2026, émission 2027 pour les TPE / PME).",
  },
  {
    q: "Où sont hébergées mes données ?",
    a: "Exclusivement sur des serveurs situés dans l'Union européenne. Traballo agit comme sous-traitant au sens du RGPD ; vous restez responsable de traitement pour les données de vos clients. Vous pouvez exporter ou supprimer l'intégralité de vos données à tout moment.",
  },
  {
    q: "Puis-je garder mon nom de domaine actuel ?",
    a: "Oui, à partir du plan Pro. Vous branchez votre domaine (par ex. plomberie-dupont.fr) en quelques minutes ; le certificat HTTPS est généré automatiquement.",
  },
  {
    q: "Que se passe-t-il si j'arrête mon abonnement ?",
    a: "Votre compte repasse en plan Free : le site reste en ligne sur le sous-domaine traballo.pro et vos factures restent consultables et exportables. Vous ne perdez jamais votre historique.",
  },
  {
    q: "L'agent IA peut-il répondre n'importe quoi à mes clients ?",
    a: "Vous définissez son périmètre : services, tarifs, zone d'intervention, horaires, ton. Il ne s'engage jamais sur un prix ferme sans votre validation et vous notifie dès qu'un client laisse ses coordonnées.",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "Avant, je notais mes rendez-vous sur un carnet et je facturais sur Excel. Maintenant tout est au même endroit et mes clients me trouvent enfin sur Google.",
    name: "Jean D.",
    role: "Plombier-chauffagiste",
    location: "Bruxelles",
    initials: "JD",
  },
  {
    quote:
      "L'assistant répond à mes clientes le soir quand je suis avec ma famille. Je récupère le lead le lendemain matin avec le créneau déjà proposé.",
    name: "Samira B.",
    role: "Entreprise de nettoyage (3 personnes)",
    location: "Paris",
    initials: "SB",
  },
  {
    quote:
      "Je venais de m'installer. En une demi-heure j'avais un site propre et des factures aux normes. Un seul abonnement au lieu de cinq.",
    name: "Luca F.",
    role: "Électricien indépendant",
    location: "Luxembourg",
    initials: "LF",
  },
];

export const PILLARS = [
  {
    id: "site",
    icon: "Globe",
    title: "Site web professionnel",
    description:
      "Un site à votre métier, en ligne en 30 minutes. Template, couleurs, photos, zone d'intervention — sans toucher une ligne de code.",
  },
  {
    id: "facturation",
    icon: "FileCheck2",
    title: "Factures conformes",
    description:
      "Devis et factures en quelques clics, au format Factur-X, transmissibles via PEPPOL. Relances de paiement automatiques.",
  },
  {
    id: "agent-ia",
    icon: "Sparkles",
    title: "Agent IA 24 h/24",
    description:
      "Un assistant qui répond à vos visiteurs, qualifie la demande et propose un créneau. Vous récupérez un lead prêt à rappeler.",
  },
  {
    id: "rendez-vous",
    icon: "CalendarDays",
    title: "Rendez-vous automatisés",
    description:
      "Vos clients réservent selon vos disponibilités réelles. Rappels e-mail et SMS pour diviser les rendez-vous manqués.",
  },
] as const;
