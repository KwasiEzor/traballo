import type { MetadataRoute } from "next";

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.pro";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/admin/", "/api/", "/auth/"],
    },
    sitemap: `https://${rootDomain}/sitemap.xml`,
  };
}
