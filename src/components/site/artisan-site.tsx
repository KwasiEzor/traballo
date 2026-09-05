import Image from "next/image";
import { type PublicSite } from "@/lib/artisan/site-data";
import { getTemplate } from "@/lib/artisan/templates";
import { resolveSiteConfig } from "@/lib/artisan/site-config";
import { FloatingContact } from "@/components/site/floating-contact";
import {
  HeroSection,
  ServicesSection,
  AboutSection,
  GallerySection,
  ZonesSection,
  ReviewsSection,
  HoursSection,
  TrustSection,
  CtaSection,
  ContactSection,
} from "@/components/site/sections";

/**
 * The public artisan vitrine. Rendered both at `{slug}.traballo.pro` (live)
 * and inside the dashboard preview (`/site-preview`, `preview` flag on).
 * Layout is driven by the resolved site config (template + sections + chrome).
 */
export function ArtisanSite({
  site,
  preview = false,
}: {
  site: PublicSite;
  preview?: boolean;
}) {
  const area =
    site.address?.split("·").pop()?.trim() || site.address || "votre région";
  const style = { ["--sp" as string]: site.primaryColor } as React.CSSProperties;
  const tel = site.phone?.replace(/\s/g, "");

  const config = resolveSiteConfig(site, area, site.plan, site.config);
  const tpl = getTemplate(config.templateId);
  const chrome = config.chrome;

  return (
    <div style={style} className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          {chrome.logoUrl ? (
            <span className="relative block h-9 w-40">
              <Image
                src={chrome.logoUrl}
                alt={site.businessName}
                fill
                sizes="160px"
                className="object-contain object-left"
              />
            </span>
          ) : (
            <span className="text-lg font-bold tracking-tight text-slate-900">
              {site.businessName}
            </span>
          )}
          <div className="flex items-center gap-3">
            {chrome.showPhone && site.phone && (
              <a
                href={`tel:${tel}`}
                className="hidden text-sm font-medium text-slate-700 sm:block"
              >
                {site.phone}
              </a>
            )}
            <a
              href="#contact"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: site.primaryColor }}
            >
              {chrome.ctaLabel}
            </a>
          </div>
        </div>
      </header>

      {config.sections.map((s) => {
        const key = s.key;
        const c = s.content as never;
        if (key === "hero")
          return <HeroSection key={key} site={site} content={c} style={tpl.style} />;
        if (key === "services")
          return <ServicesSection key={key} site={site} content={c} style={tpl.style} />;
        if (key === "about")
          return <AboutSection key={key} content={c} style={tpl.style} />;
        if (key === "gallery")
          return <GallerySection key={key} content={c} style={tpl.style} />;
        if (key === "zones")
          return <ZonesSection key={key} site={site} content={c} style={tpl.style} />;
        if (key === "reviews")
          return <ReviewsSection key={key} site={site} content={c} style={tpl.style} />;
        if (key === "hours")
          return <HoursSection key={key} site={site} content={c} style={tpl.style} />;
        if (key === "trust")
          return <TrustSection key={key} site={site} content={c} style={tpl.style} />;
        if (key === "cta")
          return <CtaSection key={key} site={site} content={c} style={tpl.style} />;
        if (key === "contact")
          return (
            <ContactSection
              key={key}
              site={site}
              content={c}
              style={tpl.style}
              preview={preview}
            />
          );
        return null;
      })}

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 text-center text-xs text-slate-500">
          {chrome.footerTagline && (
            <p className="text-slate-600">{chrome.footerTagline}</p>
          )}
          <div className="flex flex-col items-center justify-between gap-2 sm:w-full sm:flex-row">
            <span>
              © {new Date().getFullYear()} {site.businessName}
              {site.tradeType && ` · ${site.tradeLabel}`}
            </span>
            {chrome.showBadge && (
              <a
                href={`https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.pro"}`}
                className="hover:text-slate-700"
              >
                Créé avec Traballo
              </a>
            )}
          </div>
        </div>
      </footer>

      <FloatingContact phone={site.phone} whatsapp={site.whatsappNumber} />
    </div>
  );
}
