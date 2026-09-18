import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { updateTenantSlug } from "@/app/dashboard/site/actions";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { db } from "@/lib/db";

vi.mock("@/lib/auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/db/tenant", () => ({ withTenant: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: { query: { tenants: { findFirst: vi.fn() } } },
}));

const updateWhere = vi.fn().mockResolvedValue(undefined);
const updateSet = vi.fn(() => ({ where: updateWhere }));
const txUpdate = vi.fn(() => ({ set: updateSet }));
const txFindFirst = vi.fn();

function form(slug: string) {
  const fd = new FormData();
  fd.set("slug", slug);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  updateWhere.mockResolvedValue(undefined);
  vi.mocked(requireAuth).mockResolvedValue({
    tenantId: "t_1",
    userId: "u_1",
    email: "artisan@example.com",
    plan: "pro",
    role: "owner",
    status: "active",
  });
  txFindFirst.mockResolvedValue({ slug: "enosch-ezor" });
  vi.mocked(withTenant).mockImplementation(async (_tenantId, callback) =>
    callback({ query: { tenants: { findFirst: txFindFirst } }, update: txUpdate } as any)
  );
  vi.mocked(db.query.tenants.findFirst).mockResolvedValue(undefined as any);
});

describe("updateTenantSlug", () => {
  it("updates the slug and revalidates old + new public site paths", async () => {
    const res = await updateTenantSlug({}, form("greendan"));
    expect(res).toEqual({ ok: true, slug: "greendan" });
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "greendan" })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/site");
    expect(revalidatePath).toHaveBeenCalledWith("/sites/enosch-ezor");
    expect(revalidatePath).toHaveBeenCalledWith("/sites/greendan");
  });

  it("lowercases and trims the input", async () => {
    const res = await updateTenantSlug({}, form("  GreenDan  "));
    expect(res).toEqual({ ok: true, slug: "greendan" });
  });

  it("is a no-op when the slug is unchanged", async () => {
    const res = await updateTenantSlug({}, form("enosch-ezor"));
    expect(res).toEqual({ ok: true, slug: "enosch-ezor" });
    expect(updateSet).not.toHaveBeenCalled();
  });

  it("rejects an invalid slug format without touching the DB", async () => {
    const res = await updateTenantSlug({}, form("Green Dan!"));
    expect(res.error).toBeTruthy();
    expect(withTenant).not.toHaveBeenCalled();
  });

  it("rejects a slug that's too short", async () => {
    const res = await updateTenantSlug({}, form("ab"));
    expect(res.error).toBeTruthy();
  });

  it("rejects a reserved slug", async () => {
    const res = await updateTenantSlug({}, form("admin"));
    expect(res).toEqual({ error: "Cette adresse est réservée." });
    expect(withTenant).not.toHaveBeenCalled();
  });

  it("rejects a slug already taken by another tenant", async () => {
    vi.mocked(db.query.tenants.findFirst).mockResolvedValue({ id: "t_2" } as any);
    const res = await updateTenantSlug({}, form("greendan"));
    expect(res).toEqual({ error: "Cette adresse est déjà utilisée." });
    expect(updateSet).not.toHaveBeenCalled();
  });

  it("returns a friendly error on a race-condition unique violation", async () => {
    const err = Object.assign(new Error("duplicate key value"), { code: "23505" });
    updateWhere.mockRejectedValueOnce(err);
    const res = await updateTenantSlug({}, form("greendan"));
    expect(res).toEqual({ error: "Cette adresse est déjà utilisée." });
  });

  it("returns a generic error (not the misleading 'already taken' one) on any other write failure", async () => {
    updateWhere.mockRejectedValueOnce(new Error("connection reset"));
    const res = await updateTenantSlug({}, form("greendan"));
    expect(res).toEqual({ error: "L'enregistrement a échoué. Réessayez." });
  });
});
