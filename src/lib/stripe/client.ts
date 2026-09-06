import Stripe from "stripe";

let client: Stripe | null = null;

/** Lazy Stripe client — null when no secret key is configured. */
export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY, {
      appInfo: { name: "Traballo", url: "https://www.traballo.pro" },
    });
  }
  return client;
}
