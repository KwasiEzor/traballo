"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { TRADES } from "@/lib/artisan/trades";
import { saveProfile } from "./actions/save-profile";
import type { ArtisanProfile } from "@/db/schema";

export function ProfileForm({ profile }: { profile?: ArtisanProfile }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [tradeType, setTradeType] = React.useState(profile?.tradeType ?? "autre");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await saveProfile({
      businessName: String(fd.get("businessName") ?? ""),
      ownerName: String(fd.get("ownerName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      whatsappNumber: String(fd.get("whatsappNumber") ?? ""),
      address: String(fd.get("address") ?? ""),
      vatNumber: String(fd.get("vatNumber") ?? ""),
      iban: String(fd.get("iban") ?? ""),
      tradeType,
    });
    setLoading(false);
    if (res?.error) return setError(res.error);
    toast.success("Profil enregistré.");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertContent>
            <AlertDescription>{error}</AlertDescription>
          </AlertContent>
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="businessName" label="Nom de l'entreprise" required defaultValue={profile?.businessName} />
        <Field id="ownerName" label="Nom du gérant" required defaultValue={profile?.ownerName} />
        <Field id="email" label="E-mail" type="email" required defaultValue={profile?.email} />
        <Field id="phone" label="Téléphone" type="tel" defaultValue={profile?.phone ?? ""} />
        <Field id="whatsappNumber" label="Numéro WhatsApp" type="tel" defaultValue={profile?.whatsappNumber ?? ""} />
        <div className="space-y-1.5">
          <Label>Métier</Label>
          <Select value={tradeType} onValueChange={setTradeType}>
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
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Adresse</Label>
        <Textarea id="address" name="address" rows={2} defaultValue={profile?.address ?? ""} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="vatNumber" label="Numéro de TVA" defaultValue={profile?.vatNumber ?? ""} placeholder="FR12345678901" />
        <Field id="iban" label="IBAN (pour les factures)" defaultValue={profile?.iban ?? ""} placeholder="FR76 …" />
      </div>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  type = "text",
  defaultValue,
  placeholder,
}: {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
      />
    </div>
  );
}
