"use client";

import * as React from "react";
import { Monitor, Smartphone, RotateCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DEVICES = {
  desktop: { w: 1280, h: 800, label: "Ordinateur", icon: Monitor },
  mobile: { w: 390, h: 780, label: "Mobile", icon: Smartphone },
} as const;

type Device = keyof typeof DEVICES;

/** Fire this to make every mounted preview reload. */
export const SITE_SAVED_EVENT = "traballo:site-saved";

export function SitePreviewFrame({
  previewUrl,
}: {
  previewUrl: string;
}) {
  const [device, setDevice] = React.useState<Device>("mobile");
  const [tick, setTick] = React.useState(0);
  const [scale, setScale] = React.useState(1);
  const holderRef = React.useRef<HTMLDivElement>(null);

  const { w, h } = DEVICES[device];

  React.useEffect(() => {
    const el = holderRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / w));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);

  React.useEffect(() => {
    const reload = () => setTick((t) => t + 1);
    window.addEventListener(SITE_SAVED_EVENT, reload);
    return () => window.removeEventListener(SITE_SAVED_EVENT, reload);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
          {(Object.keys(DEVICES) as Device[]).map((d) => {
            const Icon = DEVICES[d].icon;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                aria-pressed={device === d}
                aria-label={DEVICES[d].label}
                className={cn(
                  "grid size-7 place-items-center rounded-md transition-colors",
                  device === d
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setTick((t) => t + 1)}
          >
            <RotateCw className="size-4" />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              <span className="hidden sm:inline">Ouvrir</span>
            </a>
          </Button>
        </div>
      </div>

      <div className="bg-muted/40 p-4">
        <div ref={holderRef} className="mx-auto w-full">
          <div
            className="mx-auto overflow-hidden rounded-lg border border-border bg-white shadow-sm"
            style={{ width: w * scale, height: h * scale }}
          >
            <iframe
              key={tick}
              src={previewUrl}
              title="Aperçu du site"
              className="origin-top-left border-0"
              style={{ width: w, height: h, transform: `scale(${scale})` }}
            />
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Aperçu du dernier enregistrement — même hors ligne.
        </p>
      </div>
    </div>
  );
}
