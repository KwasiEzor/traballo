import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Star,
  Quote,
} from "lucide-react";
import { heroImageFor, type PublicSite } from "@/lib/artisan/site-data";
import type { TemplateDef } from "@/lib/artisan/templates";
import type {
  ServiceItem,
  ReviewItem,
  HourRow,
} from "@/lib/artisan/site-config";
import { LeadForm } from "@/components/site/lead-form";

type Style = TemplateDef["style"];

const wrap = "mx-auto max-w-6xl px-5";
const pad = (s: Style) => (s.density === "airy" ? "py-20 sm:py-28" : "py-16 sm:py-20");
const h2 = (s: Style) =>
  `${s.display === "bold" ? "font-bold" : "font-semibold"} tracking-tight text-slate-900 text-2xl sm:text-3xl`;

function tel(site: PublicSite) {
  return site.phone?.replace(/\s/g, "");
}

/* --------------------------------- hero ---------------------------------- */

export function HeroSection({
  site,
  content,
  style,
}: {
  site: PublicSite;
  content: { eyebrow?: string; headline?: string; subhead?: string };
  style: Style;
}) {
  const buttons = (
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
          href={`tel:${tel(site)}`}
          className={
            style.hero === "photo"
              ? "rounded-lg border-2 border-white/70 px-6 py-3 text-center font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
              : "rounded-lg border-2 px-6 py-3 text-center font-semibold text-slate-900"
          }
          style={style.hero === "wash" ? { borderColor: site.primaryColor } : undefined}
        >
          {site.phone}
        </a>
      )}
    </div>
  );

  const points = (dark: boolean) => (
    <ul
      className={`mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm ${dark ? "text-white/85" : "text-slate-600"}`}
    >
      {["Devis gratuit", "Intervention rapide", "Travail garanti"].map((f) => (
        <li key={f} className="flex items-center gap-1.5">
          <CheckCircle2
            className="size-4"
            style={{ color: dark ? "#fff" : site.primaryColor }}
          />
          {f}
        </li>
      ))}
    </ul>
  );

  if (style.hero === "wash") {
    return (
      <section
        className="border-b border-slate-200"
        style={{ background: `color-mix(in srgb, ${site.primaryColor} 7%, white)` }}
      >
        <div className={`${wrap} py-20 sm:py-28`}>
          <div className="max-w-2xl">
            <p
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: site.primaryColor }}
            >
              {content.eyebrow}
            </p>
            <h1
              className={`mt-3 text-4xl tracking-tight text-slate-900 text-balance sm:text-5xl ${
                style.display === "bold" ? "font-bold" : "font-semibold"
              }`}
            >
              {content.headline}
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-600">
              {content.subhead}
            </p>
            {buttons}
            {points(false)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden border-b border-slate-200 bg-slate-900">
      <Image
        src={heroImageFor(site.tradeType)}
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
      <div className={`relative ${wrap} py-20 sm:py-28 lg:py-36`}>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
            {content.eyebrow}
          </p>
          <h1
            className={`mt-3 text-4xl tracking-tight text-white text-balance sm:text-5xl ${
              style.display === "bold" ? "font-bold" : "font-semibold"
            }`}
          >
            {content.headline}
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/85">
            {content.subhead}
          </p>
          {buttons}
          {points(true)}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- services -------------------------------- */

export function ServicesSection({
  site,
  content,
  style,
}: {
  site: PublicSite;
  content: { title?: string; items?: ServiceItem[] };
  style: Style;
}) {
  const items = content.items ?? [];
  return (
    <section className={`${wrap} ${pad(style)}`}>
      <h2 className={h2(style)}>{content.title}</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <div
            key={s.title}
            className={
              style.surface === "card"
                ? "rounded-xl border border-slate-200 p-6"
                : "border-t-2 border-slate-900 pt-5"
            }
          >
            <div
              className="grid size-10 place-items-center rounded-lg"
              style={{
                backgroundColor: `color-mix(in srgb, ${site.primaryColor} 12%, white)`,
              }}
            >
              <ShieldCheck className="size-5" style={{ color: site.primaryColor }} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- about --------------------------------- */

export function AboutSection({
  content,
  style,
}: {
  content: { title?: string; body?: string };
  style: Style;
}) {
  return (
    <section className="border-y border-slate-100 bg-slate-50">
      <div className={`${wrap} ${pad(style)} grid gap-8 lg:grid-cols-[0.8fr_1.2fr]`}>
        <h2 className={h2(style)}>{content.title}</h2>
        <p className="text-lg leading-relaxed text-slate-600 whitespace-pre-line">
          {content.body}
        </p>
      </div>
    </section>
  );
}

/* --------------------------------- zones --------------------------------- */

export function ZonesSection({
  site,
  content,
  style,
}: {
  site: PublicSite;
  content: { title?: string; items?: string[] };
  style: Style;
}) {
  const items = content.items ?? [];
  return (
    <section className={`${wrap} ${pad(style)}`}>
      <h2 className={h2(style)}>{content.title}</h2>
      <ul className="mt-6 flex flex-wrap gap-2.5">
        {items.map((z) => (
          <li
            key={z}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-3.5 py-1.5 text-sm text-slate-700"
          >
            <MapPin className="size-3.5" style={{ color: site.primaryColor }} />
            {z}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* -------------------------------- reviews -------------------------------- */

export function ReviewsSection({
  site,
  content,
  style,
}: {
  site: PublicSite;
  content: { title?: string; items?: ReviewItem[] };
  style: Style;
}) {
  const items = content.items ?? [];
  if (items.length === 0) return null;
  return (
    <section className="border-y border-slate-100 bg-slate-50">
      <div className={`${wrap} ${pad(style)}`}>
        <h2 className={h2(style)}>{content.title}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {items.map((r, i) => (
            <figure
              key={`${r.name}-${i}`}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6"
            >
              <Quote
                className="size-6"
                style={{ color: site.primaryColor }}
                fill="currentColor"
                strokeWidth={0}
              />
              {typeof r.rating === "number" && (
                <div className="mt-2 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className="size-4"
                      style={{ color: site.primaryColor }}
                      fill={s < r.rating! ? "currentColor" : "none"}
                      strokeWidth={s < r.rating! ? 0 : 1.5}
                    />
                  ))}
                </div>
              )}
              <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-slate-700">
                {r.text}
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-slate-900">
                {r.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- hours --------------------------------- */

export function HoursSection({
  site,
  content,
  style,
}: {
  site: PublicSite;
  content: { title?: string; note?: string; days?: HourRow[] };
  style: Style;
}) {
  const days = content.days ?? [];
  return (
    <section className={`${wrap} ${pad(style)}`}>
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className={h2(style)}>{content.title}</h2>
          {content.note && (
            <p className="mt-3 text-sm text-slate-500">{content.note}</p>
          )}
        </div>
        <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {days.map((d) => (
            <div
              key={d.label}
              className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm"
            >
              <dt className="flex items-center gap-2 text-slate-700">
                <Clock className="size-4" style={{ color: site.primaryColor }} />
                {d.label}
              </dt>
              <dd className="font-medium text-slate-900">{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* --------------------------------- trust --------------------------------- */

export function TrustSection({
  site,
  content,
  style,
}: {
  site: PublicSite;
  content: { title?: string; items?: ServiceItem[] };
  style: Style;
}) {
  const items = content.items ?? [];
  const icons = [Clock, ShieldCheck, Star];
  const dark = style.contrast === "high";
  return (
    <section
      className={
        dark
          ? "text-white"
          : "border-y border-slate-100 bg-slate-50 text-slate-900"
      }
      style={dark ? { backgroundColor: "#0f1626" } : undefined}
    >
      <div className={`${wrap} ${style.density === "airy" ? "py-16 sm:py-20" : "py-14"}`}>
        {content.title ? <h2 className={h2(style)}>{content.title}</h2> : null}
        <div className={`grid gap-8 sm:grid-cols-3 ${content.title ? "mt-8" : ""}`}>
          {items.map((b, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div key={b.title}>
                <Icon
                  className="size-6"
                  style={{ color: dark ? "#fff" : site.primaryColor }}
                />
                <h3
                  className={`mt-3 font-semibold ${dark ? "text-white" : "text-slate-900"}`}
                >
                  {b.title}
                </h3>
                <p className={`mt-1 text-sm ${dark ? "text-white/70" : "text-slate-600"}`}>
                  {b.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- cta ---------------------------------- */

export function CtaSection({
  site,
  content,
}: {
  site: PublicSite;
  content: { title?: string; body?: string };
  style: Style;
}) {
  return (
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
          {content.title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-white/85">{content.body}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="#contact"
            className="rounded-lg bg-white px-6 py-3 text-center font-semibold text-slate-900 shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Demander un devis
          </a>
          {site.phone && (
            <a
              href={`tel:${tel(site)}`}
              className="rounded-lg border-2 border-white/70 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-white/10"
            >
              {site.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- contact -------------------------------- */

export function ContactSection({
  site,
  content,
  style,
  preview,
}: {
  site: PublicSite;
  content: { title?: string; body?: string };
  style: Style;
  preview?: boolean;
}) {
  return (
    <section id="contact" className={`${wrap} scroll-mt-20 ${pad(style)}`}>
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className={h2(style)}>{content.title}</h2>
          <p className="mt-3 text-slate-600">{content.body}</p>
          <div className="mt-8 space-y-4 text-sm">
            {site.phone && (
              <a
                href={`tel:${tel(site)}`}
                className="flex items-center gap-3 text-slate-700"
              >
                <Phone className="size-4" style={{ color: site.primaryColor }} />{" "}
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
          {preview ? <PreviewLeadForm color={site.primaryColor} /> : <LeadForm slug={site.slug} />}
        </div>
      </div>
    </section>
  );
}

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
          <div className={`w-full rounded-lg border border-slate-300 bg-slate-50 ${f.h}`} />
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
