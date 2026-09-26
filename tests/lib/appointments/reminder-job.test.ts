import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  findAppointmentsBetween: vi.fn(),
  notifyClientOnce: vi.fn(),
  claimDelivery: vi.fn(),
  createNotification: vi.fn(),
}));

vi.mock("@/lib/appointments/notify-data", () => ({
  findAppointmentsBetween: h.findAppointmentsBetween,
}));
vi.mock("@/lib/appointments/notify", () => ({ notifyClientOnce: h.notifyClientOnce }));
vi.mock("@/lib/notifications/ledger", () => ({ claimDelivery: h.claimDelivery }));
vi.mock("@/lib/notifications/create", () => ({ createNotification: h.createNotification }));

import { runAppointmentReminders } from "@/lib/appointments/reminder-job";
import type { AppointmentNotice } from "@/lib/appointments/notify-data";

// 18:00 in Paris on 2026-06-30: the run covers July 1st.
const NOW = new Date("2026-06-30T16:00:00Z");

const appt: AppointmentNotice = {
  appointmentId: "appt_1",
  tenantId: "t_1",
  plan: "pro",
  status: "confirmed",
  title: "Devis salle de bain",
  startTime: new Date("2026-07-01T07:00:00Z"),
  endTime: new Date("2026-07-01T08:30:00Z"),
  clientName: "Claire Martin",
  clientEmail: "claire@example.com",
  clientAddress: null,
  businessName: "Plomberie Durand",
  artisanEmail: "artisan@example.com",
  artisanPhone: null,
  logoUrl: null,
  primaryColor: null,
};

function given(...rows: Partial<AppointmentNotice>[]) {
  h.findAppointmentsBetween.mockResolvedValue(rows.map((r) => ({ ...appt, ...r })));
}

beforeEach(() => {
  vi.clearAllMocks();
  given({});
  h.notifyClientOnce.mockResolvedValue("sent");
  h.claimDelivery.mockResolvedValue(true);
  h.createNotification.mockResolvedValue({ id: "n_1" });
});

describe("runAppointmentReminders", () => {
  it("looks at tomorrow's Paris day", async () => {
    const summary = await runAppointmentReminders(NOW);
    expect(h.findAppointmentsBetween).toHaveBeenCalledWith(
      new Date("2026-06-30T22:00:00Z"),
      new Date("2026-07-01T22:00:00Z")
    );
    expect(summary.day).toBe("2026-07-01");
  });

  it("reminds the client the day before", async () => {
    const summary = await runAppointmentReminders(NOW);
    expect(h.notifyClientOnce).toHaveBeenCalledWith(
      expect.objectContaining({ appointmentId: "appt_1" }),
      "reminder"
    );
    expect(summary).toMatchObject({ appointments: 1, clientReminders: 1, clientFailed: 0 });
  });

  it("sends the artisan one agenda of tomorrow, once", async () => {
    given(
      {},
      {
        appointmentId: "appt_2",
        title: "Pose chaudière",
        clientName: null,
        clientEmail: null,
        startTime: new Date("2026-07-01T12:00:00Z"),
      }
    );
    await runAppointmentReminders(NOW);

    expect(h.claimDelivery).toHaveBeenCalledWith({
      tenantId: "t_1",
      entityType: "tenant",
      entityId: "t_1",
      kind: "agenda:2026-07-01",
      channel: "in_app",
    });
    expect(h.createNotification).toHaveBeenCalledTimes(1);
    expect(h.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "t_1",
        type: "appointments.reminder",
        title: "Demain : 2 rendez-vous",
        body: "09:00 Devis salle de bain (Claire Martin) · 14:00 Pose chaudière",
        actionUrl: "/dashboard/appointments",
        email: expect.objectContaining({ subject: "Vos rendez-vous de demain (2)" }),
      })
    );
  });

  it("does not repeat the agenda on a re-run", async () => {
    h.claimDelivery.mockResolvedValue(false);
    await runAppointmentReminders(NOW);
    expect(h.createNotification).not.toHaveBeenCalled();
  });

  it("leaves Free accounts alone (reminders are a Pro feature)", async () => {
    given({ plan: "free" });
    const summary = await runAppointmentReminders(NOW);
    expect(h.notifyClientOnce).not.toHaveBeenCalled();
    expect(h.claimDelivery).not.toHaveBeenCalled();
    expect(summary.clientReminders).toBe(0);
  });

  it("counts failed reminders and keeps going", async () => {
    given({}, { appointmentId: "appt_2", tenantId: "t_2" });
    h.notifyClientOnce.mockResolvedValueOnce("failed").mockResolvedValueOnce("sent");
    const summary = await runAppointmentReminders(NOW);
    expect(summary).toMatchObject({ clientReminders: 1, clientFailed: 1, agendas: 2 });
  });
});
