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
  const updateWhere = vi.fn().mockResolvedValue(undefined);
  const updateSet = vi.fn(() => ({ where: updateWhere }));
  const update = vi.fn(() => ({ set: updateSet }));
  const insertOnConflict = vi.fn().mockResolvedValue(undefined);
  const insertValues = vi.fn(() => ({ onConflictDoNothing: insertOnConflict }));
  const insert = vi.fn(() => ({ values: insertValues }));
  return {
    selectQueue,
    select,
    update,
    updateSet,
    updateWhere,
    insert,
    insertValues,
    insertOnConflict,
    sendEmail: vi.fn(),
    createNotification: vi.fn(),
  };
});

vi.mock("@/lib/db", () => ({
  db: { select: h.select, update: h.update, insert: h.insert },
}));
vi.mock("@/lib/email/send", () => ({ sendEmail: h.sendEmail }));
vi.mock("@/lib/notifications/create", () => ({
  createNotification: h.createNotification,
}));

import { GET } from "@/app/api/cron/invoice-reminders/route";

function req(auth = "Bearer test_secret"): Request {
  return new Request("http://localhost/api/cron/invoice-reminders", {
    headers: auth ? { authorization: auth } : {},
  });
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

const baseRow = {
  invoiceId: "inv_1",
  tenantId: "t_1",
  invoiceNumber: "2026-0042",
  status: "overdue",
  dueDate: daysAgo(35), // past both J+7 and J+30
  total: "100.00",
  pdfUrl: "https://blob.example.com/inv.pdf",
  reminderOverride: "default" as const,
  clientName: "Cabinet Léon",
  clientEmail: "leon@example.com",
  plan: "pro",
  artisanEmail: "artisan@example.com",
  artisanBusinessName: "Menuiserie Bois & Cie",
  invoiceReminderEnabled: true,
  invoiceReminderTemplate: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  h.selectQueue.length = 0;
  vi.stubEnv("CRON_SECRET", "test_secret");
  h.sendEmail.mockResolvedValue({ success: true });
  h.createNotification.mockResolvedValue({ id: "n_1" });
});

describe("GET /api/cron/invoice-reminders", () => {
  it("rejects a request without the right bearer token", async () => {
    const res = await GET(req("Bearer wrong"));
    expect(res.status).toBe(401);
    expect(h.select).not.toHaveBeenCalled();
  });

  it("sends a due reminder for a premium tenant and records the delivery", async () => {
    h.selectQueue.push([baseRow]); // main query
    h.selectQueue.push([]); // no prior deliveries

    const res = await GET(req());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ checked: 1, remindersSent: 2 }); // j7 + j30 both due
    expect(h.sendEmail).toHaveBeenCalledTimes(2);
    expect(h.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "leon@example.com", replyTo: "artisan@example.com" })
    );
    expect(h.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "invoice",
        entityId: "inv_1",
        kind: "j7",
        channel: "email",
        status: "sent",
      })
    );
    expect(h.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: "t_1", type: "invoices.reminder_sent" })
    );
  });

  it("flips an overdue-but-unmarked invoice to overdue regardless of plan, without sending a reminder on a free plan", async () => {
    h.selectQueue.push([{ ...baseRow, status: "sent", plan: "free" }]);

    const res = await GET(req());
    const body = await res.json();

    expect(body.markedOverdue).toBe(1);
    expect(h.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "overdue" })
    );
    expect(h.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "invoices.overdue" })
    );
    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("skips a milestone that was already sent", async () => {
    h.selectQueue.push([baseRow]);
    h.selectQueue.push([{ kind: "j7" }]);

    const res = await GET(req());
    const body = await res.json();

    expect(body.remindersSent).toBe(1); // only j30
    expect(h.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("respects a per-invoice reminder override of off", async () => {
    h.selectQueue.push([{ ...baseRow, reminderOverride: "off" }]);

    await GET(req());

    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("respects the artisan's global reminder toggle", async () => {
    h.selectQueue.push([{ ...baseRow, invoiceReminderEnabled: false }]);

    await GET(req());

    expect(h.sendEmail).not.toHaveBeenCalled();
  });

  it("skips an invoice whose client has no e-mail", async () => {
    h.selectQueue.push([{ ...baseRow, clientEmail: null }]);

    await GET(req());

    expect(h.sendEmail).not.toHaveBeenCalled();
  });
});
