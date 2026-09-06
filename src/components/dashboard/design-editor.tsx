"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import {
  Check,
  Lock,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { SITE_SAVED_EVENT } from "@/components/dashboard/site-preview-frame";
import { ImageUpload } from "@/components/dashboard/image-upload";
import {
  TEMPLATES,
  MOVABLE_SECTIONS,
  PREMIUM_SECTIONS,
  SECTION_META,
  getTemplate,
  type SectionKey,
  type TemplateId,
} from "@/lib/artisan/templates";
import type { StoredSiteConfig, ChromeConfig } from "@/lib/artisan/site-config";
import { saveSiteConfig, type ConfigState } from "@/app/dashboard/site/actions";

const initial: ConfigState = {};

export function DesignEditor({
  config,
  isPaid,
}: {
  config: StoredSiteConfig;
  isPaid: boolean;
}) {
  const [state, action, pending] = useActionState(saveSiteConfig, initial);
  const [cfg, setCfg] = React.useState<StoredSiteConfig>(() => normalise(config));
  const [upsell, setUpsell] = React.useState(false);

  React.useEffect(() => {
    if (state.ok) {
      toast.success("Design enregistré.");
      window.dispatchEvent(new Event(SITE_SAVED_EVENT));
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  const template = getTemplate(cfg.template);
  const order = (cfg.order ?? []) as SectionKey[];
  const disabled = new Set(cfg.disabled ?? []);

  const setContent = (key: SectionKey, value: Record<string, unknown>) =>
    setCfg((c) => ({ ...c, content: { ...c.content, [key]: value } }));

  const chrome: ChromeConfig = cfg.chrome ?? {};
  const setChrome = (p: Partial<ChromeConfig>) =>
    setCfg((c) => ({ ...c, chrome: { ...c.chrome, ...p } }));

  function pickTemplate(id: TemplateId) {
    const tpl = getTemplate(id);
    if (tpl.tier === "premium" && !isPaid) {
      setUpsell(true);
      return;
    }
    setCfg((c) => ({
      ...c,
      template: id,
      order: fullOrder(tpl.defaultOrder),
      disabled: MOVABLE_SECTIONS.filter((k) => !tpl.defaultOrder.includes(k)),
    }));
  }

  function toggle(key: SectionKey) {
    if (PREMIUM_SECTIONS.includes(key) && !isPaid) {
      setUpsell(true);
      return;
    }
    setCfg((c) => {
      const d = new Set(c.disabled ?? []);
      d.has(key) ? d.delete(key) : d.add(key);
      return { ...c, disabled: [...d] };
    });
  }

  function move(key: SectionKey, dir: -1 | 1) {
    setCfg((c) => {
      const arr = [...((c.order ?? []) as SectionKey[])];
      const i = arr.indexOf(key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return c;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...c, order: arr };
    });
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="config" value={JSON.stringify(cfg)} />

      {state.error && (
        <Alert variant="destructive">
          <AlertContent>
            <AlertDescription>{state.error}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      {/* -------------------------- templates -------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Template</CardTitle>
          <CardDescription>La mise en page générale de votre site.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {TEMPLATES.map((t) => {
              const selected = template.id === t.id;
              const locked = t.tier === "premium" && !isPaid;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => pickTemplate(t.id)}
                  aria-pressed={selected}
                  className={cn(
                    "group relative rounded-xl border-2 p-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary-subtle"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <TemplateThumb id={t.id} />
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground">{t.name}</span>
                    {t.tier === "premium" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-copper-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-copper">
                        {locked && <Lock className="size-2.5" />}Pro
                      </span>
                    )}
                    {selected && <Check className="ml-auto size-4 text-primary" />}
                  </div>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
                    {t.description}
                  </p>
                </button>
              );
            })}
          </div>
          {template.tier === "premium" && !isPaid && (
            <p className="mt-3 text-xs text-copper">
              Aperçu affiché en « Standard » — passez à Pro pour activer ce template.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ------------------------ marque & chrome ---------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Marque &amp; pied de page</CardTitle>
          <CardDescription>
            Logo, en-tête et bas de page de votre site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-xs">Logo</Label>
            <div className="flex items-start gap-4">
              <ImageUpload
                value={chrome.logoUrl}
                onChange={(url) => setChrome({ logoUrl: url })}
                kind="logo"
                maxDim={480}
                aspClass="aspect-[5/2]"
                compact
              />
              <p className="text-xs text-muted-foreground">
                Affiché dans l&apos;en-tête à la place du nom. PNG transparent
                recommandé, fond clair.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">
                Téléphone dans l&apos;en-tête
              </div>
              <div className="text-xs text-muted-foreground">
                Affiche votre numéro en haut à droite (bureau).
              </div>
            </div>
            <Switch
              checked={chrome.showPhone !== false}
              onCheckedChange={(v) => setChrome({ showPhone: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">
                Bouton d&apos;appel flottant
              </div>
              <div className="text-xs text-muted-foreground">
                Pastille « Appeler » en bas à droite (mobile surtout).
              </div>
            </div>
            <Switch
              checked={chrome.showCallButton !== false}
              onCheckedChange={(v) => setChrome({ showCallButton: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">
                Bouton WhatsApp flottant
              </div>
              <div className="text-xs text-muted-foreground">
                Nécessite un numéro WhatsApp dans votre profil.
              </div>
            </div>
            <Switch
              checked={chrome.showWhatsappButton !== false}
              onCheckedChange={(v) => setChrome({ showWhatsappButton: v })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Libellé du bouton d&apos;en-tête</Label>
            <Input
              value={chrome.ctaLabel ?? ""}
              placeholder="Devis gratuit"
              onChange={(e) => setChrome({ ctaLabel: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Phrase de pied de page</Label>
            <Input
              value={chrome.footerTagline ?? ""}
              placeholder="Artisan {métier} depuis 2008 — devis gratuit sous 24 h."
              onChange={(e) => setChrome({ footerTagline: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                Retirer « Créé avec Traballo »
                {!isPaid && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-copper-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-copper">
                    <Lock className="size-2.5" />
                    Pro
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Site sans marque Traballo.
              </div>
            </div>
            <Switch
              checked={!!chrome.hideBadge}
              onCheckedChange={(v) => {
                if (!isPaid) {
                  setUpsell(true);
                  return;
                }
                setChrome({ hideBadge: v });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* --------------------------- sections -------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Sections</CardTitle>
          <CardDescription>
            Activez, réordonnez et personnalisez le contenu de chaque bloc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <SectionRow
            sectionKey="hero"
            locked
            content={(cfg.content?.hero ?? {}) as Record<string, unknown>}
            onContent={(v) => setContent("hero", v)}
          />
          {order.map((key, i) => (
            <SectionRow
              key={key}
              sectionKey={key}
              index={i}
              count={order.length}
              enabled={!disabled.has(key)}
              premiumLocked={PREMIUM_SECTIONS.includes(key) && !isPaid}
              content={(cfg.content?.[key] ?? {}) as Record<string, unknown>}
              onToggle={() => toggle(key)}
              onMove={(d) => move(key, d)}
              onContent={(v) => setContent(key, v)}
            />
          ))}
          <SectionRow
            sectionKey="contact"
            locked
            content={(cfg.content?.contact ?? {}) as Record<string, unknown>}
            onContent={(v) => setContent("contact", v)}
          />
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Enregistrer le design
      </Button>

      {upsell && <Upsell onClose={() => setUpsell(false)} />}
    </form>
  );
}

/* ------------------------------- helpers -------------------------------- */

/** Full ordered list of every movable section, seeded by a preferred order. */
function fullOrder(preferred: SectionKey[]): SectionKey[] {
  return [
    ...preferred.filter((k) => MOVABLE_SECTIONS.includes(k)),
    ...MOVABLE_SECTIONS.filter((k) => !preferred.includes(k)),
  ];
}

function normalise(c: StoredSiteConfig): StoredSiteConfig {
  const tpl = getTemplate(c.template);
  const storedOrder = (c.order ?? []).filter((k) =>
    MOVABLE_SECTIONS.includes(k as SectionKey)
  ) as SectionKey[];
  const order = fullOrder(
    storedOrder.length ? storedOrder : tpl.defaultOrder
  );
  const disabled = c.disabled?.length
    ? c.disabled.filter((k) => MOVABLE_SECTIONS.includes(k as SectionKey))
    : MOVABLE_SECTIONS.filter((k) => !tpl.defaultOrder.includes(k));
  return {
    template: c.template ?? "standard",
    order,
    disabled,
    content: c.content ?? {},
    chrome: c.chrome ?? {},
  };
}

function SectionRow({
  sectionKey,
  index = 0,
  count = 1,
  enabled = true,
  locked = false,
  premiumLocked = false,
  content,
  onToggle,
  onMove,
  onContent,
}: {
  sectionKey: SectionKey;
  index?: number;
  count?: number;
  enabled?: boolean;
  locked?: boolean;
  premiumLocked?: boolean;
  content: Record<string, unknown>;
  onToggle?: () => void;
  onMove?: (d: -1 | 1) => void;
  onContent: (v: Record<string, unknown>) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const m = SECTION_META[sectionKey];

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center gap-2 px-3 py-2.5">
        {locked ? (
          <Lock className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => onMove?.(-1)}
              disabled={index === 0}
              className="text-muted-foreground disabled:opacity-30"
              aria-label="Monter"
            >
              <ArrowUp className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onMove?.(1)}
              disabled={index === count - 1}
              className="text-muted-foreground disabled:opacity-30"
              aria-label="Descendre"
            >
              <ArrowDown className="size-3.5" />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span className="text-sm font-medium text-foreground">{m.label}</span>
          {premiumLocked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-copper-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-copper">
              <Lock className="size-2.5" />
              Pro
            </span>
          )}
          <ChevronDown
            className={cn(
              "ml-auto size-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
        {locked ? (
          <span className="shrink-0 text-xs text-muted-foreground">Toujours affiché</span>
        ) : (
          <Switch checked={enabled && !premiumLocked} onCheckedChange={onToggle} />
        )}
      </div>
      {open && (
        <div className="border-t border-border p-3">
          <SectionFields sectionKey={sectionKey} content={content} onChange={onContent} />
        </div>
      )}
    </div>
  );
}

/* --------------------------- per-section fields ------------------------- */

function T({
  label,
  value,
  onChange,
  placeholder,
  area,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  area?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {area ? (
        <Textarea
          rows={4}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function ListEditor<T extends Record<string, string>>({
  items,
  fields,
  make,
  onChange,
  addLabel,
  max = 9,
}: {
  items: T[];
  fields: { key: keyof T; label: string; area?: boolean }[];
  make: () => T;
  onChange: (v: T[]) => void;
  addLabel: string;
  max?: number;
}) {
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">#{i + 1}</span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Supprimer"
            >
              <X className="size-4" />
            </button>
          </div>
          {fields.map((f) => (
            <T
              key={String(f.key)}
              label={f.label}
              area={f.area}
              value={(it[f.key] as string) ?? ""}
              onChange={(v) =>
                onChange(items.map((x, j) => (j === i ? { ...x, [f.key]: v } : x)))
              }
            />
          ))}
        </div>
      ))}
      {items.length < max && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, make()])}
        >
          <Plus className="size-4" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}

function GalleryImages({
  images,
  onChange,
}: {
  images: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((url, i) => (
          <div key={`${url}-${i}`} className="space-y-1.5">
            <ImageUpload
              value={url}
              onChange={(u) =>
                onChange(
                  u
                    ? images.map((x, j) => (j === i ? u : x))
                    : images.filter((_, j) => j !== i)
                )
              }
              kind="gallery"
              maxDim={1400}
              aspClass="aspect-[4/3]"
            />
          </div>
        ))}
      </div>
      {images.length < 18 && (
        <AddGalleryImage onAdd={(url) => onChange([...images, url])} />
      )}
    </div>
  );
}

function AddGalleryImage({ onAdd }: { onAdd: (url: string) => void }) {
  const [key, setKey] = React.useState(0);
  return (
    <div key={key}>
      <Label className="text-xs">Ajouter une photo</Label>
      <ImageUpload
        value={undefined}
        onChange={(url) => {
          if (url) {
            onAdd(url);
            setKey((k) => k + 1);
          }
        }}
        kind="gallery"
        maxDim={1400}
        aspClass="aspect-[4/3]"
        compact
      />
    </div>
  );
}

function SectionFields({
  sectionKey,
  content,
  onChange,
}: {
  sectionKey: SectionKey;
  content: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const c = content;
  const set = (k: string, v: unknown) => onChange({ ...c, [k]: v });
  const str = (k: string) => (c[k] as string) ?? "";

  switch (sectionKey) {
    case "hero":
      return (
        <div className="space-y-3">
          <T label="Sur-titre" value={str("eyebrow")} onChange={(v) => set("eyebrow", v)} />
          <T label="Titre" value={str("headline")} onChange={(v) => set("headline", v)} />
          <T label="Accroche" area value={str("subhead")} onChange={(v) => set("subhead", v)} />
          <div className="space-y-1.5">
            <Label className="text-xs">Photo d&apos;en-tête</Label>
            <ImageUpload
              value={c.image as string | undefined}
              onChange={(url) => set("image", url)}
              kind="hero"
              maxDim={1800}
              aspClass="aspect-[16/9]"
            />
            <p className="text-xs text-muted-foreground">
              Remplace la photo par défaut de votre métier. Format paysage,
              1600 px de large minimum.
            </p>
          </div>
        </div>
      );
    case "gallery":
      return (
        <div className="space-y-3">
          <T label="Titre" value={str("title")} onChange={(v) => set("title", v)} />
          <GalleryImages
            images={(c.images as string[]) ?? []}
            onChange={(v) => set("images", v)}
          />
        </div>
      );
    case "services":
      return (
        <div className="space-y-3">
          <T label="Titre de la section" value={str("title")} onChange={(v) => set("title", v)} />
          <ListEditor
            items={(c.items as Record<string, string>[]) ?? []}
            fields={[
              { key: "title", label: "Prestation" },
              { key: "text", label: "Description", area: true },
            ]}
            make={() => ({ title: "", text: "" })}
            onChange={(v) => set("items", v)}
            addLabel="Ajouter une prestation"
          />
        </div>
      );
    case "about":
      return (
        <div className="space-y-3">
          <T label="Titre" value={str("title")} onChange={(v) => set("title", v)} />
          <T label="Texte" area value={str("body")} onChange={(v) => set("body", v)} />
        </div>
      );
    case "zones":
      return (
        <div className="space-y-3">
          <T label="Titre" value={str("title")} onChange={(v) => set("title", v)} />
          <T
            label="Villes / secteurs (séparés par une virgule)"
            area
            value={((c.items as string[]) ?? []).join(", ")}
            onChange={(v) =>
              set(
                "items",
                v.split(",").map((x) => x.trim()).filter(Boolean)
              )
            }
          />
        </div>
      );
    case "reviews":
      return (
        <div className="space-y-3">
          <T label="Titre" value={str("title")} onChange={(v) => set("title", v)} />
          <ListEditor
            items={(c.items as Record<string, string>[]) ?? []}
            fields={[
              { key: "name", label: "Nom du client" },
              { key: "text", label: "Témoignage", area: true },
            ]}
            make={() => ({ name: "", text: "" })}
            onChange={(v) => set("items", v)}
            addLabel="Ajouter un avis"
            max={12}
          />
        </div>
      );
    case "hours":
      return (
        <div className="space-y-3">
          <T label="Titre" value={str("title")} onChange={(v) => set("title", v)} />
          <T label="Note" value={str("note")} onChange={(v) => set("note", v)} />
          <ListEditor
            items={(c.days as Record<string, string>[]) ?? []}
            fields={[
              { key: "label", label: "Jour(s)" },
              { key: "value", label: "Horaires" },
            ]}
            make={() => ({ label: "", value: "" })}
            onChange={(v) => set("days", v)}
            addLabel="Ajouter une ligne"
            max={7}
          />
        </div>
      );
    case "trust":
      return (
        <ListEditor
          items={(c.items as Record<string, string>[]) ?? []}
          fields={[
            { key: "title", label: "Titre" },
            { key: "text", label: "Texte", area: true },
          ]}
          make={() => ({ title: "", text: "" })}
          onChange={(v) => set("items", v)}
          addLabel="Ajouter un point"
          max={4}
        />
      );
    case "cta":
    case "contact":
      return (
        <div className="space-y-3">
          <T label="Titre" value={str("title")} onChange={(v) => set("title", v)} />
          <T label="Texte" area value={str("body")} onChange={(v) => set("body", v)} />
        </div>
      );
    default:
      return null;
  }
}

function TemplateThumb({ id }: { id: TemplateId }) {
  const box =
    "aspect-[4/3] w-full overflow-hidden rounded-md border border-border bg-white";
  if (id === "epure") {
    return (
      <div className={box}>
        <div className="flex h-full flex-col gap-1.5 p-2.5">
          <div className="h-2 w-1/3 rounded-sm bg-primary/70" />
          <div className="h-1 w-2/3 rounded-sm bg-muted" />
          <div className="mt-auto flex gap-1">
            <div className="h-3 flex-1 border-t-2 border-foreground/60" />
            <div className="h-3 flex-1 border-t-2 border-foreground/60" />
            <div className="h-3 flex-1 border-t-2 border-foreground/60" />
          </div>
        </div>
      </div>
    );
  }
  if (id === "signature") {
    return (
      <div className={box}>
        <div className="flex h-full flex-col">
          <div className="h-1/2 bg-gradient-to-br from-slate-800 to-slate-600 p-2">
            <div className="h-1.5 w-1/2 rounded-sm bg-white/80" />
            <div className="mt-1 h-1 w-2/3 rounded-sm bg-white/40" />
          </div>
          <div className="grid flex-1 grid-cols-3 gap-1 p-1.5">
            <div className="rounded-sm bg-primary/15" />
            <div className="rounded-sm bg-primary/15" />
            <div className="rounded-sm bg-primary/15" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={box}>
      <div className="flex h-full flex-col">
        <div className="h-1/2 bg-gradient-to-r from-primary/80 to-primary/40 p-2">
          <div className="h-1.5 w-1/2 rounded-sm bg-white/80" />
        </div>
        <div className="grid flex-1 grid-cols-3 gap-1 p-1.5">
          <div className="rounded-sm border border-border" />
          <div className="rounded-sm border border-border" />
          <div className="rounded-sm border border-border" />
        </div>
      </div>
    </div>
  );
}

function Upsell({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto grid size-11 place-items-center rounded-full bg-copper-subtle text-copper">
          <Sparkles className="size-5" />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
          Réservé aux plans Pro et Business
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Les templates premium, les avis clients et les horaires sont inclus dans
          les plans payants — avec le domaine personnalisé et l&apos;agent IA.
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" type="button" onClick={onClose}>
            Plus tard
          </Button>
          <Button asChild className="flex-1">
            <a href="/dashboard/settings">Voir les plans</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
