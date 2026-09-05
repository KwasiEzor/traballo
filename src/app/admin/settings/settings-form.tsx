"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert";
import { saveAnthropicKey, type SettingsState } from "./actions";

const initial: SettingsState = {};

export function AnthropicKeyForm({
  source,
  hint,
}: {
  source: "stored" | "env" | "none";
  hint: string | null;
}) {
  const [state, action, pending] = useActionState(saveAnthropicKey, initial);
  const [key, setKey] = React.useState("");

  React.useEffect(() => {
    if (state.ok) {
      toast.success("Paramètres enregistrés.");
      setKey("");
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  const label =
    source === "stored"
      ? `Clé enregistrée · se termine par ${hint}`
      : source === "env"
        ? `Variable d'environnement · se termine par ${hint}`
        : "Aucune clé configurée";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-4 text-primary" />
          Clé API Anthropic
        </CardTitle>
        <CardDescription>
          Utilisée par l&apos;agent IA des sites artisans et l&apos;assistant du
          site Traballo. Une clé enregistrée ici prend le pas sur la variable
          d&apos;environnement, sans redéploiement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant={source === "none" ? "warning" : "success"}>
            {label}
          </Badge>
        </div>

        {state.error && (
          <Alert variant="destructive">
            <AlertContent>
              <AlertDescription>{state.error}</AlertDescription>
            </AlertContent>
          </Alert>
        )}

        <form action={action} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="key">Nouvelle clé</Label>
            <Input
              id="key"
              name="key"
              type="password"
              autoComplete="off"
              placeholder="sk-ant-api03-…"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Stockée chiffrée (AES-256-GCM). Sa valeur n&apos;est jamais
              réaffichée.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" name="intent" value="save" disabled={pending || !key.trim()}>
              {pending ? "Enregistrement…" : "Enregistrer la clé"}
            </Button>
            {source === "stored" && (
              <Button
                type="submit"
                name="intent"
                value="clear"
                variant="outline"
                disabled={pending}
              >
                Revenir à la variable d&apos;environnement
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
