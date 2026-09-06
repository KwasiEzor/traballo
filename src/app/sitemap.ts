import type { MetadataRoute } from "next";

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.pro";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://www.${rootDomain}`;
  const now = new Date();
  const routes = [
    "",
    "/fonctionnalites",
    "/tarifs",
    "/a-propos",
    "/contact",
    "/mentions-legales",
    "/cgu",
    "/confidentialite",
    "/cookies",
  ];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/tarifs" ? 0.9 : 0.6,
  }));
}
