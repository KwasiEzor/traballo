import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SocialLinks } from "@/components/site/social-links";

describe("SocialLinks", () => {
  it("renders nothing when there are no links", () => {
    const { container } = render(<SocialLinks links={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders one labelled, safe external link per platform", () => {
    const { getByLabelText } = render(
      <SocialLinks
        links={[
          { platform: "facebook", url: "https://facebook.com/x" },
          { platform: "google", url: "https://g.page/x" },
        ]}
      />
    );
    const fb = getByLabelText("Facebook");
    expect(fb).toHaveAttribute("href", "https://facebook.com/x");
    expect(fb).toHaveAttribute("target", "_blank");
    expect(fb.getAttribute("rel")).toContain("noopener");
    expect(fb.querySelector("svg path")).toBeTruthy();
    expect(getByLabelText("Fiche Google")).toHaveAttribute(
      "href",
      "https://g.page/x"
    );
  });
});
