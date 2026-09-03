"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { saveAgentConfig, type AgentState } from "./actions";
import type { AiAgentConfig } from "@/db/schema";

const initial: AgentState = {};

export function AgentForm({
  config,
  businessName,
}: {
  config?: AiAgentConfig;
  businessName: string;
}) {
  const [state, action, pending] = useActionState(saveAgentConfig, initial);
  const [enabled, setEnabled] = React.useState(config?.isEnabled ?? true);
  const [tone, setTone] = React.useState(config?.tone ?? "professional");

  React.useEffect(() => {
    if (state.ok) toast.success("Agent enregistré.");
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

      <input type="hidden" name="isEnabled" value={enabled ? "on" : "off"} />
      <input type="hidden" name="tone" value={tone} />

      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-primary-subtle text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                Agent {enabled ? "actif" : "désactivé"}
              </div>
              <div className="text-xs text-muted-foreground">
                {enabled
                  ? "Il répond aux visiteurs de votre site."
                  : "Le widget de discussion n'apparaît pas."}
              </div>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personnalité</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="agentName">Nom de l&apos;assistant</Label>
            <Input
              id="agentName"
              name="agentName"
              required
              defaultValue={config?.agentName ?? `Assistant de ${businessName}`}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Ton</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professionnel (vouvoiement)</SelectItem>
                <SelectItem value="warm">Chaleureux</SelectItem>
                <SelectItem value="direct">Direct et concis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ce que l&apos;agent doit savoir</CardTitle>
          <CardDescription>
            Services, tarifs indicatifs, zone d&apos;intervention, horaires,
            questions fréquentes. Plus c&apos;est précis, mieux il répond.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            name="businessContext"
            rows={8}
            defaultValue={config?.businessContext ?? ""}
            placeholder={
              "Nous intervenons à Lyon et 20 km alentour.\nDépannage plomberie à partir de 90 € TTC.\nDisponibles du lundi au samedi, 8h–19h.\nNous ne faisons pas de rénovation de salle de bain complète."
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="openingMessage">Message d&apos;accueil</Label>
              <Textarea
                id="openingMessage"
                name="openingMessage"
                rows={3}
                defaultValue={config?.openingMessage ?? ""}
                placeholder="Bonjour ! Comment puis-je vous aider ?"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="offHoursMessage">Message hors horaires</Label>
              <Textarea
                id="offHoursMessage"
                name="offHoursMessage"
                rows={3}
                defaultValue={config?.offHoursMessage ?? ""}
                placeholder="Nous sommes fermés, laissez vos coordonnées et nous vous rappelons."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
}
