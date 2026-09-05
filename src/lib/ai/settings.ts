/**
 * src/lib/ai/settings.ts
 * The platform Anthropic API key — stored encrypted in `app_settings` and
 * managed from the admin console. Falls back to ANTHROPIC_API_KEY (env) when
 * nothing is stored. Short in-process cache to avoid a DB hit per request.
 */

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { appSettings } from "@/db/schema";
import { encryptSecret, decryptSecret } from "@/lib/crypto";

const KEY = "anthropic_api_key";
const TTL_MS = 60_000;

let cache: { value: string | null; at: number } | null = null;

export async function getAnthropicApiKey(): Promise<string | null> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;

  let value: string | null = null;
  try {
    const row = await db.query.appSettings.findFirst({
      where: eq(appSettings.key, KEY),
    });
    if (row?.value) value = decryptSecret(row.value);
  } catch {
    value = null;
  }
  if (!value) value = process.env.ANTHROPIC_API_KEY || null;

  cache = { value, at: Date.now() };
  return value;
}

export async function setAnthropicApiKey(plain: string): Promise<void> {
  const encrypted = encryptSecret(plain.trim());
  await db
    .insert(appSettings)
    .values({ key: KEY, value: encrypted, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value: encrypted, updatedAt: new Date() },
    });
  cache = null;
}

export async function clearAnthropicApiKey(): Promise<void> {
  await db.delete(appSettings).where(eq(appSettings.key, KEY));
  cache = null;
}

/** For the admin UI: is a key set, and where does it come from? */
export async function anthropicKeyStatus(): Promise<{
  source: "stored" | "env" | "none";
  hint: string | null;
}> {
  try {
    const row = await db.query.appSettings.findFirst({
      where: eq(appSettings.key, KEY),
      columns: { value: true, updatedAt: true },
    });
    if (row?.value) {
      const plain = decryptSecret(row.value);
      return { source: "stored", hint: plain.slice(-4) };
    }
  } catch {
    /* fall through */
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return { source: "env", hint: process.env.ANTHROPIC_API_KEY.slice(-4) };
  }
  return { source: "none", hint: null };
}
