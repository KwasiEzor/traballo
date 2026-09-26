import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { toast } from "sonner";
import { AppointmentNoticeToast } from "@/app/dashboard/appointments/appointment-notice-toast";

vi.mock("sonner", () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));

beforeEach(() => vi.clearAllMocks());

describe("AppointmentNoticeToast", () => {
  it.each([
    ["sent", "success", "Rendez-vous confirmé — client prévenu par e-mail."],
    ["failed", "error", "Rendez-vous créé, mais la confirmation n'a pas pu partir."],
  ] as const)("reports %s", (status, level, message) => {
    render(<AppointmentNoticeToast status={status} />);
    expect(toast[level]).toHaveBeenCalledWith(message);
  });

  it("explains a client without e-mail", () => {
    render(<AppointmentNoticeToast status="skipped" />);
    expect(toast).toHaveBeenCalledWith(
      "Rendez-vous confirmé. Le client n'a pas d'e-mail : aucune confirmation envoyée."
    );
  });

  it("stays quiet without status", () => {
    render(<AppointmentNoticeToast />);
    expect(toast).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
