"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import { markAllReadAction, markReadAction } from "@/app/dashboard/notifications/actions";

export type NotificationBellItem = {
  id: string;
  title: string;
  body: string | null;
  actionUrl: string | null;
  readAt: string | Date | null;
  createdAt: string | Date;
};

const REFRESH_INTERVAL_MS = 60_000;

export function NotificationBell({
  unreadCount,
  recent,
}: {
  unreadCount: number;
  recent: NotificationBellItem[];
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);

  React.useEffect(() => {
    const id = setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [router]);

  async function handleOpenItem(item: NotificationBellItem) {
    if (!item.readAt) {
      setPending(item.id);
      await markReadAction(item.id);
      setPending(null);
      router.refresh();
    }
  }

  async function handleMarkAllRead() {
    setPending("all");
    await markAllReadAction();
    setPending(null);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
              : "Notifications"
          }
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] leading-none"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0 normal-case">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={pending === "all"}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
            >
              <CheckCheck className="size-3.5" /> Tout marquer lu
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        {recent.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Aucune notification pour le moment.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {recent.map((item) => (
              <DropdownMenuItem
                key={item.id}
                asChild
                className="flex-col items-start gap-0.5 whitespace-normal"
                onSelect={(e) => {
                  e.preventDefault();
                  void handleOpenItem(item);
                  if (item.actionUrl) router.push(item.actionUrl);
                }}
              >
                <div
                  className={cn(
                    "cursor-pointer",
                    pending === item.id && "opacity-50"
                  )}
                >
                  <div className="flex w-full items-start gap-2">
                    {!item.readAt && (
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        item.readAt
                          ? "text-muted-foreground"
                          : "font-medium text-foreground"
                      )}
                    >
                      {item.title}
                    </span>
                  </div>
                  {item.body && (
                    <p className="ml-3.5 line-clamp-2 text-xs text-muted-foreground">
                      {item.body}
                    </p>
                  )}
                  <p className="ml-3.5 text-[11px] text-muted-foreground">
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/notifications" className="justify-center text-sm">
            Voir toutes les notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
