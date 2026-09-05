import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

/** Lazy Anthropic client — avoids throwing at build time when the key is absent. */
export function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}
