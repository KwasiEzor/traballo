import {
  Wrench,
  Zap,
  Hammer,
  PaintRoller,
  Grid3x3,
  Home,
  Sprout,
  SprayCan,
  Truck,
  Plug,
} from "lucide-react";

const TRADES = [
  { icon: Wrench, label: "Plombiers" },
  { icon: Zap, label: "Électriciens" },
  { icon: Hammer, label: "Menuisiers" },
  { icon: Grid3x3, label: "Carreleurs" },
  { icon: PaintRoller, label: "Peintres" },
  { icon: Home, label: "Couvreurs" },
  { icon: Sprout, label: "Jardiniers" },
  { icon: SprayCan, label: "Entreprises de nettoyage" },
  { icon: Truck, label: "Déménageurs" },
  { icon: Plug, label: "Réparateurs électroménager" },
];

function Row({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-10 pr-10"
      aria-hidden={ariaHidden}
    >
      {TRADES.map((t) => (
        <span
          key={t.label}
          className="flex items-center gap-2.5 whitespace-nowrap text-sm font-medium text-muted-foreground"
        >
          <t.icon className="size-4 text-copper" />
          {t.label}
        </span>
      ))}
    </div>
  );
}

/** Infinite horizontal scroll of trade types — pure CSS, pauses on hover. */
export function TradesMarquee() {
  return (
    <div className="group relative overflow-hidden border-y border-border bg-muted/40 py-4 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        <Row />
        <Row ariaHidden />
      </div>
    </div>
  );
}
