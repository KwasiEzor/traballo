import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";

describe("EmptyState", () => {
  it("renders the Lucide icon when no mascot pose is given", () => {
    const { container, getByText } = render(
      <EmptyState icon={ReceiptText} title="Aucune facture" />
    );
    expect(getByText("Aucune facture")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.querySelector("img")).toBeNull();
  });

  it("renders the mascot instead of the icon when mascotPose is given", () => {
    const { container, queryByRole } = render(
      <EmptyState mascotPose="empty" title="Aucun client" />
    );
    expect(queryByRole("img")).toBeTruthy();
    expect(container.querySelector("svg")).toBeNull();
  });
});
