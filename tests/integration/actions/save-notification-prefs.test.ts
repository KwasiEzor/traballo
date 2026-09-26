import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { saveNotificationPrefs } from "@/lib/notifications/prefs";
import { saveNotificationPrefsAction } from "@/app/dashboard/settings/actions/save-notification-prefs";

vi.mock("@/lib/auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/notifications/prefs", () => ({ saveNotificationPrefs: vi.fn() }));

const AUTH = {
  tenantId: "t_1",
  userId: "u_1",
  email: "artisan@example.com",
  plan: "pro" as const,
  role: "owner" as const,
  status: "active" as const,
};

const INPUT = {
  leads: { in_app: false, email: true },
  invoices: { in_app: true, email: false },
  appointments: { in_app: true, email: true },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAuth).mockResolvedValue(AUTH);
  vi.mocked(saveNotificationPrefs).mockResolvedValue(undefined);
});

describe("saveNotificationPrefsAction", () => {
  it("saves the prefs of the current tenant + user", async () => {
    const res = await saveNotificationPrefsAction(INPUT);
    expect(res).toEqual({ ok: true, value: INPUT });
    expect(saveNotificationPrefs).toHaveBeenCalledWith("t_1", "u_1", INPUT);
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/settings");
  });

  it("keeps the lead email on even if the client sends it off", async () => {
    const res = await saveNotificationPrefsAction({
      ...INPUT,
      leads: { in_app: true, email: false },
    });
    const saved = { ...INPUT, leads: { in_app: true, email: true } };
    expect(res).toEqual({ ok: true, value: saved });
    expect(saveNotificationPrefs).toHaveBeenCalledWith("t_1", "u_1", saved);
  });

  it.each([
    ["a missing category", { leads: INPUT.leads, invoices: INPUT.invoices }],
    ["a non-boolean channel", { ...INPUT, leads: { in_app: "no", email: true } }],
    ["a locked category", { ...INPUT, billing: { in_app: false, email: false } }],
    ["garbage", "1 OR 1=1"],
  ])("rejects %s without touching the DB", async (_label, input) => {
    const res = await saveNotificationPrefsAction(input);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("VALIDATION_ERROR");
    expect(saveNotificationPrefs).not.toHaveBeenCalled();
  });

  it("refuses in support (impersonation) mode", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      ...AUTH,
      impersonating: true,
      impersonatedBy: "admin@traballo.pro",
    });
    const res = await saveNotificationPrefsAction(INPUT);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("FORBIDDEN");
    expect(saveNotificationPrefs).not.toHaveBeenCalled();
  });

  it("returns a DB_ERROR instead of throwing", async () => {
    vi.mocked(saveNotificationPrefs).mockRejectedValue(new Error("boom"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await saveNotificationPrefsAction(INPUT);
    spy.mockRestore();
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("DB_ERROR");
  });
});
