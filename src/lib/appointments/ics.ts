/**
 * iCalendar (RFC 5545) file for an appointment, attached to the client's
 * confirmation / reminder e-mails so they can add it to their calendar in
 * one click; the cancellation carries METHOD:CANCEL with the same UID.
 */

const encoder = new TextEncoder();

/** TEXT value escaping: backslash, semicolon, comma, line breaks. */
function text(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** Quoted parameter value: no DQUOTE or control characters allowed. */
function param(value: string): string {
  return `"${value.replace(/["\u0000-\u001f\u007f]/g, "")}"`;
}

function utc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Fold at 75 octets, never inside a UTF-8 character. */
function fold(line: string): string {
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74; // continuations start with a space
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export function appointmentIcs({
  uid,
  start,
  end,
  title,
  organizer,
  location,
  description,
  cancelled = false,
  now = new Date(),
}: {
  uid: string;
  start: Date;
  end: Date;
  title: string;
  organizer: { name: string; email: string };
  location?: string | null;
  description?: string | null;
  cancelled?: boolean;
  now?: Date;
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Traballo//Rendez-vous//FR",
    "CALSCALE:GREGORIAN",
    `METHOD:${cancelled ? "CANCEL" : "PUBLISH"}`,
    "BEGIN:VEVENT",
    `UID:${uid}@traballo.pro`,
    `DTSTAMP:${utc(now)}`,
    `DTSTART:${utc(start)}`,
    `DTEND:${utc(end)}`,
    `SUMMARY:${text(title)}`,
    ...(location ? [`LOCATION:${text(location)}`] : []),
    ...(description ? [`DESCRIPTION:${text(description)}`] : []),
    `ORGANIZER;CN=${param(organizer.name)}:mailto:${organizer.email}`,
    `STATUS:${cancelled ? "CANCELLED" : "CONFIRMED"}`,
    `SEQUENCE:${cancelled ? 1 : 0}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
