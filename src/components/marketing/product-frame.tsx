import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A neutral browser-window chrome for product mockups.
 *
 * The mockups are fixed-width desktop layouts (`designWidth`). Rather than
 * letting them wrap on narrow screens, the body scrolls horizontally with a
 * soft right-edge fade to hint it.
 */
export function ProductFrame({
  className,
  url = "app.traballo.pro",
  designWidth = 520,
  children,
}: {
  className?: string;
  url?: string;
  designWidth?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-xl",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-3 py-2.5 sm:px-4">
        <div className="flex shrink-0 gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <div className="mx-auto flex max-w-[65%] items-center gap-1.5 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
          <svg viewBox="0 0 24 24" className="size-3 shrink-0" fill="none" aria-hidden="true">
            <path
              d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0c2.5 2.7 3.8 6.3 3.8 10S14.5 19.3 12 22M12 2C9.5 4.7 8.2 8.3 8.2 12s1.3 7.3 3.8 10M2.5 9h19M2.5 15h19"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <span className="truncate">{url}</span>
        </div>
      </div>

      <div className="relative bg-background">
        <div className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div style={{ minWidth: designWidth }}>{children}</div>
        </div>
        {/* right-edge fade — only meaningful when the content overflows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-card to-transparent sm:hidden"
        />
      </div>
    </div>
  );
}
