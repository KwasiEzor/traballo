"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { Check, Loader2, ExternalLink, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { BRAND_COLORS } from "@/lib/artisan/trades";
import { saveSite, type SiteState } from "./actions";
import type { Site } from "@/db/schema";

const TEMPLATES = [
  { id: "default", label: "Standard" },
  { id: "bold", label: "Contrasté" },
  { id: "minimal", label: "Épuré" },
];

const initial: SiteState = {};

export function SiteEditor({
  site,
  slug,
  rootDomain,
  canCustomDomain,
}: {
  site?: Site;
  slug: string;
  rootDomain: string;
  canCustomDomain: boolean;
}) {
  const [state, action, pending] = useActionState(saveSite, initial);
  const [color, setColor] = React.useState(site?.primaryColor ?? BRAND_COLORS[0].value);
  const [template, setTemplate] = React.useState(site?.templateId ?? "default");
  const [published, setPublished] = React.useState(site?.isPublished ?? false);

  React.useEffect(() => {
    if (state.ok) toast.success("Site enregistré.");
    if (state.error) toast.error(state.error);
  }, [state]);

  const publicUrl = `https://${slug}.${rootDomain}`;

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        {state.error && (
          <Alert variant="destructive">
            <AlertContent>
              <AlertDescription>{state.error}</AlertDescription>
            </AlertContent>
          </Alert>
        )}

        <input type="hidden" name="primaryColor" value={color} />
        <input type="hidden" name="templateId" value={template} />
        <input type="hidden" name="isPublished" value={published ? "on" : "off"} />

        <Card>
          <CardHeader>
            <CardTitle>Apparence</CardTitle>
            <CardDescription>
              Couleur et style appliqués à votre site, vos factures et vos e-mails.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Couleur principale</Label>
              <div className="flex flex-wrap gap-2.5">
                {BRAND_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={cn(
                      "grid size-9 place-items-center rounded-lg border-2 transition-transform hover:scale-105",
                      color === c.value ? "border-foreground" : "border-transparent"
                    )}
                    style={{ backgroundColor: c.value }}
                    aria-label={c.name}
                  >
                    {color === c.value && <Check className="size-4 text-white" />}
                  </button>
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="size-9 cursor-pointer rounded-lg border border-input bg-card"
                  aria-label="Couleur personnalisée"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Modèle</Label>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    className={cn(
                      "rounded-lg border-2 p-3 text-left text-sm transition-colors",
                      template === t.id
                        ? "border-primary bg-primary-subtle"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    <span className="font-medium text-foreground">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Référencement</CardTitle>
            <CardDescription>Ce qui apparaît dans Google et les partages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="metaTitle">Titre de la page</Label>
              <Input
                id="metaTitle"
                name="metaTitle"
                defaultValue={site?.metaTitle ?? ""}
                placeholder="Plomberie Dupont — dépannage 24/7 à Bruxelles"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="metaDescription">Description</Label>
              <Textarea
                id="metaDescription"
                name="metaDescription"
                rows={2}
                defaultValue={site?.metaDescription ?? ""}
                placeholder="Intervention rapide, devis gratuit…"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nom de domaine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <span className="text-muted-foreground">Adresse incluse : </span>
              <span className="font-medium text-foreground">
                {slug}.{rootDomain}
              </span>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customDomain" className="flex items-center gap-2">
                Domaine personnalisé
                {!canCustomDomain && <Lock className="size-3.5 text-muted-foreground" />}
              </Label>
              <Input
                id="customDomain"
                name="customDomain"
                defaultValue={site?.customDomain ?? ""}
                disabled={!canCustomDomain}
                placeholder="plomberie-dupont.fr"
              />
              {!canCustomDomain && (
                <p className="text-xs text-muted-foreground">
                  Disponible à partir du plan Pro.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Enregistrer les modifications
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Publication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">
                  {published ? "En ligne" : "Hors ligne"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {published
                    ? "Votre site est visible publiquement."
                    : "Seul vous pouvez voir votre site."}
                </div>
              </div>
              <Switch checked={published} onCheckedChange={setPublished} />
            </div>
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                Prévisualiser <ExternalLink className="size-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <div
          className="overflow-hidden rounded-xl border border-border"
          aria-hidden="true"
        >
          <div className="h-2" style={{ backgroundColor: color }} />
          <div className="space-y-2 p-4">
            <div className="h-3 w-2/3 rounded bg-muted" />
            <div className="h-2 w-full rounded bg-muted" />
            <div className="h-2 w-4/5 rounded bg-muted" />
            <div
              className="mt-3 inline-block rounded-md px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: color }}
            >
              Demander un devis
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
