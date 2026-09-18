import { describe, expect, it } from "vitest";
import {
  daysLate,
  dueReminders,
  renderReminderTemplate,
  shouldMarkOverdue,
  DEFAULT_REMINDER_TEMPLATE,
} from "@/lib/invoices/reminders";

describe("daysLate", () => {
  it("is 0 on the due date itself", () => {
    expect(daysLate("2026-04-20", new Date("2026-04-20T15:00:00Z"))).toBe(0);
  });

  it("is positive after the due date", () => {
    expect(daysLate("2026-04-01", new Date("2026-04-08T00:00:00Z"))).toBe(7);
  });

  it("is negative before the due date", () => {
    expect(daysLate("2026-04-20", new Date("2026-04-15T00:00:00Z"))).toBe(-5);
  });
});

describe("dueReminders", () => {
  const base = { status: "sent", dueDate: "2026-04-01", reminderOverride: "default" as const };

  it("is empty before J+7", () => {
    const today = new Date("2026-04-05T00:00:00Z");
    expect(dueReminders(base, today, [])).toEqual([]);
  });

  it("fires j7 exactly at J+7", () => {
    const today = new Date("2026-04-08T00:00:00Z");
    expect(dueReminders(base, today, [])).toEqual(["j7"]);
  });

  it("fires both j7 and j30 at J+30 if neither was sent", () => {
    const today = new Date("2026-05-01T00:00:00Z");
    expect(dueReminders(base, today, [])).toEqual(["j7", "j30"]);
  });

  it("skips a milestone already recorded as sent", () => {
    const today = new Date("2026-05-01T00:00:00Z");
    expect(dueReminders(base, today, ["j7"])).toEqual(["j30"]);
  });

  it("returns nothing once both milestones are sent", () => {
    const today = new Date("2026-05-01T00:00:00Z");
    expect(dueReminders(base, today, ["j7", "j30"])).toEqual([]);
  });

  it("is silenced by a per-invoice override", () => {
    const today = new Date("2026-05-01T00:00:00Z");
    expect(dueReminders({ ...base, reminderOverride: "off" }, today, [])).toEqual([]);
  });

  it("ignores invoices in a non-reminderable status", () => {
    const today = new Date("2026-05-01T00:00:00Z");
    for (const status of ["draft", "paid", "cancelled"]) {
      expect(dueReminders({ ...base, status }, today, [])).toEqual([]);
    }
  });

  it("reminds an already-overdue invoice too", () => {
    const today = new Date("2026-05-01T00:00:00Z");
    expect(dueReminders({ ...base, status: "overdue" }, today, [])).toEqual([
      "j7",
      "j30",
    ]);
  });
});

describe("shouldMarkOverdue", () => {
  it("is true for a sent invoice past its due date", () => {
    expect(shouldMarkOverdue("sent", "2026-04-01", new Date("2026-04-02"))).toBe(true);
  });

  it("is false on the due date itself", () => {
    expect(shouldMarkOverdue("sent", "2026-04-01", new Date("2026-04-01"))).toBe(false);
  });

  it("is false for a status that isn't sent/viewed", () => {
    expect(shouldMarkOverdue("overdue", "2026-04-01", new Date("2026-04-02"))).toBe(false);
    expect(shouldMarkOverdue("paid", "2026-04-01", new Date("2026-04-02"))).toBe(false);
  });
});

describe("renderReminderTemplate", () => {
  it("fills every placeholder", () => {
    const out = renderReminderTemplate(DEFAULT_REMINDER_TEMPLATE, {
      client: "Cabinet Léon",
      number: "2026-0042",
      amount: "1 240,00 €",
      days: 7,
      link: "https://app.traballo.pro/i/xyz",
    });
    expect(out).toContain("Cabinet Léon");
    expect(out).toContain("2026-0042");
    expect(out).toContain("1 240,00 €");
    expect(out).toContain("7 jours");
    expect(out).toContain("https://app.traballo.pro/i/xyz");
    expect(out).not.toContain("{{");
  });

  it("substitutes every occurrence, not just the first", () => {
    const out = renderReminderTemplate("{{client}} — bonjour {{client}}", {
      client: "X",
      number: "1",
      amount: "1",
      days: 1,
      link: "l",
    });
    expect(out).toBe("X — bonjour X");
  });
});
