/**
 * Notification catalogue. Every in-app / email / push notification the
 * product can emit is declared here once, with its category, the plan a
 * tenant needs to receive it, and the channels that are on by default.
 *
 * `channels` here is the *default* — per-user preferences (Phase 1b,
 * `prefs.ts`) can narrow it. Transactional types stay on for everyone
 * regardless of plan.
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

/** Categories the artisan can tune in Settings → Notifications. */
export const CONFIGURABLE_CATEGORIES = [
  "leads",
  "invoices",
  "appointments",
] as const;

export type ConfigurableCategory = (typeof CONFIGURABLE_CATEGORIES)[number];

/** Channels exposed in the preferences screen (push arrives in Phase 5). */
export const CONFIGURABLE_CHANNELS = ["in_app", "email"] as const;

export type ConfigurableChannel = (typeof CONFIGURABLE_CHANNELS)[number];

export function isConfigurableCategory(
  category: string
): category is ConfigurableCategory {
  return (CONFIGURABLE_CATEGORIES as readonly string[]).includes(category);
}

export type PlanGate = "free" | "pro" | "business";

export type NotificationMeta = {
  category: NotificationCategory;
  /** Minimum tenant plan to receive this. "free" = everyone. */
  minPlan: PlanGate;
  /** Channels enabled unless the recipient opted out. */
  channels: readonly NotificationChannel[];
  /** Transactional types cannot be disabled and ignore the plan gate. */
  transactional?: boolean;
  /** Channels the recipient cannot turn off (product decision, not legal). */
  alwaysOn?: readonly NotificationChannel[];
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
  // A missed enquiry is a lost client: the lead email cannot be turned off.
  "leads.site_enquiry": {
    category: "leads",
    minPlan: "free",
    channels: ["in_app", "email", "push"],
    alwaysOn: ["email"],
  },
  "leads.ai_lead": {
    category: "leads",
    minPlan: "free",
    channels: ["in_app", "email", "push"],
    alwaysOn: ["email"],
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
 * kept so the feed stays complete, and so are `alwaysOn` channels.
 */
export function resolveChannels(
  type: NotificationType,
  disabled: NotificationChannel[] = []
): NotificationChannel[] {
  const meta = notificationMeta(type);
  const off = new Set(disabled);
  return meta.channels.filter((c) => {
    if (c === "in_app" && meta.transactional) return true;
    if (meta.alwaysOn?.includes(c)) return true;
    return !off.has(c);
  });
}

/**
 * Channels worth showing for a category in the preferences screen: those at
 * least one type of the category delivers on this plan. A channel is
 * `locked` when every such type keeps it `alwaysOn`.
 */
export function categoryChannels(
  category: ConfigurableCategory,
  plan: PlanGate
): { channel: ConfigurableChannel; locked: boolean }[] {
  const metas = (Object.keys(NOTIFICATION_TYPES) as NotificationType[])
    .filter((t) => planAllows(t, plan))
    .map(notificationMeta)
    .filter((m) => m.category === category);

  return CONFIGURABLE_CHANNELS.flatMap((channel) => {
    const using = metas.filter((m) => m.channels.includes(channel));
    if (using.length === 0) return [];
    const locked = using.every((m) => m.alwaysOn?.includes(channel));
    return [{ channel, locked }];
  });
}
