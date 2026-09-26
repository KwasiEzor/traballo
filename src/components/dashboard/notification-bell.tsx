"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationList } from "@/components/dashboard/notification-list";
import { MarkAllReadButton } from "@/components/dashboard/mark-all-read-button";
import { badgeLabel } from "@/lib/notifications/present";
import type { FeedItem } from "@/lib/notifications/feed";

/** Poll interval: no websocket at this scale (see NOTIFICATIONS_PLAN.md). */
const REFRESH_MS = 60_000;

export function NotificationBell({
  unread,
  items,
}: {
  unread: number;
  items: FeedItem[];
}) {
  const router = useRouter();
  const badge = badgeLabel(unread);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [router]);

  const label =
    unread > 0
      ? `Notifications, ${unread} non lue${unread > 1 ? "s" : ""}`
      : "Notifications";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={label}>
          <Bell className="size-5" />
          {badge && (
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground"
            >
              {badge}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <span className="font-display text-sm font-semibold text-foreground">
            Notifications
          </span>
          {unread > 0 && (
            <MarkAllReadButton variant="ghost" className="h-7 px-2 text-xs" />
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
          <NotificationList items={items} compact />
        </div>
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem asChild className="justify-center rounded-none py-2.5 text-sm">
          <Link href="/dashboard/notifications">Voir toutes les notifications</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
