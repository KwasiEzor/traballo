"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, Lock, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { SITE_SAVED_EVENT } from "@/components/dashboard/site-preview-frame";
import { BRAND_COLORS } from "@/lib/artisan/trades";
import { saveSite, updateTenantSlug, type SiteState, type SlugState } from "./actions";
import type { Site } from "@/db/schema";

const initial: SiteState = {};
const slugInitial: SlugState = {};

function SlugEditor({ slug, rootDomain }: { slug: string; rootDomain: string }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(slug);
  const [state, action, pending] = useActionState(updateTenantSlug, slugInitial);

  React.useEffect(() => {
    if (state.ok && state.slug) {
      toast.success("Adresse mise à jour.");
      setEditing(false);
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [state, router]);

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
        <div>
          <span className="text-muted-foreground">Adresse incluse : </span>
          <span className="font-medium text-foreground">
            {slug}.{rootDomain}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setValue(slug);
            setEditing(true);
          }}
        >
          <Pencil className="size-3.5" />
          Personnaliser
        </Button>
      </div>
    );
  }

  return (
    // A plain <div>, not a <form>: this sits inside SiteEditor's own <form>
    // (the "Enregistrer les réglages" one below), and HTML doesn't allow
    // nested forms — the browser would silently drop this inner <form> tag
    // while parsing the server-rendered HTML, leaving its submit button
    // bound to the outer form instead. Dispatch the action straight from
    // the click handler instead of relying on form submission.
    <div className="space-y-1.5 rounded-lg border border-border bg-muted/40 p-3">
      <Label htmlFor="slug">Adresse incluse</Label>
      <div className="flex items-center gap-1.5">
        <Input
          id="slug"
          name="slug"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="max-w-56"
          autoFocus
        />
        <span className="text-sm text-muted-foreground">.{rootDomain}</span>
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() => {
            const formData = new FormData();
            formData.set("slug", value);
            action(formData);
          }}
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Enregistrer
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
          Annuler
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Lettres minuscules, chiffres et tirets uniquement. Les liens et QR codes déjà
        partagés avec l&apos;ancienne adresse cesseront de fonctionner.
      </p>
    </div>
  );
}

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

  React.useEffect(() => {
    if (state.ok) {
      toast.success("Réglages enregistrés.");
      window.dispatchEvent(new Event(SITE_SAVED_EVENT));
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertContent>
            <AlertDescription>{state.error}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      <input type="hidden" name="primaryColor" value={color} />

      <Card>
        <CardHeader>
          <CardTitle>Couleur</CardTitle>
          <CardDescription>
            Appliquée à votre site, vos factures et vos e-mails.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
          <SlugEditor slug={slug} rootDomain={rootDomain} />
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
        Enregistrer les réglages
      </Button>
    </form>
  );
}
