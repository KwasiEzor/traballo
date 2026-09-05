"use client";

import * as React from "react";
import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { Turnstile } from "@/components/marketing/turnstile";
import { submitContact, type ContactState } from "./actions";

const initial: ContactState = { ok: false };

export function ContactForm({
  turnstileSiteKey,
}: {
  turnstileSiteKey?: string;
}) {
  const [state, action, pending] = useActionState(submitContact, initial);
  const [topic, setTopic] = React.useState("decouverte");
  const [resetKey, setResetKey] = React.useState(0);
  const firstRender = React.useRef(true);

  // Turnstile tokens are single-use — refresh the challenge after each attempt.
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setResetKey((k) => k + 1);
  }, [state]);

  if (state.ok) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-success-subtle text-success">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
          Message envoyé
        </h3>
        <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted-foreground text-pretty">
          Merci. Nous vous répondons sous un jour ouvré à l&apos;adresse
          indiquée.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground">
          Écrivez-nous
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Les champs marqués d&apos;un astérisque sont obligatoires.
        </p>
      </div>

      {state.error && (
        <Alert variant="destructive">
          <AlertContent>
            <AlertDescription>{state.error}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nom *</Label>
          <Input id="name" name="name" required autoComplete="name" />
          {state.fieldErrors?.name && (
            <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-destructive">{state.fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="company">Entreprise</Label>
          <Input id="company" name="company" autoComplete="organization" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="topic">Sujet</Label>
          <input type="hidden" name="topic" value={topic} />
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger id="topic">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="decouverte">Découverte du produit</SelectItem>
              <SelectItem value="migration">
                Migration depuis un autre outil
              </SelectItem>
              <SelectItem value="facturation">
                Facturation électronique
              </SelectItem>
              <SelectItem value="partenariat">Partenariat</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Votre message *</Label>
        <Textarea id="message" name="message" rows={6} required />
        {state.fieldErrors?.message && (
          <p className="text-xs text-destructive">{state.fieldErrors.message}</p>
        )}
      </div>

      {turnstileSiteKey && (
        <Turnstile
          siteKey={turnstileSiteKey}
          action="contact"
          resetKey={resetKey}
        />
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="w-full sm:w-auto"
      >
        {pending ? (
          "Envoi…"
        ) : (
          <>
            <Send className="size-4" />
            Envoyer le message
          </>
        )}
      </Button>

      <p className="text-xs leading-relaxed text-muted-foreground">
        En envoyant ce formulaire, vous acceptez que vos coordonnées soient
        utilisées pour répondre à votre demande. Voir la{" "}
        <a href="/confidentialite" className="text-primary hover:underline">
          politique de confidentialité
        </a>
        .
      </p>
    </form>
  );
}
