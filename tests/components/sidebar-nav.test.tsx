import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

describe("SidebarNav", () => {
  it("links to the notifications feed", () => {
    render(<SidebarNav />);
    expect(screen.getByRole("link", { name: /notifications/i })).toHaveAttribute(
      "href",
      "/dashboard/notifications"
    );
  });

  it("shows the unread count on the notifications link", () => {
    render(<SidebarNav unread={12} />);
    expect(
      screen.getByRole("link", { name: "Notifications 9+ non lues" })
    ).toBeInTheDocument();
  });

  it("shows no badge when everything is read", () => {
    render(<SidebarNav unread={0} />);
    expect(
      screen.getByRole("link", { name: "Notifications" })
    ).toBeInTheDocument();
  });

  it("marks the notifications link as the current page", () => {
    vi.mocked(usePathname).mockReturnValue("/dashboard/notifications");
    render(<SidebarNav />);
    expect(screen.getByRole("link", { name: /notifications/i })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
