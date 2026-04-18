/**
 * Admin home page (admin.traballo.pro/admin)
 * Super admin dashboard
 */

import { requireAdminAccess } from "@/lib/auth/admin";

export default async function AdminPage() {
  await requireAdminAccess();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="mt-4 text-gray-600">
          Super admin - admin.traballo.pro
        </p>
      </div>
    </div>
  );
}
