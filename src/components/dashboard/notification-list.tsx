"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { safeActionUrl, timeAgo } from "@/lib/notifications/present";
import { markNotificationReadAction } from "@/app/dashboard/notifications/actions";
import type { FeedItem } from "@/lib/notifications/feed";

export function NotificationList({
  items,
  now,
  emptyLabel = "Aucune notification pour le moment.",
  compact = false,
}: {
  items: FeedItem[];
  now?: Date;
  emptyLabel?: string;
  compact?: boolean;
}) {
  const [pending, startTransition] = React.useTransition();
  const reference = now ?? new Date();

  const markRead = (id: string) =>
    startTransition(async () => {
      await markNotificationReadAction(id);
    });

  if (items.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border" aria-busy={pending}>
      {items.map((n) => {
        const unread = n.readAt == null;
        const href = safeActionUrl(n.actionUrl);
        const content = (
          <>
            <span
              className={cn(
                "block text-sm text-foreground",
                unread ? "font-semibold" : "font-medium"
              )}
            >
              {n.title}
            </span>
            {n.body && (
              <span
                className={cn(
                  "mt-0.5 block text-sm text-muted-foreground",
                  compact && "line-clamp-2"
                )}
              >
                {n.body}
              </span>
            )}
          </>
        );

        return (
          <li
            key={n.id}
            className={cn(
              "flex items-start gap-3",
              compact ? "px-4 py-3" : "px-5 py-4",
              unread && "bg-primary/[0.04]"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-full",
                unread ? "bg-primary" : "bg-transparent"
              )}
            />
            <div className="min-w-0 flex-1">
              {unread && <span className="sr-only">Non lue</span>}
              {href ? (
                <Link
                  href={href}
                  className="block rounded-sm hover:text-primary focus-visible:outline-2"
                  onClick={() => unread && markRead(n.id)}
                >
                  {content}
                </Link>
              ) : (
                content
              )}
              <time
                dateTime={n.createdAt.toISOString()}
                className="mt-1 block text-xs text-muted-foreground"
              >
                {timeAgo(n.createdAt, reference)}
              </time>
            </div>
            {unread && (
              <button
                type="button"
                onClick={() => markRead(n.id)}
                disabled={pending}
                className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label={`Marquer « ${n.title} » comme lue`}
                title="Marquer comme lue"
              >
                <Check className="size-4" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
