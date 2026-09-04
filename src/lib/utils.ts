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
