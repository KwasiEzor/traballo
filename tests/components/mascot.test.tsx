import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Mascot } from "@/components/shared/mascot";

describe("Mascot", () => {
  it("renders the image for the given pose with a descriptive alt text", () => {
    const { getByRole } = render(<Mascot pose="success" />);
    const img = getByRole("img");
    expect(img).toHaveAttribute("alt", "Le castor Traballo lève le poing, victorieux");
    expect(img.getAttribute("src")).toContain("trabby-3D-success-rmv.png");
  });

  it("switches source and alt text when the pose changes", () => {
    const { getByRole, rerender } = render(<Mascot pose="empty" />);
    expect(getByRole("img").getAttribute("src")).toContain(
      "trabby-3D-empty-rmv.png"
    );

    rerender(<Mascot pose="error" />);
    expect(getByRole("img").getAttribute("src")).toContain(
      "trabby-3D-error-rmv.png"
    );
    expect(getByRole("img")).toHaveAttribute(
      "alt",
      "Le castor Traballo, perplexe"
    );
  });

  it("renders the assistant pose (chatbot launcher)", () => {
    const { getByRole } = render(<Mascot pose="assistant" />);
    const img = getByRole("img");
    expect(img).toHaveAttribute("alt", "Le castor Traballo, votre assistant");
    expect(img.getAttribute("src")).toContain("trabby-2D-rmv.png");
  });

  it("applies the requested size to the wrapping element", () => {
    const { container } = render(<Mascot pose="welcome" size={64} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe("64px");
    expect(wrapper.style.height).toBe("64px");
  });

  it("keeps the image intact inside the idle-loop wrapper", () => {
    // Regression guard: the idle breathing loop wraps <Image> in an extra
    // motion.div — make sure that nesting doesn't break rendering.
    const { getByRole, container } = render(<Mascot pose="success" />);
    expect(getByRole("img")).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });
});
