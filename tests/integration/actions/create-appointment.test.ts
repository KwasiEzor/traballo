import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAppointment } from "@/app/dashboard/appointments/actions/create-appointment";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { sendEmail } from "@/lib/email/send";

vi.mock("@/lib/auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/db/tenant", () => ({ withTenant: vi.fn() }));
vi.mock("@/lib/email/send", () => ({ sendEmail: vi.fn() }));

const insertValues = vi.fn().mockResolvedValue(undefined);
const txInsert = vi.fn(() => ({ values: insertValues }));
const clientsFindFirst = vi.fn();
const profilesFindFirst = vi.fn();

const validInput = {
  clientId: "550e8400-e29b-41d4-a716-446655440000",
  title: "Diagnostic chauffage",
  startDate: "2026-04-20",
  startTime: "09:00",
  endTime: "10:00",
  notes: "",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAuth).mockResolvedValue({
    tenantId: "t_1",
    userId: "u_1",
    email: "artisan@example.com",
    plan: "pro",
    role: "owner",
    status: "active",
  });
  clientsFindFirst.mockResolvedValue({ id: validInput.clientId, name: "Cabinet Léon", email: "leon@example.com" });
  profilesFindFirst.mockResolvedValue({ businessName: "Menuiserie Bois & Cie", email: "artisan@example.com" });
  vi.mocked(withTenant).mockImplementation(async (_tenantId, callback) =>
    callback({
      insert: txInsert,
      query: {
        clients: { findFirst: clientsFindFirst },
        artisanProfiles: { findFirst: profilesFindFirst },
      },
    } as any)
  );
  vi.mocked(sendEmail).mockResolvedValue({ success: true } as any);
});

describe("createAppointment", () => {
  it("creates the appointment and e-mails a confirmation to the client", async () => {
    await createAppointment(validInput);

    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: "t_1", title: "Diagnostic chauffage", status: "pending" })
    );
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "leon@example.com", replyTo: "artisan@example.com" })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/appointments");
    expect(redirect).toHaveBeenCalledWith("/dashboard/appointments");
  });

  it("skips the confirmation e-mail without a client", async () => {
    await createAppointment({ ...validInput, clientId: "" });
    expect(sendEmail).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/dashboard/appointments");
  });

  it("skips the confirmation e-mail when the client has none", async () => {
    clientsFindFirst.mockResolvedValue({ id: validInput.clientId, name: "X", email: null });
    await createAppointment(validInput);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("still redirects when the confirmation e-mail fails", async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error("Resend down"));
    await createAppointment(validInput);
    expect(redirect).toHaveBeenCalledWith("/dashboard/appointments");
  });

  it("rejects an end time before the start time without touching the DB", async () => {
    const res = await createAppointment({ ...validInput, startTime: "10:00", endTime: "09:00" });
    expect(res).toEqual({ error: "L'heure de fin doit être après l'heure de début" });
    expect(withTenant).not.toHaveBeenCalled();
  });
});
