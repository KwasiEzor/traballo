import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicApiKey } from "@/lib/ai/settings";

let cached: { key: string; client: Anthropic } | null = null;

/**
 * Anthropic client using the platform key — the admin-managed value in
 * `app_settings` if present, otherwise ANTHROPIC_API_KEY (env). Returns null
 * when neither is configured.
 */
export async function getAnthropic(): Promise<Anthropic | null> {
  const key = await getAnthropicApiKey();
  if (!key) return null;
  if (cached?.key !== key) {
    cached = { key, client: new Anthropic({ apiKey: key }) };
  }
  return cached.client;
}
