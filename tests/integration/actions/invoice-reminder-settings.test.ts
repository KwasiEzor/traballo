import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { updateInvoiceReminderOverride } from "@/app/dashboard/invoices/actions/update-reminder-override";
import { saveInvoiceReminderSettings } from "@/app/dashboard/settings/actions/save-invoice-reminder-settings";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";

vi.mock("@/lib/auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/db/tenant", () => ({ withTenant: vi.fn() }));

const updateWhere = vi.fn().mockResolvedValue(undefined);
const updateSet = vi.fn(() => ({ where: updateWhere }));
const txUpdate = vi.fn(() => ({ set: updateSet }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAuth).mockResolvedValue({
    tenantId: "t_1",
    userId: "u_1",
    email: "artisan@example.com",
    plan: "pro",
    role: "owner",
    status: "active",
  });
  vi.mocked(withTenant).mockImplementation(async (_tenantId, callback) =>
    callback({ update: txUpdate } as any)
  );
});

describe("updateInvoiceReminderOverride", () => {
  it("turns reminders off for one invoice", async () => {
    const res = await updateInvoiceReminderOverride("inv_1", false);
    expect(res).toEqual({});
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ reminderOverride: "off" })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/invoices/inv_1");
  });

  it("turns reminders back on", async () => {
    await updateInvoiceReminderOverride("inv_1", true);
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ reminderOverride: "default" })
    );
  });

  it("returns an error instead of throwing", async () => {
    updateWhere.mockRejectedValueOnce(new Error("db down"));
    const res = await updateInvoiceReminderOverride("inv_1", true);
    expect(res).toEqual({
      error: "Impossible de mettre à jour les relances de cette facture.",
    });
  });
});

describe("saveInvoiceReminderSettings", () => {
  it("saves the toggle and a custom template", async () => {
    const res = await saveInvoiceReminderSettings({
      invoiceReminderEnabled: false,
      invoiceReminderTemplate: "Bonjour {{client}}",
    });
    expect(res).toEqual({});
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceReminderEnabled: false,
        invoiceReminderTemplate: "Bonjour {{client}}",
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/settings");
  });

  it("stores an empty template as null (fall back to the default)", async () => {
    await saveInvoiceReminderSettings({
      invoiceReminderEnabled: true,
      invoiceReminderTemplate: "",
    });
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceReminderTemplate: null })
    );
  });

  it("rejects an invalid payload without touching the DB", async () => {
    const res = await saveInvoiceReminderSettings({
      invoiceReminderEnabled: "yes" as any,
    });
    expect(res).toEqual({ error: "Réglages invalides." });
    expect(withTenant).not.toHaveBeenCalled();
  });
});
