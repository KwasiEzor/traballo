import { getAnthropicApiKey } from "@/lib/ai/settings";
import Anthropic from "@anthropic-ai/sdk";
const key = await getAnthropicApiKey();
console.log("key suffix:", key?.slice(-6), "len:", key?.length);
const c = new Anthropic({ apiKey: key });
try {
  const r = await c.messages.create({ model: "claude-haiku-4-5-20251001", max_tokens: 40, messages: [{ role: "user", content: "dis bonjour" }] });
  console.log("OK:", r.content[0].text);
} catch (e) {
  console.log("ERR status:", e.status, "type:", e.error?.error?.type, "msg:", (e.message||"").slice(0,300));
}
