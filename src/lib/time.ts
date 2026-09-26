/**
 * Paris wall-clock time. Artisans work in France, Belgium and Luxembourg,
 * all on CET/CEST: every date or time an artisan types or reads is Paris
 * time, whatever the server's timezone (UTC on Vercel). Instants are stored
 * as real UTC instants.
 *
 * Dependency-free: usable in client components.
 */

export const PARIS = "Europe/Paris";

const PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: PARIS,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function parisParts(d: Date): Record<string, string> {
  return Object.fromEntries(PARTS.formatToParts(d).map((p) => [p.type, p.value]));
}

/** Paris offset from UTC at this instant, in minutes (+60 winter, +120 summer). */
function parisOffsetMinutes(d: Date): number {
  const p = parisParts(d);
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUtc - d.getTime()) / 60_000);
}

/**
 * The instant of `date` (`YYYY-MM-DD`) at `time` (`HH:MM`) in Paris. A time
 * that does not exist (spring gap) lands just after the gap.
 */
export function parisWallTime(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const naive = Date.UTC(y, m - 1, d, h, mi);
  const first = parisOffsetMinutes(new Date(naive));
  let t = naive - first * 60_000;
  const second = parisOffsetMinutes(new Date(t));
  if (second !== first) t = naive - second * 60_000;
  return new Date(t);
}

/** Calendar date in Paris, `YYYY-MM-DD`. */
export function parisDate(d: Date = new Date()): string {
  const p = parisParts(d);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Clock time in Paris, `HH:MM`. */
export function parisTime(d: Date): string {
  const p = parisParts(d);
  return `${p.hour}:${p.minute}`;
}

/** The UTC instants where a Paris calendar day starts and ends. */
export function parisDayBounds(date: string): { start: Date; end: Date } {
  return {
    start: parisWallTime(date, "00:00"),
    end: parisWallTime(addDays(date, 1), "00:00"),
  };
}

/** `YYYY-MM-DD` + n calendar days. */
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
