import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { listNotifications } from "@/lib/notifications/feed";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { NotificationList } from "@/components/dashboard/notification-list";
import { MarkAllReadButton } from "@/components/dashboard/mark-all-read-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const UNREAD_FILTER = "non-lues";

function href(page: number, unreadOnly: boolean): string {
  const params = new URLSearchParams();
  if (unreadOnly) params.set("filtre", UNREAD_FILTER);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/dashboard/notifications${qs ? `?${qs}` : ""}`;
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filtre?: string }>;
}) {
  const sp = await searchParams;
  const unreadOnly = sp.filtre === UNREAD_FILTER;
  const { tenantId, userId } = await requireAuth();
  const { items, unread, total, page, pageCount } = await listNotifications(
    tenantId,
    userId,
    { page: Number(sp.page ?? 1), unreadOnly }
  );

  const tabs = [
    { label: "Toutes", active: !unreadOnly, href: href(1, false) },
    { label: `Non lues (${unread})`, active: unreadOnly, href: href(1, true) },
  ];

  return (
    <>
      <PageHeader
        title="Notifications"
        description={
          unread > 0
            ? `${unread} notification${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}`
            : "Vous êtes à jour."
        }
        actions={unread > 0 ? <MarkAllReadButton /> : undefined}
      />

      <nav aria-label="Filtrer les notifications" className="mb-4 flex gap-1.5">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            aria-current={t.active ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              t.active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {total === 0 ? (
        <EmptyState
          mascotPose="empty"
          title={unreadOnly ? "Tout est lu" : "Aucune notification"}
          description={
            unreadOnly
              ? "Aucune notification en attente."
              : "Les nouvelles demandes de clients et les alertes de facturation apparaîtront ici."
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <NotificationList items={items} />
        </Card>
      )}

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} sur {pageCount}
          </span>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" disabled={page <= 1}>
              {page > 1 ? (
                <Link href={href(page - 1, unreadOnly)}>
                  <ChevronLeft className="size-4" /> Précédent
                </Link>
              ) : (
                <span aria-disabled>
                  <ChevronLeft className="size-4" /> Précédent
                </span>
              )}
            </Button>
            <Button asChild variant="outline" size="sm" disabled={page >= pageCount}>
              {page < pageCount ? (
                <Link href={href(page + 1, unreadOnly)}>
                  Suivant <ChevronRight className="size-4" />
                </Link>
              ) : (
                <span aria-disabled>
                  Suivant <ChevronRight className="size-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
