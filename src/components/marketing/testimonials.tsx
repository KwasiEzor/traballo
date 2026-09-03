import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TESTIMONIALS } from "@/lib/marketing/content";

export function Testimonials() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {TESTIMONIALS.map((t) => (
        <figure
          key={t.name}
          className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <blockquote className="flex-1 text-[15px] leading-relaxed text-foreground text-pretty">
            « {t.quote} »
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
      ))}
    </div>
  );
}
