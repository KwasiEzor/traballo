import { describe, expect, it } from "vitest";
import {
  daysOverdue,
  dueReminder,
  parisToday,
  pdfFromDataUrl,
  remindersIncluded,
} from "@/lib/invoices/reminders";

describe("parisToday", () => {
  it("uses the Paris calendar date, not UTC", () => {
    // 23:30 UTC on Sept 30 is already Oct 1 in Paris (UTC+2).
    expect(parisToday(new Date("2026-09-30T23:30:00Z"))).toBe("2026-10-01");
    expect(parisToday(new Date("2026-09-30T12:00:00Z"))).toBe("2026-09-30");
    // Winter time (UTC+1).
    expect(parisToday(new Date("2026-12-31T23:30:00Z"))).toBe("2027-01-01");
  });
});

describe("daysOverdue", () => {
  it("counts whole days after the due date", () => {
    expect(daysOverdue("2026-09-01", "2026-09-08")).toBe(7);
    expect(daysOverdue("2026-09-01", "2026-09-01")).toBe(0);
    expect(daysOverdue("2026-02-25", "2026-03-27")).toBe(30);
  });
});

describe("dueReminder", () => {
  const none = new Set<string>();

  it("sends nothing before J+7", () => {
    expect(dueReminder("2026-09-01", "2026-09-07", none)).toBeNull();
  });

  it("sends the J+7 reminder once", () => {
    expect(dueReminder("2026-09-01", "2026-09-08", none)).toBe("reminder_j7");
    expect(
      dueReminder("2026-09-01", "2026-09-09", new Set(["reminder_j7"]))
    ).toBeNull();
  });

  it("catches up on a missed J+7", () => {
    expect(dueReminder("2026-09-01", "2026-09-12", none)).toBe("reminder_j7");
  });

  it("sends the J+30 reminder once", () => {
    const j7 = new Set(["reminder_j7"]);
    expect(dueReminder("2026-09-01", "2026-10-01", j7)).toBe("reminder_j30");
    expect(
      dueReminder("2026-09-01", "2026-10-05", new Set(["reminder_j7", "reminder_j30"]))
    ).toBeNull();
  });

  it("never sends two reminders at once: only the latest milestone", () => {
    expect(dueReminder("2026-09-01", "2026-10-10", none)).toBe("reminder_j30");
  });
});

describe("remindersIncluded", () => {
  it("is a Pro / Business feature", () => {
    expect(remindersIncluded("free")).toBe(false);
    expect(remindersIncluded("pro")).toBe(true);
    expect(remindersIncluded("business")).toBe(true);
  });
});

describe("pdfFromDataUrl", () => {
  it("decodes the base64 PDF stored on the invoice", () => {
    const b64 = Buffer.from("%PDF-1.4 test").toString("base64");
    expect(pdfFromDataUrl(`data:application/pdf;base64,${b64}`)?.toString()).toBe(
      "%PDF-1.4 test"
    );
  });

  it("ignores anything else", () => {
    expect(pdfFromDataUrl(null)).toBeNull();
    expect(pdfFromDataUrl("https://blob.example.com/f.pdf")).toBeNull();
    expect(pdfFromDataUrl("data:text/html;base64,PGgxPg==")).toBeNull();
  });
});
