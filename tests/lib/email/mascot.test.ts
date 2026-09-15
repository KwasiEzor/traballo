import { describe, expect, it } from "vitest";
import { render } from "@react-email/render";
import { EmailMascot } from "@/lib/email/mascot";
import { EMAIL_BRAND } from "@/lib/email/brand";

describe("EmailMascot", () => {
  it("renders an absolute, email-client-safe <img> for the welcome pose", async () => {
    const raw = await render(EmailMascot({ pose: "welcome" }));
    expect(raw).toContain(`${EMAIL_BRAND.site}/mascot/removed/trabby-3D-onboarding-rmv.png`);
    expect(raw).toContain("Le castor Traballo vous accueille");
  });

  it("renders the error pose with its own image and alt text", async () => {
    const raw = await render(EmailMascot({ pose: "error" }));
    expect(raw).toContain(`${EMAIL_BRAND.site}/mascot/removed/trabby-3D-error-rmv.png`);
    expect(raw).toContain("Le castor Traballo, perplexe");
  });
});
