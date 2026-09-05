"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Downscale + re-encode to WebP in the browser before upload. */
async function toWebp(file: File, maxDim: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Conversion échouée"))),
      "image/webp",
      0.82
    )
  );
}

export function ImageUpload({
  value,
  onChange,
  kind,
  maxDim = 1600,
  aspClass = "aspect-[16/10]",
  round = false,
  compact = false,
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
  /** blob path prefix under sites/ */
  kind: string;
  maxDim?: number;
  aspClass?: string;
  round?: boolean;
  compact?: boolean;
}) {
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!/^image\/(jpe?g|png|webp)$/.test(file.type)) {
      toast.error("Formats acceptés : JPG, PNG, WebP.");
      return;
    }
    setBusy(true);
    try {
      const webp = await toWebp(file, maxDim);
      const fd = new FormData();
      fd.append("file", new File([webp], `${kind}.webp`, { type: "image/webp" }));
      fd.append("kind", kind);
      const res = await fetch("/api/blob-upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Échec de l'envoi.");
      onChange(data.url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec de l'envoi.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      <div
        className={cn(
          "relative overflow-hidden border border-border bg-muted/40",
          aspClass,
          round ? "rounded-full" : "rounded-lg",
          compact && "w-24 shrink-0"
        )}
      >
        {value ? (
          <Image src={value} alt="" fill className="object-cover" sizes="240px" />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <ImageIcon className="size-6" />
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-background/60">
            <Loader2 className="size-5 animate-spin text-foreground" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" />
          {value ? "Remplacer" : "Téléverser"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => onChange(undefined)}
          >
            <X className="size-4" />
            Retirer
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}
