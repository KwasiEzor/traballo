"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import { markAllReadAction, markReadAction } from "./actions";
import type { Notification } from "@/db/schema";

export function NotificationList({
  notifications,
  hasUnread,
}: {
  notifications: Notification[];
  hasUnread: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);

  async function handleClick(item: Notification) {
    if (!item.readAt) {
      setPending(item.id);
      await markReadAction(item.id);
      setPending(null);
      router.refresh();
    }
    if (item.actionUrl) router.push(item.actionUrl);
  }

  async function handleMarkAllRead() {
    setPending("all");
    await markAllReadAction();
    setPending(null);
    router.refresh();
  }

  return (
    <div>
      {hasUnread && (
        <div className="mb-3 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={pending === "all"}
          >
            <CheckCheck className="size-4" /> Tout marquer lu
          </Button>
        </div>
      )}
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {notifications.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleClick(item)}
              disabled={pending === item.id}
              className={cn(
                "flex w-full flex-col gap-1 px-4 py-3.5 text-left transition-colors hover:bg-muted disabled:opacity-50",
                !item.readAt && "bg-primary-subtle/40"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    item.readAt
                      ? "text-muted-foreground"
                      : "font-medium text-foreground"
                  )}
                >
                  {!item.readAt && (
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                  {item.title}
                </span>
                <span
                  className="shrink-0 text-xs text-muted-foreground"
                  title={formatDate(item.createdAt, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                >
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>
              {item.body && (
                <p className="text-sm text-muted-foreground">{item.body}</p>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
