"use client";

import * as React from "react";
import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
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
import { submitContact, type ContactState } from "./actions";

const initial: ContactState = { ok: false };

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);
  const [topic, setTopic] = React.useState("decouverte");

  if (state.ok) {
    return (
      <Alert variant="success">
        <CheckCircle2 />
        <AlertContent>
          <AlertDescription>
            Message envoyé. Nous vous répondons sous un jour ouvré à
            l&apos;adresse indiquée.
          </AlertDescription>
        </AlertContent>
      </Alert>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <Alert variant="destructive">
          <AlertContent>
            <AlertDescription>{state.error}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

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
          <Input id="email" name="email" type="email" required autoComplete="email" />
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
              <SelectItem value="migration">Migration depuis un autre outil</SelectItem>
              <SelectItem value="facturation">Facturation électronique</SelectItem>
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

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Envoi…" : "Envoyer le message"}
      </Button>
      <p className="text-xs text-muted-foreground">
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
