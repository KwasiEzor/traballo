import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.pro";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${rootDomain}`),
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${GeistSans.variable}`}
    >
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
