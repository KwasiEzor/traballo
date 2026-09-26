import { beforeEach, describe, expect, it, vi } from "vitest";
import { withTenant } from "@/lib/db/tenant";
import { markNotificationsRead } from "@/lib/notifications/feed";

vi.mock("@/lib/db/tenant", () => ({ withTenant: vi.fn() }));

const returning = vi.fn();
const where = vi.fn(() => ({ returning }));
const set = vi.fn(() => ({ where }));
const update = vi.fn(() => ({ set }));

beforeEach(() => {
  vi.clearAllMocks();
  returning.mockResolvedValue([{ id: "n1" }, { id: "n2" }]);
  vi.mocked(withTenant).mockImplementation(async (_t, cb) =>
    cb({ update } as any)
  );
});

describe("markNotificationsRead", () => {
  it("runs inside the caller's tenant scope and stamps readAt", async () => {
    const n = await markNotificationsRead("t_1", "u_1");
    expect(withTenant).toHaveBeenCalledWith("t_1", expect.any(Function));
    expect(set).toHaveBeenCalledWith({ readAt: expect.any(Date) });
    expect(where).toHaveBeenCalledTimes(1);
    expect(n).toBe(2);
  });

  it("is a no-op for an empty id list", async () => {
    const n = await markNotificationsRead("t_1", "u_1", []);
    expect(n).toBe(0);
    expect(withTenant).not.toHaveBeenCalled();
  });

  it("targets only the given ids when provided", async () => {
    returning.mockResolvedValue([{ id: "n1" }]);
    const n = await markNotificationsRead("t_1", "u_1", ["n1"]);
    expect(n).toBe(1);
    expect(withTenant).toHaveBeenCalledWith("t_1", expect.any(Function));
  });
});
