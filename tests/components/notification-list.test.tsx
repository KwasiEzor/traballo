import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotificationList } from "@/components/dashboard/notification-list";

vi.mock("@/app/dashboard/notifications/actions", () => ({
  markNotificationReadAction: vi.fn(),
}));

const now = new Date("2026-09-26T12:00:00Z");

const items = [
  {
    id: "a",
    type: "leads.site_enquiry",
    title: "Nouvelle demande de Marie",
    body: "Rénovation de salle de bain",
    actionUrl: null,
    readAt: null,
    createdAt: new Date("2026-09-26T11:55:00Z"),
  },
  {
    id: "b",
    type: "billing.payment_failed",
    title: "Paiement échoué",
    body: null,
    actionUrl: "/dashboard/settings",
    readAt: new Date("2026-09-26T11:00:00Z"),
    createdAt: new Date("2026-09-25T12:00:00Z"),
  },
  {
    id: "c",
    type: "leads.ai_lead",
    title: "Lien piégé",
    body: null,
    actionUrl: "https://evil.example",
    readAt: null,
    createdAt: new Date("2026-09-26T10:00:00Z"),
  },
];

describe("NotificationList", () => {
  it("renders titles, bodies and relative times", () => {
    render(<NotificationList items={items} now={now} />);
    expect(screen.getByText("Nouvelle demande de Marie")).toBeInTheDocument();
    expect(screen.getByText("Rénovation de salle de bain")).toBeInTheDocument();
    expect(screen.getByText("il y a 5 min")).toBeInTheDocument();
    expect(screen.getByText("il y a 1 j")).toBeInTheDocument();
  });

  it("flags unread items for assistive tech", () => {
    render(<NotificationList items={items} now={now} />);
    expect(screen.getAllByText("Non lue")).toHaveLength(2);
  });

  it("links only to safe internal action urls", () => {
    render(<NotificationList items={items} now={now} />);
    expect(screen.getByRole("link", { name: /Paiement échoué/ })).toHaveAttribute(
      "href",
      "/dashboard/settings"
    );
    expect(screen.queryByRole("link", { name: /Lien piégé/ })).toBeNull();
  });

  it("shows the empty message when there is nothing", () => {
    render(<NotificationList items={[]} now={now} emptyLabel="Rien de neuf" />);
    expect(screen.getByText("Rien de neuf")).toBeInTheDocument();
  });
});
