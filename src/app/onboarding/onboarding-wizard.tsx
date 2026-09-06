"use client";

import * as React from "react";
import { useActionState } from "react";
import { Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { TRADES, BRAND_COLORS, tradeLabel } from "@/lib/artisan/trades";
import { completeOnboarding, type OnboardingState } from "./actions";

const STEPS = ["Votre métier", "Vous joindre", "Votre identité", "Récapitulatif"];
const initial: OnboardingState = {};

export function OnboardingWizard({ businessName }: { businessName: string }) {
  const [state, action, pending] = useActionState(completeOnboarding, initial);
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({
    ownerName: "",
    tradeType: "plombier",
    serviceArea: "",
    phone: "",
    whatsappNumber: "",
    address: "",
    primaryColor: BRAND_COLORS[0].value,
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canNext =
    (step === 0 && form.ownerName.trim().length > 1 && form.serviceArea.trim().length > 1) ||
    (step === 1 && form.phone.trim().length > 5) ||
    step === 2;

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Stepper */}
      <ol className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                i < step && "border-primary bg-primary text-primary-foreground",
                i === step && "border-primary text-primary",
                i > step && "border-border text-muted-foreground"
              )}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "h-px flex-1",
                  i < step ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </li>
        ))}
      </ol>

      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
        Étape {step + 1} / {STEPS.length}
      </p>
      <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
        {STEPS[step]}
      </h1>

      <form
        action={action}
        onSubmit={(e) => {
          // Only the final "Récapitulatif" step may submit.
          if (step !== STEPS.length - 1) e.preventDefault();
        }}
        className="mt-8"
      >
        {/* Hidden mirrors so the single server action gets everything */}
        {Object.entries(form).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}

        {state.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertContent>
              <AlertDescription>{state.error}</AlertDescription>
            </AlertContent>
          </Alert>
        )}

        {step === 0 && (
          <div className="space-y-5">
            <Field label="Votre nom et prénom" error={state.fieldErrors?.ownerName}>
              <Input
                value={form.ownerName}
                onChange={(e) => set("ownerName", e.target.value)}
                placeholder="Jean Dupont"
                autoFocus
              />
            </Field>
            <Field label="Votre métier">
              <Select value={form.tradeType} onValueChange={(v) => set("tradeType", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRADES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              label="Zone d'intervention"
              hint="Villes ou rayon autour de votre atelier."
              error={state.fieldErrors?.serviceArea}
            >
              <Input
                value={form.serviceArea}
                onChange={(e) => set("serviceArea", e.target.value)}
                placeholder="Lyon et périphérie (20 km)"
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <Field label="Téléphone" error={state.fieldErrors?.phone}>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="06 12 34 56 78"
                autoFocus
              />
            </Field>
            <Field label="Numéro WhatsApp" hint="Facultatif — pour le bouton de contact du site.">
              <Input
                type="tel"
                value={form.whatsappNumber}
                onChange={(e) => set("whatsappNumber", e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </Field>
            <Field
              label="Adresse de l'atelier"
              hint="Facultatif. Adresse complète (n°, rue, code postal, ville) — elle place votre atelier sur la carte du site."
            >
              <Input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="12 rue des Artisans, 69003 Lyon"
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="Couleur principale" hint="Appliquée à votre site, vos factures et vos e-mails.">
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                {BRAND_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => set("primaryColor", c.value)}
                    className={cn(
                      "group relative aspect-square rounded-lg border-2 transition-transform hover:scale-105",
                      form.primaryColor === c.value
                        ? "border-foreground"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: c.value }}
                    aria-label={c.name}
                    aria-pressed={form.primaryColor === c.value}
                  >
                    {form.primaryColor === c.value && (
                      <Check className="absolute inset-0 m-auto size-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => set("primaryColor", e.target.value)}
                  className="size-9 cursor-pointer rounded-md border border-input bg-card"
                  aria-label="Couleur personnalisée"
                />
                <span className="font-mono text-sm text-muted-foreground">
                  {form.primaryColor}
                </span>
              </div>
            </Field>
            <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Le logo se règle plus tard, dans <strong>Mon site</strong>. Vous
              pourrez tout modifier à tout moment.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 rounded-xl border border-border bg-card p-5 text-sm">
            <Row k="Entreprise" v={businessName} />
            <Row k="Responsable" v={form.ownerName || "—"} />
            <Row k="Métier" v={tradeLabel(form.tradeType)} />
            <Row k="Zone" v={form.serviceArea || "—"} />
            <Row k="Téléphone" v={form.phone || "—"} />
            {form.whatsappNumber && <Row k="WhatsApp" v={form.whatsappNumber} />}
            <Row
              k="Couleur"
              v={
                <span className="flex items-center gap-2">
                  <span
                    className="size-4 rounded-full border border-border"
                    style={{ backgroundColor: form.primaryColor }}
                  />
                  {form.primaryColor}
                </span>
              }
            />
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft className="size-4" />
              Retour
            </Button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            // Distinct `key` from the submit button below: React must mount a
            // fresh node rather than flip this one's `type` to "submit"
            // mid-click, which would submit the form on "Continuer".
            <Button
              key="next"
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
            >
              Continuer
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button key="submit" type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Terminer et accéder au tableau de bord
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2.5 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium text-foreground">{v}</span>
    </div>
  );
}
