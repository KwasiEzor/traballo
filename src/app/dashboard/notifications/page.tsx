import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import {
  getNotificationsPage,
  NOTIFICATIONS_PAGE_SIZE,
} from "@/lib/notifications/query";
import {
  CATEGORY_LABELS,
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
} from "@/lib/notifications/types";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NotificationList } from "./notification-list";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

function isCategory(value: string | undefined): value is NotificationCategory {
  return (NOTIFICATION_CATEGORIES as readonly string[]).includes(value ?? "");
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const { tenantId, userId } = await requireAuth();
  const { page: pageParam, category: categoryParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const category = isCategory(categoryParam) ? categoryParam : undefined;

  const { rows, total } = await withTenant(tenantId, (tx) =>
    getNotificationsPage(tx, tenantId, userId, { page, category })
  );

  const totalPages = Math.max(1, Math.ceil(total / NOTIFICATIONS_PAGE_SIZE));
  const hasUnread = rows.some((r) => !r.readAt);

  function filterHref(next?: NotificationCategory) {
    const params = new URLSearchParams();
    if (next) params.set("category", next);
    const qs = params.toString();
    return qs ? `/dashboard/notifications?${qs}` : "/dashboard/notifications";
  }

  function pageHref(next: number) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    params.set("page", String(next));
    return `/dashboard/notifications?${params.toString()}`;
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`${total} notification${total > 1 ? "s" : ""}`}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <Link href={filterHref(undefined)}>
          <Badge variant={!category ? "default" : "outline"}>Toutes</Badge>
        </Link>
        {NOTIFICATION_CATEGORIES.map((c) => (
          <Link key={c} href={filterHref(c)}>
            <Badge variant={category === c ? "default" : "outline"}>
              {CATEGORY_LABELS[c]}
            </Badge>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          mascotPose="empty"
          title="Aucune notification"
          description={
            category
              ? "Rien dans cette catégorie pour le moment."
              : "Vous serez prévenu ici des demandes, rendez-vous et alertes de votre compte."
          }
        />
      ) : (
        <>
          <NotificationList notifications={rows} hasUnread={hasUnread} />

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-4 text-sm">
              <Link
                href={pageHref(page - 1)}
                aria-disabled={page <= 1}
                className={cn(
                  "flex items-center gap-1 text-muted-foreground hover:text-foreground",
                  page <= 1 && "pointer-events-none opacity-40"
                )}
              >
                <ChevronLeft className="size-4" /> Précédent
              </Link>
              <span className="text-muted-foreground">
                Page {page} / {totalPages}
              </span>
              <Link
                href={pageHref(page + 1)}
                aria-disabled={page >= totalPages}
                className={cn(
                  "flex items-center gap-1 text-muted-foreground hover:text-foreground",
                  page >= totalPages && "pointer-events-none opacity-40"
                )}
              >
                Suivant <ChevronRight className="size-4" />
              </Link>
            </div>
          )}
        </>
      )}
    </>
  );
}
