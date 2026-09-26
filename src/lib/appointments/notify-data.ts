import { and, eq, gte, inArray, lt } from "drizzle-orm";
import { db, type DB } from "@/lib/db";
import { appointments, artisanProfiles, clients, sites, tenants } from "@/db/schema";
import type { PlanGate } from "@/lib/notifications/types";

/**
 * Appointment + client + artisan identity: everything an appointment notice
 * needs. Core `db.select()` only (see .claude/rules/db.md).
 */
export type AppointmentNotice = {
  appointmentId: string;
  tenantId: string;
  plan: PlanGate;
  status: string;
  title: string;
  startTime: Date;
  endTime: Date;
  clientName: string | null;
  clientEmail: string | null;
  clientAddress: string | null;
  businessName: string;
  artisanEmail: string;
  artisanPhone: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
};

function notices(executor: DB) {
  return executor
    .select({
      appointmentId: appointments.id,
      tenantId: appointments.tenantId,
      plan: tenants.plan,
      status: appointments.status,
      title: appointments.title,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      clientName: clients.name,
      clientEmail: clients.email,
      clientAddress: clients.address,
      businessName: artisanProfiles.businessName,
      artisanEmail: artisanProfiles.email,
      artisanPhone: artisanProfiles.phone,
      logoUrl: artisanProfiles.logoUrl,
      primaryColor: sites.primaryColor,
    })
    .from(appointments)
    .innerJoin(tenants, eq(tenants.id, appointments.tenantId))
    .leftJoin(
      clients,
      and(eq(clients.id, appointments.clientId), eq(clients.tenantId, appointments.tenantId))
    )
    .innerJoin(artisanProfiles, eq(artisanProfiles.tenantId, appointments.tenantId))
    .leftJoin(sites, eq(sites.tenantId, appointments.tenantId));
}

/**
 * One appointment of the tenant, for a dashboard action. Takes the caller's
 * `withTenant` transaction (RLS) and filters `tenant_id` too.
 */
export async function loadAppointmentNotice(
  tx: DB,
  appointmentId: string,
  tenantId: string
): Promise<AppointmentNotice | null> {
  const [row] = await notices(tx)
    .where(and(eq(appointments.id, appointmentId), eq(appointments.tenantId, tenantId)))
    .limit(1);
  return (row as AppointmentNotice | undefined) ?? null;
}

/**
 * Upcoming appointments starting in [start, end), for active tenants — the
 * daily cron, owner connection, across tenants.
 */
export async function findAppointmentsBetween(
  start: Date,
  end: Date,
  limit = 1000
): Promise<AppointmentNotice[]> {
  const rows = await notices(db)
    .where(
      and(
        inArray(appointments.status, ["pending", "confirmed"]),
        gte(appointments.startTime, start),
        lt(appointments.startTime, end),
        eq(tenants.status, "active")
      )
    )
    .orderBy(appointments.startTime)
    .limit(limit);
  return rows as AppointmentNotice[];
}
