import { sendEmail } from "@/lib/email/send";
import { artisanBrand, artisanSender } from "@/lib/email/brand";
import {
  AppointmentEmail,
  type AppointmentEmailKind,
} from "@/lib/email/templates/appointment-email";
import { claimDelivery, releaseDelivery } from "@/lib/notifications/ledger";
import { appointmentIcs } from "./ics";
import type { AppointmentNotice } from "./notify-data";

export type ClientNoticeResult = "sent" | "skipped" | "failed";

/** Ledger kind: one of each per appointment. */
const LEDGER_KIND: Record<AppointmentEmailKind, string> = {
  confirmation: "confirmation",
  reminder: "reminder_j1",
  cancellation: "cancellation",
};

const SUBJECT: Record<AppointmentEmailKind, (name: string) => string> = {
  confirmation: (name) => `Rendez-vous confirmé — ${name}`,
  reminder: (name) => `Rappel : rendez-vous demain avec ${name}`,
  cancellation: (name) => `Rendez-vous annulé — ${name}`,
};

/**
 * Tell the client about their appointment, at most once per kind: the
 * ledger claim is taken before sending and released if the e-mail fails.
 * `skipped` = no client e-mail, or already sent. Never throws.
 */
export async function notifyClientOnce(
  a: AppointmentNotice,
  kind: AppointmentEmailKind
): Promise<ClientNoticeResult> {
  if (!a.clientEmail) return "skipped";
  const key = {
    tenantId: a.tenantId,
    entityType: "appointment",
    entityId: a.appointmentId,
    kind: LEDGER_KIND[kind],
    channel: "email",
  };
  try {
    if (!(await claimDelivery(key))) return "skipped";
  } catch (err) {
    console.error(`[appointments] ${a.appointmentId} claim failed`, err);
    return "failed";
  }
  if (await sendAppointmentEmail(a, kind)) return "sent";
  try {
    await releaseDelivery(key);
  } catch (err) {
    console.error(`[appointments] ${a.appointmentId} release failed`, err);
  }
  return "failed";
}

/** True if the e-mail went out. */
async function sendAppointmentEmail(
  a: AppointmentNotice,
  kind: AppointmentEmailKind
): Promise<boolean> {
  // The calendar file adds the event (confirmation) or removes it
  // (cancellation); the reminder does not need one.
  const withCalendar = kind !== "reminder";
  try {
    const res = await sendEmail({
      from: artisanSender(a.businessName),
      to: a.clientEmail!,
      replyTo: a.artisanEmail,
      subject: SUBJECT[kind](a.businessName),
      react: AppointmentEmail({
        brand: artisanBrand(a),
        kind,
        clientName: a.clientName ?? "",
        title: a.title,
        start: a.startTime,
        end: a.endTime,
        location: a.clientAddress,
        artisanPhone: a.artisanPhone,
        calendarAttached: withCalendar,
      }),
      ...(withCalendar
        ? {
            attachments: [
              {
                filename: "rendez-vous.ics",
                content: appointmentIcs({
                  uid: a.appointmentId,
                  start: a.startTime,
                  end: a.endTime,
                  title: `${a.title} — ${a.businessName}`,
                  organizer: { name: a.businessName, email: a.artisanEmail },
                  location: a.clientAddress,
                  cancelled: kind === "cancellation",
                }),
              },
            ],
          }
        : {}),
    });
    if ("error" in res && res.error) {
      console.error(`[appointments] ${a.appointmentId} ${kind} not sent`, res.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[appointments] ${a.appointmentId} ${kind} failed`, err);
    return false;
  }
}
