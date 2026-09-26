/**
 * Presentation helpers for the in-app notification feed. Dependency-free so
 * they can run in client components (bell, list) and on the server.
 */

/**
 * `actionUrl` is rendered as a link. Only same-origin absolute paths are
 * allowed: no scheme (`javascript:`, `https:`), no protocol-relative `//host`
 * and no `/\host` (browsers normalise the backslash to a slash).
 */
export function safeActionUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!url.startsWith("/")) return null;
  if (url.startsWith("//") || url.startsWith("/\\")) return null;
  return url;
}

/** Bell badge text: hidden at zero, capped at "9+". */
export function badgeLabel(unread: number): string | null {
  if (!(unread > 0)) return null;
  return unread > 9 ? "9+" : String(unread);
}

/** Clamp a requested page into range. Always at least one page. */
export function paginate(
  total: number,
  requestedPage: number,
  pageSize: number
): { page: number; pageCount: number; offset: number } {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const wanted = Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1;
  const page = Math.min(Math.max(1, wanted), pageCount);
  return { page, pageCount, offset: (page - 1) * pageSize };
}

/** Short French relative time; falls back to a date after a week. */
export function timeAgo(date: Date, now: Date = new Date()): string {
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(
    date
  );
}
