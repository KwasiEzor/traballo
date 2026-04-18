export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Accès refusé</h1>
        <p className="mt-3 text-sm text-gray-600">
          Vous n&apos;avez pas les autorisations nécessaires pour accéder à cette
          page.
        </p>
      </div>
    </div>
  );
}
