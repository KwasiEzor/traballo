import { beforeEach, describe, expect, it, vi } from "vitest";
import { forbidden } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/supabase-server";
import {
  isAdminEmail,
  parseAdminEmails,
  requireAdminAccess,
} from "@/lib/auth/admin";

vi.mock("@/lib/auth/supabase-server", () => ({
  requireSessionUser: vi.fn(),
}));

function buildSessionUser(email: string) {
  return {
    id: "user_test_001",
    email,
  } as Awaited<ReturnType<typeof requireSessionUser>>;
}

describe("admin auth helpers", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("parses and normalizes ADMIN_EMAILS", () => {
    expect(parseAdminEmails(" Boss@Traballo.pro,ops@traballo.pro , ")).toEqual([
      "boss@traballo.pro",
      "ops@traballo.pro",
    ]);
  });

  it("matches admin emails case-insensitively", () => {
    expect(isAdminEmail("Boss@Traballo.pro", ["boss@traballo.pro"])).toBe(true);
    expect(isAdminEmail("user@traballo.pro", ["boss@traballo.pro"])).toBe(
      false
    );
  });

  it("forbids authenticated users who are not in ADMIN_EMAILS", async () => {
    vi.stubEnv("ADMIN_EMAILS", "boss@traballo.pro");
    vi.mocked(requireSessionUser).mockResolvedValue(
      buildSessionUser("user@traballo.pro")
    );

    await requireAdminAccess();

    expect(forbidden).toHaveBeenCalled();
  });

  it("allows authenticated admins listed in ADMIN_EMAILS", async () => {
    vi.stubEnv("ADMIN_EMAILS", "boss@traballo.pro");
    vi.mocked(requireSessionUser).mockResolvedValue(
      buildSessionUser("boss@traballo.pro")
    );

    const user = await requireAdminAccess();

    expect(forbidden).not.toHaveBeenCalled();
    expect(user.email).toBe("boss@traballo.pro");
  });
});
