import { Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { TESTIMONIALS } from "@/lib/marketing/content";

export function Testimonials() {
  return (
    <RevealGroup className="grid gap-6 md:grid-cols-3">
      {TESTIMONIALS.map((t) => (
        <RevealItem key={t.name}>
          <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <Quote className="size-6 text-copper/60" fill="currentColor" strokeWidth={0} />
            <blockquote className="mt-2 flex-1 text-[15px] leading-relaxed text-foreground text-pretty">
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
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
