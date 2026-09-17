import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AuthShell } from "@/components/auth/auth-shell";

describe("AuthShell", () => {
  it("points 'back to home' links at the marketing root domain, not a relative path", () => {
    // Auth pages are served on app.<rootDomain>, where the middleware rewrites
    // a relative "/" to the authenticated dashboard. An unauthenticated
    // visitor clicking "back to home" must land on the public marketing site.
    const { getByText, container } = render(
      <AuthShell title="Connexion">
        <div />
      </AuthShell>
    );

    const backLink = getByText("Retour à l'accueil").closest("a");
    expect(backLink).not.toBeNull();
    expect(backLink?.getAttribute("href")).toMatch(/^https?:\/\//);
    expect(backLink?.getAttribute("href")).not.toBe("/");

    const logoLink = container.querySelector("a");
    expect(logoLink?.getAttribute("href")).toBe(backLink?.getAttribute("href"));
  });
});
