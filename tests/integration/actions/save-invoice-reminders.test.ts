import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { saveInvoiceRemindersAction } from "@/app/dashboard/settings/actions/save-invoice-reminders";

vi.mock("@/lib/auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/db/tenant", () => ({ withTenant: vi.fn() }));

const AUTH = {
  tenantId: "t_1",
  userId: "u_1",
  email: "artisan@example.com",
  plan: "pro" as const,
  role: "owner" as const,
  status: "active" as const,
};

const returning = vi.fn();
const where = vi.fn(() => ({ returning }));
const set = vi.fn(() => ({ where }));
const update = vi.fn(() => ({ set }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAuth).mockResolvedValue(AUTH);
  returning.mockResolvedValue([{ id: "p_1" }]);
  vi.mocked(withTenant).mockImplementation(async (_t, cb) => cb({ update } as never));
});

describe("saveInvoiceRemindersAction", () => {
  it("saves the switch on the current tenant's profile", async () => {
    const res = await saveInvoiceRemindersAction(false);
    expect(res).toEqual({ ok: true, value: { enabled: false } });
    expect(withTenant).toHaveBeenCalledWith("t_1", expect.any(Function));
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceReminders: false })
    );
    expect(where).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/settings");
  });

  it("rejects anything but a boolean", async () => {
    const res = await saveInvoiceRemindersAction("false");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("VALIDATION_ERROR");
    expect(withTenant).not.toHaveBeenCalled();
  });

  it("refuses in support (impersonation) mode", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ ...AUTH, impersonating: true });
    const res = await saveInvoiceRemindersAction(true);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("FORBIDDEN");
    expect(withTenant).not.toHaveBeenCalled();
  });

  it("reports a tenant without profile", async () => {
    returning.mockResolvedValue([]);
    const res = await saveInvoiceRemindersAction(true);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("NOT_FOUND");
  });

  it("returns a DB_ERROR instead of throwing", async () => {
    vi.mocked(withTenant).mockRejectedValue(new Error("boom"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await saveInvoiceRemindersAction(true);
    spy.mockRestore();
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("DB_ERROR");
  });
});
