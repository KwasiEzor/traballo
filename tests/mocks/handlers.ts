// tests/mocks/handlers.ts
import { http, HttpResponse } from "msw";

/**
 * Handlers MSW — mock des APIs externes
 * Ces handlers interceptent tous les appels réseau en test
 * pour éviter de vraies requêtes vers Stripe, Resend, Anthropic...
 */
export const handlers = [

  // ─── Stripe ──────────────────────────────────────────────────────────────
  http.post("https://api.stripe.com/v1/customers", () => {
    return HttpResponse.json({
      id: "cus_test_mock_123",
      email: "artisan@test.be",
      name: "Jean Test",
    });
  }),

  http.post("https://api.stripe.com/v1/subscriptions", () => {
    return HttpResponse.json({
      id: "sub_test_mock_123",
      status: "active",
      items: { data: [{ price: { id: "price_pro_monthly" } }] },
    });
  }),

  http.post("https://api.stripe.com/v1/billing_portal/sessions", () => {
    return HttpResponse.json({
      id: "bps_test_123",
      url: "https://billing.stripe.com/session/test",
    });
  }),

  // ─── Resend (emails) ─────────────────────────────────────────────────────
  http.post("https://api.resend.com/emails", () => {
    return HttpResponse.json({
      id: "email_test_mock_123",
    });
  }),

  // ─── Anthropic (AI agent) ────────────────────────────────────────────────
  http.post("https://api.anthropic.com/v1/messages", () => {
    return HttpResponse.json({
      id: "msg_test_mock_123",
      type: "message",
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Bonjour ! Je suis l'assistant de Jean Plombier. Comment puis-je vous aider ?",
        },
      ],
      model: "claude-sonnet-4-6",
      stop_reason: "end_turn",
      usage: { input_tokens: 50, output_tokens: 25 },
    });
  }),

  // ─── Supabase Storage ────────────────────────────────────────────────────
  http.post("https://*.supabase.co/storage/v1/object/*", () => {
    return HttpResponse.json({
      Key: "logos/tenant_test/logo.png",
      ETag: "test-etag",
    });
  }),

  // ─── VIES (validation TVA européenne) ───────────────────────────────────
  http.get("https://ec.europa.eu/taxation_customs/vies/*", () => {
    return HttpResponse.json({
      isValid: true,
      name: "DUPONT JEAN PLOMBIER",
      address: "RUE DU TEST 1, 1000 BRUXELLES",
    });
  }),
];

/**
 * Handlers d'erreur — à utiliser dans les tests spécifiques
 * avec server.use(errorHandlers.stripeError)
 */
export const errorHandlers = {
  stripeError: http.post("https://api.stripe.com/v1/*", () => {
    return HttpResponse.json(
      { error: { type: "card_error", message: "Your card was declined." } },
      { status: 402 }
    );
  }),

  resendError: http.post("https://api.resend.com/emails", () => {
    return HttpResponse.json(
      { statusCode: 422, message: "Invalid email address" },
      { status: 422 }
    );
  }),

  anthropicError: http.post("https://api.anthropic.com/v1/messages", () => {
    return HttpResponse.json(
      { error: { type: "overloaded_error", message: "API temporarily overloaded" } },
      { status: 529 }
    );
  }),
};
