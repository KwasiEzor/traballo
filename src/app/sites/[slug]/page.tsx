/**
 * Public artisan site page ([slug].traballo.be)
 * Public-facing site for each artisan
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicSitePage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Site Public</h1>
        <p className="mt-4 text-gray-600">
          Artisan: <span className="font-mono">{slug}</span>
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {slug}.traballo.be
        </p>
      </div>
    </div>
  );
}
