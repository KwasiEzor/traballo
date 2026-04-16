/**
 * Dashboard layout
 * Shared layout for all dashboard pages
 */

import { requireAuth } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require authentication
  await requireAuth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Traballo</h2>
        </div>
        <nav className="space-y-1 px-3">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/dashboard/invoices">Factures</NavLink>
          <NavLink href="/dashboard/clients">Clients</NavLink>
          <NavLink href="/dashboard/appointments">Rendez-vous</NavLink>
          <NavLink href="/dashboard/site">Mon site</NavLink>
          <NavLink href="/dashboard/settings">Paramètres</NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
    >
      {children}
    </Link>
  );
}
