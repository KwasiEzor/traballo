import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as EUR currency (fr-FR). */
export function formatEUR(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(n) ? n : 0);
}

/** Format an ISO date string / Date as a long fr-FR date. */
export function formatDate(
  value: string | Date,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }
) {
  let d: Date;
  if (typeof value === "string") {
    // Plain "YYYY-MM-DD" (a `date` column) must be read as local, not UTC,
    // otherwise it can render as the previous day in western timezones.
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    d = m
      ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
      : new Date(value);
  } else {
    d = value;
  }
  return new Intl.DateTimeFormat("fr-FR", opts).format(d);
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "il y a 3 h" / "à l'instant" style relative time, fr-FR. */
export function formatRelativeTime(value: string | Date, now: Date = new Date()) {
  const d = typeof value === "string" ? new Date(value) : value;
  const seconds = Math.round((d.getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= unitSeconds) {
      return rtf.format(Math.round(seconds / unitSeconds), unit);
    }
  }
  return rtf.format(seconds, "second");
}
