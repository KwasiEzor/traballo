import { Badge } from "@/components/ui/badge";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

const INVOICE: Record<string, { label: string; variant: BadgeVariant }> = {
  draft: { label: "Brouillon", variant: "neutral" },
  sent: { label: "Envoyée", variant: "default" },
  viewed: { label: "Vue", variant: "default" },
  paid: { label: "Payée", variant: "success" },
  overdue: { label: "En retard", variant: "destructive" },
  cancelled: { label: "Annulée", variant: "neutral" },
};

const APPOINTMENT: Record<string, { label: string; variant: BadgeVariant }> = {
  pending: { label: "En attente", variant: "warning" },
  confirmed: { label: "Confirmé", variant: "default" },
  completed: { label: "Terminé", variant: "success" },
  cancelled: { label: "Annulé", variant: "neutral" },
};

export function InvoiceStatusBadge({ status }: { status: string }) {
  const s = INVOICE[status] ?? INVOICE.draft;
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function AppointmentStatusBadge({ status }: { status: string }) {
  const s = APPOINTMENT[status] ?? APPOINTMENT.pending;
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
