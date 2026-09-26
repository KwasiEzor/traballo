import { describe, expect, it } from "vitest";
import { appointmentIcs } from "@/lib/appointments/ics";

const base = {
  uid: "appt_1",
  start: new Date("2026-07-01T07:00:00Z"),
  end: new Date("2026-07-01T08:30:00Z"),
  title: "Devis salle de bain",
  organizer: { name: "Plomberie Durand", email: "artisan@example.com" },
  now: new Date("2026-06-20T10:00:00Z"),
};

describe("appointmentIcs", () => {
  it("describes the appointment in UTC with CRLF line endings", () => {
    const ics = appointmentIcs({ ...base, location: "12 rue des Lilas, Lyon" });
    expect(ics.split("\r\n")).toEqual(
      expect.arrayContaining([
        "BEGIN:VCALENDAR",
        "METHOD:PUBLISH",
        "UID:appt_1@traballo.pro",
        "DTSTAMP:20260620T100000Z",
        "DTSTART:20260701T070000Z",
        "DTEND:20260701T083000Z",
        "SUMMARY:Devis salle de bain",
        "LOCATION:12 rue des Lilas\\, Lyon",
        'ORGANIZER;CN="Plomberie Durand":mailto:artisan@example.com',
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "END:VCALENDAR",
      ])
    );
    expect(ics.endsWith("\r\n")).toBe(true);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
  });

  it("cancels the same event", () => {
    const lines = appointmentIcs({ ...base, cancelled: true }).split("\r\n");
    expect(lines).toEqual(
      expect.arrayContaining([
        "METHOD:CANCEL",
        "UID:appt_1@traballo.pro",
        "STATUS:CANCELLED",
        "SEQUENCE:1",
      ])
    );
  });

  it("escapes text and cannot be broken by a hostile title", () => {
    const ics = appointmentIcs({
      ...base,
      title: "a,b;c\\d\r\nEND:VEVENT",
      organizer: { name: 'Evil"; X', email: "artisan@example.com" },
    });
    expect(ics).toContain("SUMMARY:a\\,b\;c\\\\d\\nEND:VEVENT");
    expect(ics.match(/^END:VEVENT$/gm)).toHaveLength(1);
    expect(ics).toContain('ORGANIZER;CN="Evil; X":mailto:artisan@example.com');
  });

  it("folds long lines at 75 octets", () => {
    const ics = appointmentIcs({ ...base, title: "Rénovation ".repeat(20) });
    for (const line of ics.split("\r\n")) {
      expect(Buffer.byteLength(line, "utf8")).toBeLessThanOrEqual(75);
    }
    expect(ics).toMatch(/\r\n /); // continuation lines
    // Unfolding restores the value.
    expect(ics.replace(/\r\n /g, "")).toContain(`SUMMARY:${"Rénovation ".repeat(20)}`);
  });
});
