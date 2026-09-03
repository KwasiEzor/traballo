import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/marketing/section";
import { ProductFrame } from "@/components/marketing/product-frame";

export interface ShowcaseItem {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  frameUrl: string;
  visual: React.ReactNode;
}

export function FeatureShowcase({ items }: { items: ShowcaseItem[] }) {
  return (
    <div className="space-y-24">
      {items.map((item, i) => (
        <div
          key={item.id}
          id={item.id}
          className="grid scroll-mt-24 items-center gap-10 lg:grid-cols-2 lg:gap-16"
        >
          <div className={cn(i % 2 === 1 && "lg:order-2")}>
            <Eyebrow>{item.eyebrow}</Eyebrow>
            <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {item.title}
            </h3>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground text-pretty">
              {item.description}
            </p>
            <ul className="mt-6 space-y-3">
              {item.points.map((p) => (
                <li key={p} className="flex gap-3 text-[15px]">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-foreground">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={cn(i % 2 === 1 && "lg:order-1")}>
            <ProductFrame url={item.frameUrl}>{item.visual}</ProductFrame>
          </div>
        </div>
      ))}
    </div>
  );
}
