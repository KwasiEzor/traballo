import { describe, expect, it } from "vitest";
import {
  NOTIFICATION_TYPES,
  notificationMeta,
  planAllows,
  resolveChannels,
} from "@/lib/notifications/types";

describe("notification catalogue", () => {
  it("every type has a known category and a channel list", () => {
    for (const [type, meta] of Object.entries(NOTIFICATION_TYPES)) {
      expect(meta.channels.length, type).toBeGreaterThan(0);
      expect(meta.minPlan, type).toMatch(/^(free|pro|business)$/);
    }
  });
});

describe("planAllows", () => {
  it("lets transactional types through on any plan", () => {
    expect(planAllows("billing.payment_failed", "free")).toBe(true);
    expect(planAllows("account.welcome", "free")).toBe(true);
  });

  it("gates pro-only types below pro", () => {
    expect(planAllows("invoices.overdue", "free")).toBe(false);
    expect(planAllows("invoices.overdue", "pro")).toBe(true);
    expect(planAllows("invoices.overdue", "business")).toBe(true);
  });

  it("gates business-only types below business", () => {
    expect(planAllows("leads.ai_conversation", "pro")).toBe(false);
    expect(planAllows("leads.ai_conversation", "business")).toBe(true);
  });
});

describe("resolveChannels", () => {
  it("returns the defaults when nothing is disabled", () => {
    expect(resolveChannels("leads.site_enquiry")).toEqual([
      "in_app",
      "email",
      "push",
    ]);
  });

  it("drops channels the recipient turned off", () => {
    expect(resolveChannels("leads.site_enquiry", ["email", "push"])).toEqual([
      "in_app",
    ]);
  });

  it("keeps in_app for a transactional type even if disabled", () => {
    expect(
      resolveChannels("billing.payment_failed", ["in_app", "email"])
    ).toEqual(["in_app"]);
  });

  it("notificationMeta round-trips", () => {
    expect(notificationMeta("appointments.reminder").category).toBe(
      "appointments"
    );
  });
});
