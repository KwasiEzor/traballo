"use client";

import { Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";
import { TESTIMONIALS } from "@/lib/marketing/content";

export function Testimonials() {
  const items = TESTIMONIALS.map((t) => ({
    key: t.name,
    node: (
      <figure className="flex h-full flex-col rounded-3xl border border-border bg-card p-7 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]">
        <Quote
          className="size-7 text-copper/70"
          fill="currentColor"
          strokeWidth={0}
        />
        <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground text-pretty sm:text-base">
          {t.quote}
        </blockquote>
        <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
          <Avatar>
            <AvatarFallback>{t.initials}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <div className="font-medium text-foreground">{t.name}</div>
            <div className="text-muted-foreground">
              {t.role} · {t.location}
            </div>
          </div>
        </figcaption>
      </figure>
    ),
  }));

  return (
    <CoverflowCarousel
      items={items}
      label="Témoignages d'artisans"
      cardWidth="clamp(276px, 78vw, 350px)"
      cardHeight="clamp(384px, 108vw, 452px)"
      rotate={36}
      depth={0.52}
      perspective={2.8}
      fade={0.14}
      gap={0.14}
      autoPlayMs={7000}
    />
  );
}
