import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { saveProfile } from "@/app/dashboard/settings/actions/save-profile";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { artisanProfiles, sites } from "@/db/schema";
import { revalidatePublicSite } from "@/lib/artisan/site-data";

vi.mock("@/lib/auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/db/tenant", () => ({ withTenant: vi.fn() }));
vi.mock("@/lib/artisan/site-data", () => ({ revalidatePublicSite: vi.fn() }));

const profileFindFirst = vi.fn();
const sitesFindFirst = vi.fn();
const profileSet = vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) }));
const sitesSet = vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) }));

const txUpdate = vi.fn((table: unknown) => {
  if (table === artisanProfiles) return { set: profileSet };
  if (table === sites) return { set: sitesSet };
  throw new Error("unexpected table passed to tx.update");
});

const tx = {
  query: {
    artisanProfiles: { findFirst: profileFindFirst },
    sites: { findFirst: sitesFindFirst },
  },
  update: txUpdate,
  insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue(undefined) })),
};

function input(overrides: Partial<Parameters<typeof saveProfile>[0]> = {}) {
  return {
    businessName: "GreenDan",
    ownerName: "Dan",
    email: "dan@example.com",
    tradeType: "jardinier",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAuth).mockResolvedValue({
    tenantId: "t_1",
    userId: "u_1",
    email: "dan@example.com",
    plan: "free",
    role: "owner",
    status: "active",
  });
  vi.mocked(withTenant).mockImplementation(async (_tenantId, callback) => callback(tx as any));
});

describe("saveProfile — hero image follows trade change", () => {
  it("clears a custom hero photo when the trade changes and one is set", async () => {
    profileFindFirst.mockResolvedValue({ id: "p_1", tradeType: "electricien", address: null });
    sitesFindFirst.mockResolvedValue({
      id: "s_1",
      sections: {
        template: "standard",
        content: {
          hero: { headline: "Salut", image: "https://blob.example/electricien.webp" },
          services: { title: "Nos prestations" },
        },
      },
    });

    const res = await saveProfile(input({ tradeType: "jardinier" }));

    expect(res).toEqual({ success: true, located: "none" });
    expect(sitesSet).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: expect.objectContaining({
          content: expect.objectContaining({
            hero: { headline: "Salut" }, // image key gone, rest preserved
            services: { title: "Nos prestations" }, // untouched
          }),
        }),
      })
    );
  });

  it("does not touch sites when the trade changes but no custom hero photo is set", async () => {
    profileFindFirst.mockResolvedValue({ id: "p_1", tradeType: "electricien", address: null });
    sitesFindFirst.mockResolvedValue({
      id: "s_1",
      sections: { content: { hero: { headline: "Salut" } } },
    });

    await saveProfile(input({ tradeType: "jardinier" }));

    expect(sitesSet).not.toHaveBeenCalled();
  });

  it("does not look up sites at all when the trade is unchanged", async () => {
    profileFindFirst.mockResolvedValue({ id: "p_1", tradeType: "jardinier", address: null });

    await saveProfile(input({ tradeType: "jardinier" }));

    expect(sitesFindFirst).not.toHaveBeenCalled();
    expect(sitesSet).not.toHaveBeenCalled();
  });

  it("still saves the profile and revalidates the public site", async () => {
    profileFindFirst.mockResolvedValue({ id: "p_1", tradeType: "electricien", address: null });
    sitesFindFirst.mockResolvedValue({ id: "s_1", sections: {} });

    await saveProfile(input({ tradeType: "jardinier" }));

    expect(profileSet).toHaveBeenCalledWith(
      expect.objectContaining({ tradeType: "jardinier" })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/settings");
    expect(revalidatePublicSite).toHaveBeenCalledWith("t_1");
  });
});
