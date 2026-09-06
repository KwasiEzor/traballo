"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Copy, ExternalLink, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { setSitePublished } from "./actions";

export function PublishCard({
  slug,
  rootDomain,
  initialPublished,
}: {
  slug: string;
  rootDomain: string;
  initialPublished: boolean;
}) {
  const [published, setPublished] = React.useState(initialPublished);
  const [pending, startTransition] = React.useTransition();
  const [copied, setCopied] = React.useState(false);

  const url = `https://${slug}.${rootDomain}`;

  function toggle(next: boolean) {
    setPublished(next); // optimistic
    startTransition(async () => {
      const res = await setSitePublished(next);
      if (res.error) {
        setPublished(!next); // revert
        toast.error(res.error);
        return;
      }
      toast.success(
        next ? "Votre site est en ligne." : "Votre site est hors ligne."
      );
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copie impossible.");
    }
  }

  return (
    <Card
      className={cn(
        "border-l-4",
        published ? "border-l-success" : "border-l-muted-foreground/30"
      )}
    >
      <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "size-2.5 rounded-full",
                published ? "bg-success" : "bg-muted-foreground/40"
              )}
              aria-hidden
            />
            <span className="text-sm font-semibold text-foreground">
              {published ? "Site en ligne" : "Site hors ligne"}
            </span>
            {pending && (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {published
              ? "Vos clients peuvent voir votre site à cette adresse."
              : "Seul vous pouvez le voir. Publiez-le pour le rendre accessible."}
          </p>
          <div className="flex items-center gap-1.5 pt-1">
            <Globe className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="font-mono text-xs text-foreground">
              {slug}.{rootDomain}
            </span>
            <button
              type="button"
              onClick={copy}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Copier l'adresse"
            >
              {copied ? (
                <Check className="size-3.5 text-success" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {published && (
            <Button asChild variant="outline" size="sm">
              <a href={url} target="_blank" rel="noopener noreferrer">
                Voir <ExternalLink className="size-4" />
              </a>
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant={published ? "outline" : "success"}
            disabled={pending}
            onClick={() => toggle(!published)}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {published ? "Mettre hors ligne" : "Publier mon site"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
