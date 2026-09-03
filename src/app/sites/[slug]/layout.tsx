/**
 * Public artisan site layout — forced light theme, no app chrome.
 * The artisan's brand colour is injected per-page.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="light bg-white text-slate-900">{children}</div>;
}
