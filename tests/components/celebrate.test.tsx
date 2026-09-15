import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { toast } from "sonner";
import { celebrate } from "@/components/shared/celebrate";

vi.mock("sonner", () => ({
  toast: { custom: vi.fn() },
}));

describe("celebrate", () => {
  it("shows a custom toast with the success mascot and the given message", () => {
    celebrate("Facture marquée comme payée.");

    expect(toast.custom).toHaveBeenCalledTimes(1);
    const renderToast = vi.mocked(toast.custom).mock.calls[0][0] as (
      id: string | number
    ) => React.ReactElement;
    const { getByText, getByRole } = render(renderToast(1));

    expect(getByText("Facture marquée comme payée.")).toBeInTheDocument();
    expect(getByRole("img")).toHaveAttribute(
      "alt",
      "Le castor Traballo lève le poing, victorieux"
    );
  });
});
