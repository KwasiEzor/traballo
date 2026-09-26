import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PARIS } from "./time";

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

/**
 * Format a date as fr-FR (long date by default). A `Date` is an instant,
 * shown in Paris time whatever the server's timezone; a plain `YYYY-MM-DD`
 * (a `date` column) is a calendar day, shown as is.
 */
export function formatDate(
  value: string | Date,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }
) {
  if (typeof value === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (m) {
      const day = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
      return new Intl.DateTimeFormat("fr-FR", { ...opts, timeZone: "UTC" }).format(day);
    }
    value = new Date(value);
  }
  return new Intl.DateTimeFormat("fr-FR", { timeZone: PARIS, ...opts }).format(value);
}
