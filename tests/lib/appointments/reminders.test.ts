import { describe, expect, it } from "vitest";
import { dueAppointmentReminder, REMINDER_WINDOW_HOURS } from "@/lib/appointments/reminders";

const now = new Date("2026-04-20T12:00:00Z");

function inHours(h: number): Date {
  return new Date(now.getTime() + h * 60 * 60 * 1000);
}

describe("dueAppointmentReminder", () => {
  it("is due for an appointment tomorrow", () => {
    expect(dueAppointmentReminder({ status: "confirmed", startTime: inHours(24) }, now)).toBe(true);
  });

  it("is due right at the edge of the window", () => {
    expect(
      dueAppointmentReminder({ status: "pending", startTime: inHours(REMINDER_WINDOW_HOURS) }, now)
    ).toBe(true);
  });

  it("is not due just past the window", () => {
    expect(
      dueAppointmentReminder({ status: "pending", startTime: inHours(REMINDER_WINDOW_HOURS + 1) }, now)
    ).toBe(false);
  });

  it("is not due for a past appointment", () => {
    expect(dueAppointmentReminder({ status: "confirmed", startTime: inHours(-1) }, now)).toBe(false);
  });

  it("ignores cancelled/completed appointments", () => {
    expect(dueAppointmentReminder({ status: "cancelled", startTime: inHours(5) }, now)).toBe(false);
    expect(dueAppointmentReminder({ status: "completed", startTime: inHours(5) }, now)).toBe(false);
  });
});
