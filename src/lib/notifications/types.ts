/**
 * Notification catalogue. Every in-app / email / push notification the
 * product can emit is declared here once, with its category, the plan a
 * tenant needs to receive it, and the channels that are on by default.
 *
 * `channels` here is the *default* — per-user preferences (Phase 1) can
 * narrow it. Transactional types stay on for everyone regardless of plan.
 */

export const NOTIFICATION_CATEGORIES = [
  "account", // auth, profile, security
  "billing", // Traballo subscription
  "invoices", // artisan's own invoices → their clients
  "appointments", // artisan's rendez-vous
  "leads", // site + AI agent enquiries
  "operator", // super-admin / platform
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export type NotificationChannel = "in_app" | "email" | "push" | "sms";

export type PlanGate = "free" | "pro" | "business";

export type NotificationMeta = {
  category: NotificationCategory;
  /** Minimum tenant plan to receive this. "free" = everyone. */
  minPlan: PlanGate;
  /** Channels enabled unless the recipient opted out. */
  channels: readonly NotificationChannel[];
  /** Transactional types cannot be disabled and ignore the plan gate. */
  transactional?: boolean;
  /** Low-priority types that a daily digest may batch instead of sending now. */
  digestable?: boolean;
};

export const NOTIFICATION_TYPES = {
  // ── account ──────────────────────────────────────────────────────────
  "account.welcome": {
    category: "account",
    minPlan: "free",
    channels: ["email"],
    transactional: true,
  },

  // ── billing (Traballo → artisan) ─────────────────────────────────────
  "billing.subscription_started": {
    category: "billing",
    minPlan: "free",
    channels: ["in_app", "email"],
    transactional: true,
  },
  "billing.subscription_changed": {
    category: "billing",
    minPlan: "free",
    channels: ["in_app", "email"],
    transactional: true,
  },
  "billing.subscription_canceled": {
    category: "billing",
    minPlan: "free",
    channels: ["in_app", "email"],
    transactional: true,
  },
  "billing.payment_failed": {
    category: "billing",
    minPlan: "free",
    channels: ["in_app", "email"],
    transactional: true,
  },
  "billing.quota_warning": {
    category: "billing",
    minPlan: "pro",
    channels: ["in_app", "email"],
  },

  // ── invoices (artisan → their clients; artisan gets the in-app copy) ──
  "invoices.reminder_sent": {
    category: "invoices",
    minPlan: "pro",
    channels: ["in_app"],
  },
  "invoices.overdue": {
    category: "invoices",
    minPlan: "pro",
    channels: ["in_app", "email"],
  },
  "invoices.paid": {
    category: "invoices",
    minPlan: "free",
    channels: ["in_app"],
  },

  // ── appointments ────────────────────────────────────────────────────
  "appointments.created": {
    category: "appointments",
    minPlan: "free",
    channels: ["in_app", "push"],
  },
  "appointments.reminder": {
    category: "appointments",
    minPlan: "pro",
    channels: ["in_app", "push", "email"],
  },
  "appointments.cancelled": {
    category: "appointments",
    minPlan: "free",
    channels: ["in_app", "push"],
  },

  // ── leads ───────────────────────────────────────────────────────────
  "leads.site_enquiry": {
    category: "leads",
    minPlan: "free",
    channels: ["in_app", "email", "push"],
  },
  "leads.ai_lead": {
    category: "leads",
    minPlan: "free",
    channels: ["in_app", "email", "push"],
  },
  "leads.ai_conversation": {
    category: "leads",
    minPlan: "business",
    channels: ["in_app", "push"],
    digestable: true,
  },

  // ── operator (platform) ─────────────────────────────────────────────
  "operator.signup": {
    category: "operator",
    minPlan: "free",
    channels: ["in_app"],
  },
  "operator.subscription": {
    category: "operator",
    minPlan: "free",
    channels: ["in_app"],
  },
  "operator.churn": {
    category: "operator",
    minPlan: "free",
    channels: ["in_app", "email"],
  },
} as const satisfies Record<string, NotificationMeta>;

export type NotificationType = keyof typeof NOTIFICATION_TYPES;

export function notificationMeta(type: NotificationType): NotificationMeta {
  return NOTIFICATION_TYPES[type] as NotificationMeta;
}

const PLAN_RANK: Record<PlanGate, number> = { free: 0, pro: 1, business: 2 };

/** Does a tenant on `plan` receive notifications of this `type`? */
export function planAllows(type: NotificationType, plan: PlanGate): boolean {
  const meta = notificationMeta(type);
  if (meta.transactional) return true;
  return PLAN_RANK[plan] >= PLAN_RANK[meta.minPlan];
}

/**
 * Channels to actually use for a delivery: the type's defaults, minus any
 * the recipient turned off. `in_app` for a transactional type is always
 * kept so the feed stays complete.
 */
export function resolveChannels(
  type: NotificationType,
  disabled: NotificationChannel[] = []
): NotificationChannel[] {
  const meta = notificationMeta(type);
  const off = new Set(disabled);
  return meta.channels.filter((c) => {
    if (c === "in_app" && meta.transactional) return true;
    return !off.has(c);
  });
}
