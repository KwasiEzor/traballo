import { and, count, eq, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { aiConversations, aiMessages } from "@/db/schema";
import { getAnthropic } from "@/lib/ai/anthropic";
import { loadAgentContext } from "@/lib/ai/context";
import {
  AGENT_MODEL,
  AGENT_MAX_TOKENS,
  buildSystemPrompt,
  messageQuota,
} from "@/lib/ai/agent";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const bodySchema = z.object({
  slug: z.string().trim().min(1).max(120),
  visitorId: z.string().trim().min(8).max(64),
  conversationId: z.string().uuid().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      })
    )
    .min(1)
    .max(24),
});

function monthStart(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function POST(request: Request): Promise<Response> {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const { slug, visitorId, conversationId, messages } = parsed.data;

  if (messages[messages.length - 1]!.role !== "user") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const ctx = await loadAgentContext(slug);
  if (!ctx || !ctx.config.isEnabled) {
    return NextResponse.json({ disabled: true }, { status: 200 });
  }

  const anthropic = await getAnthropic();
  if (!anthropic) {
    return NextResponse.json({ disabled: true }, { status: 200 });
  }

  // Monthly quota on visitor messages.
  const quota = messageQuota(ctx.plan);
  if (quota !== null) {
    const [{ value: used } = { value: 0 }] = await db
      .select({ value: count() })
      .from(aiMessages)
      .where(
        and(
          eq(aiMessages.tenantId, ctx.tenantId),
          eq(aiMessages.role, "user"),
          gte(aiMessages.createdAt, monthStart())
        )
      );
    if (used >= quota) {
      return NextResponse.json(
        {
          quotaExceeded: true,
          message: `L'assistant est momentanément indisponible. Laissez vos coordonnées et ${ctx.site.ownerName} vous recontactera.`,
        },
        { status: 200 }
      );
    }
  }

  // Resolve the conversation (verify ownership if an id was supplied).
  let convId = conversationId ?? null;
  if (convId) {
    const existing = await db.query.aiConversations.findFirst({
      where: and(
        eq(aiConversations.id, convId),
        eq(aiConversations.tenantId, ctx.tenantId)
      ),
      columns: { id: true },
    });
    if (!existing) convId = null;
  }
  if (!convId) {
    const [row] = await db
      .insert(aiConversations)
      .values({ tenantId: ctx.tenantId, visitorId, channel: "web" })
      .returning({ id: aiConversations.id });
    convId = row!.id;
  }

  // Light anti-abuse: cap turns per conversation per minute.
  const [{ value: recent } = { value: 0 }] = await db
    .select({ value: count() })
    .from(aiMessages)
    .where(
      and(
        eq(aiMessages.conversationId, convId),
        eq(aiMessages.role, "user"),
        gte(aiMessages.createdAt, new Date(Date.now() - 60_000))
      )
    );
  if (recent > 12) {
    return NextResponse.json(
      { error: "Trop de messages. Patientez un instant." },
      { status: 429 }
    );
  }

  const userText = messages[messages.length - 1]!.content;
  await db.insert(aiMessages).values({
    tenantId: ctx.tenantId,
    conversationId: convId,
    role: "user",
    content: userText,
  });

  const system = buildSystemPrompt({
    site: ctx.site,
    config: ctx.config,
    services: ctx.services,
    area: ctx.area,
  });

  const encoder = new TextEncoder();
  const finalConvId = convId;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = "";
      try {
        const run = anthropic.messages.stream({
          model: AGENT_MODEL,
          max_tokens: AGENT_MAX_TOKENS,
          system,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const event of run) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            full += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        console.error("[api/agent] stream error:", err);
        if (!full) {
          const msg =
            "Désolé, un problème technique m'empêche de répondre. Laissez vos coordonnées, on vous rappelle.";
          full = msg;
          controller.enqueue(encoder.encode(msg));
        }
      } finally {
        controller.close();
        if (full.trim()) {
          await db
            .insert(aiMessages)
            .values({
              tenantId: ctx.tenantId,
              conversationId: finalConvId,
              role: "assistant",
              content: full.slice(0, 8000),
            })
            .catch(() => {});
          await db
            .update(aiConversations)
            .set({ updatedAt: new Date() })
            .where(eq(aiConversations.id, finalConvId))
            .catch(() => {});
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Conversation-Id": finalConvId,
    },
  });
}
