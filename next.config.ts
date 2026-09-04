import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer (invoice PDF generation) must not be bundled.
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      // Artisan logos / gallery images (object storage — to be wired).
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/pricing", destination: "/tarifs", permanent: true },
      { source: "/features", destination: "/fonctionnalites", permanent: true },
    ];
  },
};

export default nextConfig;
