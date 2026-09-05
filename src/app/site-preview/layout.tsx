/**
 * Owner-only preview of the artisan's own vitrine — same rendering as the
 * live site, shown before (or regardless of) publication. Forced light
 * theme, no app chrome; embedded as an iframe in the "Mon site" editor.
 */
export default function SitePreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="light bg-white text-slate-900">{children}</div>;
}
