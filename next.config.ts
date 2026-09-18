import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

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

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Silent unless in CI so local `pnpm build` isn't noisy without an auth token.
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    automaticVercelMonitors: true,
    treeshake: { removeDebugLogging: true },
  },
});
