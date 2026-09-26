import { describe, expect, it } from "vitest";
import {
  CONFIGURABLE_CATEGORIES,
  NOTIFICATION_TYPES,
  categoryChannels,
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
    expect(resolveChannels("appointments.reminder", ["email", "push"])).toEqual([
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

describe("alwaysOn channels", () => {
  it("keeps a locked channel even when the recipient disabled it", () => {
    expect(
      resolveChannels("leads.site_enquiry", ["in_app", "email", "push"])
    ).toEqual(["email"]);
    expect(resolveChannels("leads.ai_lead", ["email"])).toEqual([
      "in_app",
      "email",
      "push",
    ]);
  });
});

describe("categoryChannels", () => {
  it("locks the lead email: a missed enquiry is a lost client", () => {
    expect(categoryChannels("leads", "free")).toEqual([
      { channel: "in_app", locked: false },
      { channel: "email", locked: true },
    ]);
  });

  it("only offers the channels the plan can actually receive", () => {
    expect(categoryChannels("invoices", "free")).toEqual([
      { channel: "in_app", locked: false },
    ]);
    expect(categoryChannels("invoices", "pro")).toEqual([
      { channel: "in_app", locked: false },
      { channel: "email", locked: false },
    ]);
    expect(categoryChannels("appointments", "free")).toEqual([
      { channel: "in_app", locked: false },
    ]);
    expect(categoryChannels("appointments", "business")).toEqual([
      { channel: "in_app", locked: false },
      { channel: "email", locked: false },
    ]);
  });

  it("covers exactly the user-configurable categories", () => {
    expect(CONFIGURABLE_CATEGORIES).toEqual([
      "leads",
      "invoices",
      "appointments",
    ]);
  });
});
