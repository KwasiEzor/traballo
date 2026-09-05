import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Traballo — le business pack des artisans",
    short_name: "Traballo",
    description:
      "Site web, factures conformes, agent IA et rendez-vous : tout pour gérer votre activité d'artisan.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "fr",
    background_color: "#0C121B",
    theme_color: "#155BA2",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
