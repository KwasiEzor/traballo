/**
 * scripts/stripe-provision.ts
 * Idempotent Stripe setup for Traballo billing — products, prices, billing
 * portal configuration and the webhook endpoint. Run once per environment
 * (test now, live later). Safe to re-run: everything is find-or-create.
 *
 * Run: npx tsx --env-file=.env.local scripts/stripe-provision.ts
 *
 * Prints the price IDs and the webhook signing secret to add to the env.
 */
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "traballo.pro";
// The webhook endpoint must be publicly reachable — always the deployed app,
// never a localhost NEXT_PUBLIC_APP_URL. Override with STRIPE_WEBHOOK_URL if needed.
const WEBHOOK_URL =
  process.env.STRIPE_WEBHOOK_URL || `https://app.${ROOT}/api/webhooks/stripe`;

type PlanId = "pro" | "business";
type Interval = "month" | "year";

const CATALOG: Record<
  PlanId,
  { name: string; description: string; amounts: Record<Interval, number> }
> = {
  pro: {
    name: "Traballo Pro",
    description:
      "Site web, facturation Factur-X / PEPPOL, rendez-vous en ligne, domaine personnalisé, site sans marque.",
    amounts: { month: 2900, year: 28800 },
  },
  business: {
    name: "Traballo Business",
    description:
      "Tout Pro, plus l'agent IA sur le site, WhatsApp Business, rappels SMS, analytics et inbox unifiée.",
    amounts: { month: 4900, year: 46800 },
  },
};

async function findOrCreateProduct(plan: PlanId) {
  const c = CATALOG[plan];
  const existing = (await stripe.products.list({ limit: 100, active: true })).data.find(
    (p) => p.metadata?.traballo_plan === plan
  );
  if (existing) {
    if (existing.name !== c.name || existing.description !== c.description) {
      await stripe.products.update(existing.id, {
        name: c.name,
        description: c.description,
      });
    }
    return existing.id;
  }
  const created = await stripe.products.create({
    name: c.name,
    description: c.description,
    metadata: { traballo_plan: plan },
  });
  return created.id;
}

async function findOrCreatePrice(productId: string, plan: PlanId, interval: Interval) {
  const amount = CATALOG[plan].amounts[interval];
  const prices = await stripe.prices.list({ product: productId, limit: 100, active: true });
  const match = prices.data.find(
    (p) =>
      p.recurring?.interval === interval &&
      p.unit_amount === amount &&
      p.currency === "eur" &&
      p.metadata?.traballo_plan === plan
  );
  if (match) return match.id;

  // Deactivate any stale traballo price for this plan+interval before creating.
  for (const p of prices.data) {
    if (
      p.metadata?.traballo_plan === plan &&
      p.recurring?.interval === interval &&
      p.unit_amount !== amount
    ) {
      await stripe.prices.update(p.id, { active: false });
    }
  }
  const created = await stripe.prices.create({
    product: productId,
    currency: "eur",
    unit_amount: amount,
    recurring: { interval },
    metadata: { traballo_plan: plan, traballo_interval: interval },
  });
  return created.id;
}

async function ensurePortal(priceIds: string[]) {
  const priceObjs = await Promise.all(priceIds.map((id) => stripe.prices.retrieve(id)));
  const byProduct = new Map<string, string[]>();
  for (const p of priceObjs) {
    const prod = p.product as string;
    byProduct.set(prod, [...(byProduct.get(prod) ?? []), p.id]);
  }

  const params: Stripe.BillingPortal.ConfigurationCreateParams = {
    business_profile: { headline: "Gérez votre abonnement Traballo" },
    features: {
      payment_method_update: { enabled: true },
      customer_update: {
        enabled: true,
        allowed_updates: ["email", "address", "tax_id", "name"],
      },
      invoice_history: { enabled: true },
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
        cancellation_reason: {
          enabled: true,
          options: [
            "too_expensive",
            "missing_features",
            "switched_service",
            "unused",
            "other",
          ],
        },
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"],
        proration_behavior: "create_prorations",
        products: [...byProduct.entries()].map(([product, prices]) => ({
          product,
          prices,
        })),
      },
    },
    metadata: { traballo: "1" },
  };

  const configs = await stripe.billingPortal.configurations.list({ limit: 20 });
  const mine = configs.data.find((c) => c.metadata?.traballo === "1");
  if (mine) {
    await stripe.billingPortal.configurations.update(mine.id, params);
    return mine.id;
  }
  const created = await stripe.billingPortal.configurations.create(params);
  return created.id;
}

async function ensureWebhook() {
  const url = WEBHOOK_URL;
  const events: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.paid",
    "invoice.payment_failed",
  ];
  const list = await stripe.webhookEndpoints.list({ limit: 100 });
  const existing = list.data.find((w) => w.url === url);
  if (existing) {
    await stripe.webhookEndpoints.update(existing.id, { enabled_events: events });
    return { id: existing.id, secret: null as string | null, url };
  }
  const created = await stripe.webhookEndpoints.create({
    url,
    enabled_events: events,
    description: "Traballo billing",
  });
  return { id: created.id, secret: created.secret ?? null, url };
}

async function main() {
  const mode = process.env.STRIPE_SECRET_KEY!.startsWith("sk_live_") ? "LIVE" : "TEST";
  console.log(`\n== Stripe provisioning (${mode}) ==\n`);

  const out: Record<string, string> = {};
  for (const plan of ["pro", "business"] as PlanId[]) {
    const productId = await findOrCreateProduct(plan);
    for (const interval of ["month", "year"] as Interval[]) {
      const priceId = await findOrCreatePrice(productId, plan, interval);
      out[`STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}`] = priceId;
    }
  }

  const portalId = await ensurePortal(Object.values(out));
  const wh = await ensureWebhook();

  console.log("Prix :");
  for (const [k, v] of Object.entries(out)) console.log(`  ${k}=${v}`);
  console.log(`\nPortail client : ${portalId}`);
  console.log(`Webhook : ${wh.id}  →  ${wh.url}`);
  if (wh.secret) {
    console.log(`  STRIPE_WEBHOOK_SECRET=${wh.secret}`);
  } else {
    console.log(
      "  (endpoint déjà existant — récupère le secret dans le dashboard Stripe → Webhooks, ou supprime l'endpoint et relance)"
    );
  }
  console.log(
    "\nAjoute ces variables à .env.local puis à Vercel (scripts/vercel-env-sync.sh les inclut déjà).\n"
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
