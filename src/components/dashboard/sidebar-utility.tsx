import { ExternalLink, LifeBuoy } from "lucide-react";

/**
 * Secondary links at the foot of the sidebar. Plain component (no hooks) so
 * it renders in both the server-side aside and the client mobile drawer.
 */
export function SidebarUtility({
  siteUrl,
  sitePublished,
  onNavigate,
}: {
  siteUrl: string;
  sitePublished: boolean;
  onNavigate?: () => void;
}) {
  const cls =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground";

  return (
    <div className="flex flex-col gap-0.5">
      {sitePublished && (
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          className={cls}
        >
          <ExternalLink className="size-[18px] shrink-0 text-sidebar-foreground/45" />
          Voir mon site
        </a>
      )}
      <a href="mailto:aide@traballo.pro" onClick={onNavigate} className={cls}>
        <LifeBuoy className="size-[18px] shrink-0 text-sidebar-foreground/45" />
        Aide &amp; support
      </a>
    </div>
  );
}
