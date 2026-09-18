import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const selectQueue: unknown[] = [];
  function makeSelectChain() {
    const chain: any = {
      from: () => chain,
      innerJoin: () => chain,
      where: () => chain,
      limit: () => chain,
      then: (resolve: any, reject: any) =>
        Promise.resolve(selectQueue.shift() ?? []).then(resolve, reject),
    };
    return chain;
  }
  const select = vi.fn(() => makeSelectChain());
  const insertOnConflict = vi.fn().mockResolvedValue(undefined);
  const insertValues = vi.fn(() => ({ onConflictDoNothing: insertOnConflict }));
  const insert = vi.fn(() => ({ values: insertValues }));
  return { selectQueue, select, insert, insertValues, insertOnConflict, sendEmail: vi.fn(), createNotification: vi.fn() };
});

vi.mock("@/lib/db", () => ({ db: { select: h.select, insert: h.insert } }));
vi.mock("@/lib/email/send", () => ({ sendEmail: h.sendEmail }));
vi.mock("@/lib/notifications/create", () => ({ createNotification: h.createNotification }));

import { GET } from "@/app/api/cron/appointment-reminders/route";

function req(auth = "Bearer test_secret"): Request {
  return new Request("http://localhost/api/cron/appointment-reminders", {
    headers: auth ? { authorization: auth } : {},
  });
}

function hoursFromNow(h2: number): Date {
  return new Date(Date.now() + h2 * 60 * 60 * 1000);
}

const baseRow = {
  appointmentId: "apt_1",
  tenantId: "t_1",
  title: "Diagnostic chauffage",
  status: "confirmed",
  startTime: hoursFromNow(24),
  endTime: hoursFromNow(25),
  clientName: "Cabinet Léon",
  clientEmail: "leon@example.com",
  plan: "pro",
  artisanBusinessName: "Menuiserie Bois & Cie",
};

beforeEach(() => {
  vi.clearAllMocks();
  h.selectQueue.length = 0;
  vi.stubEnv("CRON_SECRET", "test_secret");
  h.sendEmail.mockResolvedValue({ success: true });
  h.createNotification.mockResolvedValue({ id: "n_1" });
});

describe("GET /api/cron/appointment-reminders", () => {
  it("rejects a request without the right bearer token", async () => {
    const res = await GET(req("Bearer wrong"));
    expect(res.status).toBe(401);
    expect(h.select).not.toHaveBeenCalled();
  });

  it("sends a reminder for an upcoming appointment on a premium tenant", async () => {
    h.selectQueue.push([baseRow]); // main query
    h.selectQueue.push([]); // no prior delivery

    const res = await GET(req());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ checked: 1, remindersSent: 1 });
    expect(h.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "leon@example.com" })
    );
    expect(h.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "appointment",
        entityId: "apt_1",
        kind: "reminder",
        channel: "email",
        status: "sent",
      })
    );
    expect(h.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: "t_1", type: "appointments.reminder" })
    );
  });

  it("skips a free-plan tenant", async () => {
    h.selectQueue.push([{ ...baseRow, plan: "free" }]);

    await GET(req());

    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("skips an appointment already reminded", async () => {
    h.selectQueue.push([baseRow]);
    h.selectQueue.push([{ id: "delivery_1" }]);

    await GET(req());

    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("skips an appointment whose client has no e-mail", async () => {
    h.selectQueue.push([{ ...baseRow, clientEmail: null }]);

    await GET(req());

    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("skips an appointment outside the reminder window", async () => {
    h.selectQueue.push([{ ...baseRow, startTime: hoursFromNow(48) }]);

    await GET(req());

    expect(h.sendEmail).not.toHaveBeenCalled();
  });
});
