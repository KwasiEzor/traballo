import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Star,
} from "lucide-react";
import { resolvePublicSite, servicesFor } from "@/lib/artisan/site-data";
import { LeadForm } from "@/components/site/lead-form";
import { FloatingContact } from "@/components/site/floating-contact";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await resolvePublicSite(slug);
  if (!site || !site.isPublished) return { title: { absolute: "Site introuvable" } };
  return {
    title: {
      absolute: site.metaTitle || `${site.businessName} — ${site.tradeLabel}`,
    },
    description:
      site.metaDescription ||
      `${site.businessName}, ${site.tradeLabel.toLowerCase()}${site.address ? ` — ${site.address}` : ""}. Devis gratuit.`,
    robots: { index: true, follow: true },
  };
}

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await resolvePublicSite(slug);
  if (!site || !site.isPublished) notFound();

  const services = servicesFor(site.tradeType);
  const area = site.address?.split("·").pop()?.trim() || site.address || "votre région";
  const style = { ["--sp" as string]: site.primaryColor } as React.CSSProperties;

  return (
    <div style={style} className="min-h-dvh bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <span className="text-lg font-bold tracking-tight text-slate-900">
            {site.businessName}
          </span>
          <div className="flex items-center gap-3">
            {site.phone && (
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="hidden items-center gap-2 text-sm font-medium text-slate-700 sm:flex"
              >
                <Phone className="size-4" style={{ color: site.primaryColor }} />
                {site.phone}
              </a>
            )}
            <a
              href="#contact"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: site.primaryColor }}
            >
              Devis gratuit
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="border-b border-slate-100"
        style={{ background: `color-mix(in srgb, ${site.primaryColor} 7%, white)` }}
      >
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: site.primaryColor }}>
              {site.tradeLabel} · {area}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {site.businessName}, votre {site.tradeLabel.toLowerCase()} de confiance
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Intervention soignée, devis gratuit, délais respectés. Contactez-nous
              pour toute demande à {area}.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contact"
                className="rounded-lg px-6 py-3 text-center font-semibold text-white"
                style={{ backgroundColor: site.primaryColor }}
              >
                Demander un devis
              </a>
              {site.phone && (
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="rounded-lg border-2 px-6 py-3 text-center font-semibold text-slate-900"
                  style={{ borderColor: site.primaryColor }}
                >
                  {site.phone}
                </a>
              )}
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              {["Devis gratuit", "Intervention rapide", "Travail garanti"].map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" style={{ color: site.primaryColor }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Nos prestations
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="rounded-xl border border-slate-200 p-6">
              <div
                className="grid size-10 place-items-center rounded-lg"
                style={{ backgroundColor: `color-mix(in srgb, ${site.primaryColor} 12%, white)` }}
              >
                <ShieldCheck className="size-5" style={{ color: site.primaryColor }} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-3">
          {[
            { icon: Clock, title: "Réactivité", text: "Réponse rapide à votre demande, intervention planifiée sans délai inutile." },
            { icon: ShieldCheck, title: "Travail garanti", text: "Prestations réalisées dans les règles de l'art, facture conforme." },
            { icon: Star, title: "Clients satisfaits", text: "Une relation de confiance construite chantier après chantier." },
          ].map((b) => (
            <div key={b.title}>
              <b.icon className="size-6" style={{ color: site.primaryColor }} />
              <h3 className="mt-3 font-semibold text-slate-900">{b.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Parlons de votre projet
            </h2>
            <p className="mt-3 text-slate-600">
              Décrivez votre besoin, {site.ownerName.split(" ")[0]} vous recontacte
              rapidement avec un devis.
            </p>
            <div className="mt-8 space-y-4 text-sm">
              {site.phone && (
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-slate-700">
                  <Phone className="size-4" style={{ color: site.primaryColor }} /> {site.phone}
                </a>
              )}
              <a href={`mailto:${site.email}`} className="flex items-center gap-3 text-slate-700">
                <Mail className="size-4" style={{ color: site.primaryColor }} /> {site.email}
              </a>
              {site.address && (
                <div className="flex items-start gap-3 text-slate-700">
                  <MapPin className="mt-0.5 size-4 shrink-0" style={{ color: site.primaryColor }} />
                  <span className="whitespace-pre-line">{site.address}</span>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6 sm:p-8">
            <LeadForm slug={site.slug} />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-xs text-slate-500 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {site.businessName}
            {site.tradeType && ` · ${site.tradeLabel}`}
          </span>
          <a
            href={`https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.pro"}`}
            className="hover:text-slate-700"
          >
            Créé avec Traballo
          </a>
        </div>
      </footer>

      <FloatingContact phone={site.phone} whatsapp={site.whatsappNumber} />
    </div>
  );
}
