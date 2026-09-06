import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.pro";

export const viewport: Viewport = {
  themeColor: "#155BA2",
};

export const metadata: Metadata = {
  // Apex 308-redirects to www — use the canonical host so OG/canonical URLs
  // resolve directly (no redirect for social scrapers).
  metadataBase: new URL(`https://www.${rootDomain}`),
  title: {
    default: "Traballo — le business pack des artisans",
    template: "%s · Traballo",
  },
  description:
    "Site web, factures conformes, agent IA et rendez-vous : tout ce qu'il faut pour gérer votre activité d'artisan, dans un seul tableau de bord. FR · BE · LU.",
  keywords: [
    "logiciel artisan",
    "facturation électronique 2026",
    "site web artisan",
    "devis facture plombier électricien",
    "Factur-X PEPPOL",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Traballo",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Traballo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${plexMono.variable}`}
    >
      <head>
        {/* Next's `appleWebApp.capable` doesn't emit this on its own here;
            iOS < 17.4 needs the vendor-prefixed tag to launch standalone. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-dvh">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
