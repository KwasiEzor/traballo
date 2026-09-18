import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const selectWhere = vi.fn();
  const selectFrom = vi.fn(() => ({ where: selectWhere }));
  const select = vi.fn(() => ({ from: selectFrom }));
  return { selectWhere, select, createNotification: vi.fn() };
});

vi.mock("@/lib/db", () => ({ db: { select: h.select } }));
vi.mock("@/lib/notifications/create", () => ({ createNotification: h.createNotification }));

import { notifyNewConversation } from "@/lib/ai/conversation-notify";

beforeEach(() => {
  vi.clearAllMocks();
  h.selectWhere.mockResolvedValue([{ value: 0 }]);
  h.createNotification.mockResolvedValue({ id: "n_1" });
});

describe("notifyNewConversation", () => {
  it("notifies the artisan for a visitor's first conversation this hour", async () => {
    await notifyNewConversation({ tenantId: "t_1", conversationId: "c_1", visitorId: "v_1" });

    expect(h.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: "t_1", type: "leads.ai_conversation" })
    );
  });

  it("skips a visitor who already started a conversation in the last hour", async () => {
    h.selectWhere.mockResolvedValue([{ value: 1 }]);
    await notifyNewConversation({ tenantId: "t_1", conversationId: "c_2", visitorId: "v_1" });
    expect(h.createNotification).not.toHaveBeenCalled();
  });

  it("never throws when the DB lookup fails", async () => {
    h.selectWhere.mockRejectedValue(new Error("db down"));
    await expect(
      notifyNewConversation({ tenantId: "t_1", conversationId: "c_1", visitorId: "v_1" })
    ).resolves.toBeUndefined();
    expect(h.createNotification).not.toHaveBeenCalled();
  });
});
