import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { markNotificationsRead } from "@/lib/notifications/feed";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/dashboard/notifications/actions";

vi.mock("@/lib/auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/notifications/feed", () => ({ markNotificationsRead: vi.fn() }));

const ID = "3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b";

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
  vi.mocked(markNotificationsRead).mockResolvedValue(1);
});

describe("markNotificationReadAction", () => {
  it("marks one notification read for the current tenant + user", async () => {
    const res = await markNotificationReadAction(ID);
    expect(res).toEqual({ ok: true, value: { updated: 1 } });
    expect(markNotificationsRead).toHaveBeenCalledWith("t_1", "u_1", [ID]);
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
  });

  it("rejects a non-uuid id without touching the DB", async () => {
    const res = await markNotificationReadAction("1 OR 1=1");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("VALIDATION_ERROR");
    expect(markNotificationsRead).not.toHaveBeenCalled();
  });

  it("returns a DB_ERROR instead of throwing", async () => {
    vi.mocked(markNotificationsRead).mockRejectedValue(new Error("boom"));
    const res = await markNotificationReadAction(ID);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("DB_ERROR");
  });
});

describe("markAllNotificationsReadAction", () => {
  it("marks every unread notification of the current tenant + user", async () => {
    vi.mocked(markNotificationsRead).mockResolvedValue(4);
    const res = await markAllNotificationsReadAction();
    expect(res).toEqual({ ok: true, value: { updated: 4 } });
    expect(markNotificationsRead).toHaveBeenCalledWith("t_1", "u_1");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
  });

  it("returns a DB_ERROR instead of throwing", async () => {
    vi.mocked(markNotificationsRead).mockRejectedValue(new Error("boom"));
    const res = await markAllNotificationsReadAction();
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("DB_ERROR");
  });
});
