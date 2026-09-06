import { cache } from "react";
import { eq, count } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  tenants,
  sites,
  artisanProfiles,
  clients,
  invoices,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth/require-auth";

export interface SetupStep {
  key: string;
  label: string;
  done: boolean;
  href: string;
}

export interface DashboardChrome {
  slug: string;
  rootDomain: string;
  siteUrl: string;
  sitePublished: boolean;
  setup: {
    steps: SetupStep[];
    doneCount: number;
    total: number;
    complete: boolean;
  };
}

/** One batched read for everything the dashboard shell needs. */
export const getDashboardChrome = cache(
  async function getDashboardChrome(): Promise<DashboardChrome> {
    const { tenantId } = await requireAuth();
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.pro";

    const [tenant, site, profile, [{ n: clientCount }], [{ n: invoiceCount }]] =
      await Promise.all([
        db.query.tenants.findFirst({
          where: eq(tenants.id, tenantId),
          columns: { slug: true },
        }),
        db.query.sites.findFirst({
          where: eq(sites.tenantId, tenantId),
          columns: { isPublished: true, sections: true },
        }),
        db.query.artisanProfiles.findFirst({
          where: eq(artisanProfiles.tenantId, tenantId),
          columns: { businessName: true, tradeType: true, phone: true, address: true },
        }),
        db.select({ n: count() }).from(clients).where(eq(clients.tenantId, tenantId)),
        db.select({ n: count() }).from(invoices).where(eq(invoices.tenantId, tenantId)),
      ]);

    const slug = tenant?.slug ?? "mon-site";
    const sitePublished = site?.isPublished ?? false;

    const profileComplete = Boolean(
      profile?.businessName && profile?.tradeType && profile?.phone && profile?.address
    );

    const steps: SetupStep[] = [
      {
        key: "profile",
        label: "Compléter votre profil",
        done: profileComplete,
        href: "/dashboard/settings",
      },
      {
        key: "client",
        label: "Ajouter un premier client",
        done: clientCount > 0,
        href: "/dashboard/clients/new",
      },
      {
        key: "invoice",
        label: "Créer une première facture",
        done: invoiceCount > 0,
        href: "/dashboard/invoices/new",
      },
      {
        key: "site",
        label: "Publier votre site",
        done: sitePublished,
        href: "/dashboard/site",
      },
    ];

    const doneCount = steps.filter((s) => s.done).length;

    return {
      slug,
      rootDomain,
      siteUrl: `https://${slug}.${rootDomain}`,
      sitePublished,
      setup: {
        steps,
        doneCount,
        total: steps.length,
        complete: doneCount === steps.length,
      },
    };
  }
);
