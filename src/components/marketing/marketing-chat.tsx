"use client";

import * as React from "react";
import { MessageSquare, X, Send, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Msg = { role: "user" | "assistant"; content: string };

const OPENING =
  "Bonjour ! Je réponds à vos questions sur Traballo — fonctionnalités, tarifs, facturation électronique, mise en route. Que puis-je vous expliquer ?";

const SUGGESTIONS = [
  "Que fait Traballo exactement ?",
  "Combien ça coûte ?",
  "C'est conforme à la facture électronique 2026 ?",
];

export function MarketingChat() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [leadView, setLeadView] = React.useState(false);
  const [leadSent, setLeadSent] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      if (!leadView) inputRef.current?.focus();
    }
  }, [open, messages, streaming, leadView]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const userTurns = messages.filter((m) => m.role === "user").length;

  async function send(text: string) {
    const value = text.trim();
    if (!value || streaming) return;
    setInput("");
    setNotice(null);

    const next: Msg[] = [
      ...messages,
      { role: "user", content: value },
      { role: "assistant", content: "" },
    ];
    setMessages(next);
    setStreaming(true);

    try {
      const res = await fetch("/api/marketing-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next
            .filter((m) => m.content)
            .slice(-20)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setMessages((m) => m.slice(0, -1));
        setNotice(data.error ?? "L'assistant est indisponible pour le moment.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        const piece = decoder.decode(chunk, { stream: true });
        setMessages((m) => {
          const copy = m.slice();
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            copy[copy.length - 1] = {
              role: "assistant",
              content: last.content + piece,
            };
          }
          return copy;
        });
      }
    } catch {
      setMessages((m) =>
        m[m.length - 1]?.role === "assistant" && !m[m.length - 1]!.content
          ? m.slice(0, -1)
          : m
      );
      setNotice("La connexion a échoué. Réessayez.");
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer l'assistant" : "Poser une question à l'assistant"}
        className="fixed bottom-5 right-5 z-50 flex size-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        style={{ width: "3.25rem", height: "3.25rem" }}
      >
        {open ? <X className="size-5" /> : <MessageSquare className="size-5" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Assistant Traballo"
          className="fixed bottom-24 right-5 z-50 flex h-[min(34rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          <div className="flex items-center gap-2.5 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <Sparkles className="size-4" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Assistant Traballo</p>
              <p className="text-xs text-primary-foreground/80">
                {streaming ? "écrit…" : "Répond à vos questions produit"}
              </p>
            </div>
          </div>

          {leadView ? (
            <LeadForm
              messages={messages}
              done={leadSent}
              onBack={() => setLeadView(false)}
              onDone={() => {
                setLeadSent(true);
                setLeadView(false);
              }}
            />
          ) : (
            <>
              <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
              >
                <Bubble role="assistant">{OPENING}</Bubble>

                {messages.length === 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map((m, i) => (
                  <Bubble key={i} role={m.role}>
                    {m.content ||
                      (streaming && i === messages.length - 1 ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        ""
                      ))}
                  </Bubble>
                ))}

                {notice && (
                  <p className="rounded-lg bg-warning-subtle px-3 py-2 text-xs text-warning-foreground">
                    {notice}
                  </p>
                )}
              </div>

              {userTurns >= 1 && !leadSent && (
                <button
                  type="button"
                  onClick={() => setLeadView(true)}
                  className="mx-4 mb-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                >
                  Être recontacté par l&apos;équipe Traballo
                </button>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-end gap-2 border-t border-border p-3"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Votre question…"
                  maxLength={2000}
                  disabled={streaming}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring disabled:opacity-60"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="size-9 shrink-0"
                  disabled={streaming || !input.trim()}
                  aria-label="Envoyer"
                >
                  {streaming ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}

function Bubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {children}
      </div>
    </div>
  );
}

function LeadForm({
  messages,
  done,
  onBack,
  onDone,
}: {
  messages: Msg[];
  done: boolean;
  onBack: () => void;
  onDone: () => void;
}) {
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  if (done) {
    return (
      <div className="flex-1 px-4 py-8 text-center text-sm text-muted-foreground">
        Merci ! L&apos;équipe Traballo vous écrit très vite.
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const transcript = messages
        .filter((m) => m.content)
        .slice(-8)
        .map((m) => `${m.role === "user" ? "Visiteur" : "Assistant"} : ${m.content}`)
        .join("\n");
      const res = await fetch("/api/marketing-chat/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, note, transcript }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Échec de l'envoi.");
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Échec de l'envoi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      <button
        type="button"
        onClick={onBack}
        className="text-xs font-medium text-primary hover:underline"
      >
        ← Retour à la discussion
      </button>
      <p className="text-sm text-muted-foreground">
        Laissez votre e-mail, l&apos;équipe Traballo vous recontacte.
      </p>
      {err && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {err}
        </p>
      )}
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre e-mail *"
        required
      />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Votre nom (facultatif)"
        maxLength={120}
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Un mot sur votre besoin (facultatif)"
        rows={3}
        maxLength={2000}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
      />
      <Button type="submit" className="w-full" disabled={busy || !email.trim()}>
        {busy ? "Envoi…" : "Envoyer"}
      </Button>
    </form>
  );
}
