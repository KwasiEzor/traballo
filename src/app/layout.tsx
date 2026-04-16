import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Traballo - SaaS pour artisans",
  description: "SaaS multi-tenant pour artisans francophones (FR/BE/LU)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
