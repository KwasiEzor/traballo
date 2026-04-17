/**
 * Root page (traballo.pro)
 * Landing/marketing page
 */

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">Traballo</h1>
        <p className="mt-4 text-xl text-gray-600">
          SaaS multi-tenant pour artisans francophones
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="https://app.traballo.pro"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Dashboard
          </a>
          <a
            href="https://admin.traballo.pro"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            Admin
          </a>
        </div>
      </div>
    </div>
  );
}
