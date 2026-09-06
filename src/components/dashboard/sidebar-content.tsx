"use client";

import { CreateMenu } from "@/components/dashboard/create-menu";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { SidebarUtility } from "@/components/dashboard/sidebar-utility";
import { SidebarUser } from "@/components/dashboard/sidebar-user";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { UpgradeButton } from "@/components/dashboard/upgrade-cta";
import type { DashboardChrome } from "@/lib/dashboard/chrome";

export function SidebarContent({
  name,
  plan,
  chrome,
  onNavigate,
}: {
  name: string;
  plan: string;
  chrome: DashboardChrome;
  onNavigate?: () => void;
}) {
  const { setup } = chrome;

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pb-3 pt-3">
        <CreateMenu onNavigate={onNavigate} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <SidebarNav onNavigate={onNavigate} />

        {!setup.complete && (
          <div className="mt-6">
            <SetupChecklist
              steps={setup.steps}
              doneCount={setup.doneCount}
              total={setup.total}
              onNavigate={onNavigate}
            />
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-sidebar-border p-3">
        {plan !== "business" && (
          <div className="rounded-xl bg-sidebar-accent/40 p-3">
            <p className="text-xs font-semibold text-sidebar-foreground">
              Plan {plan === "free" ? "Free" : "Pro"}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-sidebar-foreground/60">
              {plan === "free"
                ? "Factures illimitées, rendez-vous en ligne, domaine personnalisé."
                : "Agent IA, WhatsApp Business et rappels SMS."}
            </p>
            <UpgradeButton plan={plan} className="mt-2 w-full" />
          </div>
        )}
        <SidebarUtility
          siteUrl={chrome.siteUrl}
          sitePublished={chrome.sitePublished}
          onNavigate={onNavigate}
        />
        <SidebarUser name={name} plan={plan} />
      </div>
    </div>
  );
}
