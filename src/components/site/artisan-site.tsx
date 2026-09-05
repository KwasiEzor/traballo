import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Star,
} from "lucide-react";
import {
  servicesFor,
  heroImageFor,
  type PublicSite,
} from "@/lib/artisan/site-data";
import { LeadForm } from "@/components/site/lead-form";
import { FloatingContact } from "@/components/site/floating-contact";

/**
 * The public artisan vitrine. Rendered both at `{slug}.traballo.pro` (live)
 * and inside the dashboard preview (`/site-preview`, `preview` flag on).
 */
export function ArtisanSite({
  site,
  preview = false,
}: {
  site: PublicSite;
  preview?: boolean;
}) {
  const services = servicesFor(site.tradeType);
  const area =
    site.address?.split("·").pop()?.trim() || site.address || "votre région";
  const style = { ["--sp" as string]: site.primaryColor } as React.CSSProperties;
  const tel = site.phone?.replace(/\s/g, "");
  const heroImage = heroImageFor(site.tradeType);

  return (
    <div style={style} className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <span className="text-lg font-bold tracking-tight text-slate-900">
            {site.businessName}
          </span>
          <div className="flex items-center gap-3">
            {site.phone && (
              <a
                href={`tel:${tel}`}
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

      <section className="relative isolate overflow-hidden border-b border-slate-200 bg-slate-900">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(11,16,27,0.9) 0%, rgba(11,16,27,0.6) 55%, rgba(11,16,27,0.35) 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background: `linear-gradient(0deg, color-mix(in srgb, ${site.primaryColor} 45%, transparent), transparent)`,
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              {site.tradeLabel} · {area}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white text-balance sm:text-5xl">
              {site.businessName}, votre {site.tradeLabel.toLowerCase()} de
              confiance
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/85">
              Intervention soignée, devis gratuit, délais respectés.
              Contactez-nous pour toute demande à {area}.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contact"
                className="rounded-lg px-6 py-3 text-center font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: site.primaryColor }}
              >
                Demander un devis
              </a>
              {site.phone && (
                <a
                  href={`tel:${tel}`}
                  className="rounded-lg border-2 border-white/70 px-6 py-3 text-center font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  {site.phone}
                </a>
              )}
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
              {["Devis gratuit", "Intervention rapide", "Travail garanti"].map(
                (f) => (
                  <li key={f} className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-white" />
                    {f}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Nos prestations
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-slate-200 p-6"
            >
              <div
                className="grid size-10 place-items-center rounded-lg"
                style={{
                  backgroundColor: `color-mix(in srgb, ${site.primaryColor} 12%, white)`,
                }}
              >
                <ShieldCheck
                  className="size-5"
                  style={{ color: site.primaryColor }}
                />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-3">
          {[
            {
              icon: Clock,
              title: "Réactivité",
              text: "Réponse rapide à votre demande, intervention planifiée sans délai inutile.",
            },
            {
              icon: ShieldCheck,
              title: "Travail garanti",
              text: "Prestations réalisées dans les règles de l'art, facture conforme.",
            },
            {
              icon: Star,
              title: "Clients satisfaits",
              text: "Une relation de confiance construite chantier après chantier.",
            },
          ].map((b) => (
            <div key={b.title}>
              <b.icon className="size-6" style={{ color: site.primaryColor }} />
              <h3 className="mt-3 font-semibold text-slate-900">{b.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="contact"
        className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-24"
      >
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Parlons de votre projet
            </h2>
            <p className="mt-3 text-slate-600">
              Décrivez votre besoin, {site.ownerName.split(" ")[0]} vous
              recontacte rapidement avec un devis.
            </p>
            <div className="mt-8 space-y-4 text-sm">
              {site.phone && (
                <a
                  href={`tel:${tel}`}
                  className="flex items-center gap-3 text-slate-700"
                >
                  <Phone
                    className="size-4"
                    style={{ color: site.primaryColor }}
                  />{" "}
                  {site.phone}
                </a>
              )}
              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-3 text-slate-700"
              >
                <Mail className="size-4" style={{ color: site.primaryColor }} />{" "}
                {site.email}
              </a>
              {site.address && (
                <div className="flex items-start gap-3 text-slate-700">
                  <MapPin
                    className="mt-0.5 size-4 shrink-0"
                    style={{ color: site.primaryColor }}
                  />
                  <span className="whitespace-pre-line">{site.address}</span>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6 sm:p-8">
            {preview ? (
              <PreviewLeadForm color={site.primaryColor} />
            ) : (
              <LeadForm slug={site.slug} />
            )}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden">
        <Image
          src="/templates/trades/_cta.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `color-mix(in srgb, ${site.primaryColor} 86%, #0b1020)`,
            opacity: 0.94,
          }}
        />
        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-white text-balance sm:text-3xl">
            Un projet en tête&nbsp;? Parlons-en.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/85">
            Devis gratuit et réponse rapide. {site.ownerName.split(" ")[0]} vous
            recontacte pour faire le point.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#contact"
              className="rounded-lg bg-white px-6 py-3 text-center font-semibold text-slate-900 shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Demander un devis
            </a>
            {site.phone && (
              <a
                href={`tel:${tel}`}
                className="rounded-lg border-2 border-white/70 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-white/10"
              >
                {site.phone}
              </a>
            )}
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

/** Inert copy of the lead form, shown in the dashboard preview. */
function PreviewLeadForm({ color }: { color: string }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {[
        { label: "Votre nom", h: "h-11" },
        { label: "Téléphone ou e-mail", h: "h-11" },
        { label: "Votre besoin", h: "h-24" },
      ].map((f) => (
        <div key={f.label}>
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            {f.label}
          </span>
          <div
            className={`w-full rounded-lg border border-slate-300 bg-slate-50 ${f.h}`}
          />
        </div>
      ))}
      <div
        className="w-full rounded-lg px-5 py-3 text-center font-semibold text-white opacity-90"
        style={{ backgroundColor: color }}
      >
        Envoyer ma demande
      </div>
      <p className="text-center text-xs text-slate-400">
        Formulaire désactivé en aperçu
      </p>
    </div>
  );
}
