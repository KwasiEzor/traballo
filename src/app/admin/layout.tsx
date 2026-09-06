import { requireAdminAccess } from "@/lib/auth/admin";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminAccess();
  return <AdminShell email={user.email}>{children}</AdminShell>;
}
