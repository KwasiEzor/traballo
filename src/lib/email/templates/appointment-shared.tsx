/** Shared date formatting + info box for the three appointment e-mails. */
import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EMAIL_BRAND as B } from "@/lib/email/brand";

export function formatAppointmentRange(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const date = start.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const startHour = start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const endHour = end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return { date, hours: `${startHour} – ${endHour}` };
}

export function AppointmentBox({
  label,
  title,
  date,
  hours,
}: {
  label: string;
  title: string;
  date: string;
  hours: string;
}) {
  return (
    <Section style={box}>
      <Text style={boxLabel}>{label}</Text>
      <Text style={boxTitle}>{title}</Text>
      <Text style={boxDate}>{date}</Text>
      <Text style={boxHours}>{hours}</Text>
    </Section>
  );
}

const box: React.CSSProperties = {
  backgroundColor: B.page,
  border: `1px solid ${B.border}`,
  borderRadius: "10px",
  padding: "20px",
  textAlign: "center",
  margin: "16px 0",
};
const boxLabel: React.CSSProperties = {
  fontSize: "12px",
  color: B.muted,
  margin: "0 0 6px",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};
const boxTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: B.ink,
  margin: "0 0 4px",
};
const boxDate: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 600,
  color: B.ink,
  margin: "0 0 4px",
  textTransform: "capitalize",
};
const boxHours: React.CSSProperties = {
  fontSize: "14px",
  color: B.muted,
  margin: 0,
};
