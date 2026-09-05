import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropic } from "@/lib/ai/anthropic";
import {
  MARKETING_AGENT_MODEL,
  MARKETING_AGENT_MAX_TOKENS,
  buildMarketingSystemPrompt,
} from "@/lib/ai/marketing-agent";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      })
    )
    .min(1)
    .max(20),
});

// Best-effort in-process rate limit (per warm instance).
const hits = new Map<string, { n: number; reset: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now > e.reset) {
    hits.set(ip, { n: 1, reset: now + 60_000 });
    return false;
  }
  e.n += 1;
  return e.n > 20;
}

export async function POST(request: Request): Promise<Response> {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const { messages } = parsed.data;
  if (messages[messages.length - 1]!.role !== "user") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Trop de messages, patientez une minute." },
      { status: 429 }
    );
  }

  const anthropic = await getAnthropic();
  if (!anthropic) {
    return NextResponse.json(
      {
        error:
          "L'assistant est momentanément indisponible. Écrivez-nous via la page Contact.",
      },
      { status: 503 }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const run = anthropic.messages.stream({
          model: MARKETING_AGENT_MODEL,
          max_tokens: MARKETING_AGENT_MAX_TOKENS,
          system: buildMarketingSystemPrompt(),
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });
        for await (const event of run) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        console.error("[api/marketing-chat] stream error:", err);
        controller.enqueue(
          encoder.encode(
            "Désolé, un problème technique m'empêche de répondre. Vous pouvez nous écrire via la page Contact."
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
