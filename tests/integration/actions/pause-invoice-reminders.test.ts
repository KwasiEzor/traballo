import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { setInvoiceRemindersPausedAction } from "@/app/dashboard/invoices/actions/pause-reminders";

vi.mock("@/lib/auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/db/tenant", () => ({ withTenant: vi.fn() }));

const ID = "3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b";
const returning = vi.fn();
const where = vi.fn(() => ({ returning }));
const set = vi.fn(() => ({ where }));
const update = vi.fn(() => ({ set }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAuth).mockResolvedValue({
    tenantId: "t_1",
    userId: "u_1",
    email: "a@example.com",
    plan: "pro",
    role: "owner",
    status: "active",
  });
  returning.mockResolvedValue([{ id: ID }]);
  vi.mocked(withTenant).mockImplementation(async (_t, cb) => cb({ update } as never));
});

describe("setInvoiceRemindersPausedAction", () => {
  it("pauses the reminders of one invoice of the current tenant", async () => {
    const res = await setInvoiceRemindersPausedAction(ID, true);
    expect(res).toEqual({ ok: true, value: { paused: true } });
    expect(withTenant).toHaveBeenCalledWith("t_1", expect.any(Function));
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ remindersPaused: true }));
    expect(revalidatePath).toHaveBeenCalledWith(`/dashboard/invoices/${ID}`);
  });

  it("validates its input", async () => {
    expect((await setInvoiceRemindersPausedAction("x", true)).ok).toBe(false);
    expect((await setInvoiceRemindersPausedAction(ID, "yes")).ok).toBe(false);
    expect(withTenant).not.toHaveBeenCalled();
  });

  it("does not reveal another tenant's invoice", async () => {
    returning.mockResolvedValue([]);
    const res = await setInvoiceRemindersPausedAction(ID, true);
    if (!res.ok) expect(res.error.code).toBe("NOT_FOUND");
    expect(res.ok).toBe(false);
  });
});
