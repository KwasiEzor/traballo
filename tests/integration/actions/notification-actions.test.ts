import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import {
  markAllReadAction,
  markReadAction,
} from "@/app/dashboard/notifications/actions";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/db/tenant", () => ({
  withTenant: vi.fn(),
}));

describe("notification actions", () => {
  const updateWhere = vi.fn();
  const updateSet = vi.fn(() => ({ where: updateWhere }));
  const txUpdate = vi.fn(() => ({ set: updateSet }));

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue({
      tenantId: "tenant_test_001",
      userId: "user_test_001",
      email: "owner@test.traballo",
      plan: "pro",
      role: "owner",
      status: "active",
    });
    updateWhere.mockResolvedValue(undefined);
    vi.mocked(withTenant).mockImplementation(async (_tenantId, callback) =>
      callback({ update: txUpdate } as any)
    );
  });

  describe("markReadAction", () => {
    it("marks one notification read and revalidates", async () => {
      const res = await markReadAction("notif_1");

      expect(res).toEqual({});
      expect(txUpdate).toHaveBeenCalled();
      expect(updateSet).toHaveBeenCalledWith(
        expect.objectContaining({ readAt: expect.any(Date) })
      );
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/notifications");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
    });

    it("returns an error instead of throwing when the update fails", async () => {
      updateWhere.mockRejectedValue(new Error("db down"));
      const res = await markReadAction("notif_1");
      expect(res).toEqual({
        error: "Impossible de marquer cette notification comme lue.",
      });
    });
  });

  describe("markAllReadAction", () => {
    it("marks every unread notification read and revalidates", async () => {
      const res = await markAllReadAction();

      expect(res).toEqual({});
      expect(txUpdate).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/notifications");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard", "layout");
    });
  });
});
