"use client";

import * as React from "react";
import { MessageSquare, X, Send, Loader2, ArrowLeft } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

type Store = {
  visitorId: string;
  conversationId?: string;
  messages: Msg[];
  leadDone?: boolean;
};

function loadStore(slug: string): Store {
  try {
    const raw = localStorage.getItem(`traballo:chat:${slug}`);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    /* ignore */
  }
  const visitorId =
    (globalThis.crypto?.randomUUID?.() ??
      `v_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  return { visitorId, messages: [] };
}

function saveStore(slug: string, store: Store) {
  try {
    localStorage.setItem(`traballo:chat:${slug}`, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

export function ChatWidget({
  slug,
  agentName,
  openingMessage,
  primaryColor,
  showBadge,
  rootDomain,
}: {
  slug: string;
  agentName: string;
  openingMessage: string;
  primaryColor: string;
  showBadge: boolean;
  rootDomain: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [store, setStore] = React.useState<Store | null>(null);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [leadView, setLeadView] = React.useState(false);
  const [leadSent, setLeadSent] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const s = loadStore(slug);
    setStore(s);
    setLeadSent(Boolean(s.leadDone));
  }, [slug]);

  React.useEffect(() => {
    if (store) saveStore(slug, store);
  }, [slug, store]);

  React.useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      if (!leadView) inputRef.current?.focus();
    }
  }, [open, store?.messages, leadView, streaming]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!store) {
    // Render just the launcher until the store hydrates.
  }

  const messages = store?.messages ?? [];
  const userTurns = messages.filter((m) => m.role === "user").length;
  const canOfferLead = userTurns >= 2 && !leadSent;

  async function send() {
    const text = input.trim();
    if (!text || streaming || !store) return;

    setInput("");
    setNotice(null);
    const next: Msg[] = [
      ...store.messages,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ];
    setStore({ ...store, messages: next });
    setStreaming(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          visitorId: store.visitorId,
          conversationId: store.conversationId,
          messages: next
            .filter((m) => m.content)
            .slice(-24)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        const data = (await res.json()) as {
          disabled?: boolean;
          quotaExceeded?: boolean;
          message?: string;
          error?: string;
        };
        setStore((s) =>
          s ? { ...s, messages: s.messages.slice(0, -1) } : s
        );
        if (data.quotaExceeded && data.message) {
          setNotice(data.message);
          setLeadView(true);
        } else {
          setNotice(data.error ?? "L'assistant est indisponible pour le moment.");
        }
        return;
      }

      const convId = res.headers.get("X-Conversation-Id");
      if (convId) {
        setStore((s) => (s ? { ...s, conversationId: convId } : s));
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setStore((s) => {
            if (!s) return s;
            const msgs = s.messages.slice();
            const last = msgs[msgs.length - 1];
            if (last?.role === "assistant") {
              msgs[msgs.length - 1] = {
                role: "assistant",
                content: last.content + chunk,
              };
            }
            return { ...s, messages: msgs };
          });
        }
      }
    } catch {
      setStore((s) => {
        if (!s) return s;
        const msgs = s.messages.slice();
        if (msgs[msgs.length - 1]?.role === "assistant" && !msgs[msgs.length - 1]!.content) {
          msgs.pop();
        }
        return { ...s, messages: msgs };
      });
      setNotice("La connexion a échoué. Réessayez.");
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant"}
        className="fixed bottom-4 right-4 z-50 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
        style={{ backgroundColor: primaryColor }}
      >
        {open ? <X className="size-6" /> : <MessageSquare className="size-6" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={`Assistant de discussion — ${agentName}`}
          className="fixed bottom-24 right-4 z-50 flex h-[min(32rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-6"
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {leadView && (
              <button
                type="button"
                onClick={() => setLeadView(false)}
                aria-label="Retour à la discussion"
                className="-ml-1 rounded p-1 hover:bg-white/15"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{agentName}</p>
              <p className="text-xs text-white/80">
                {streaming ? "écrit…" : "Répond en quelques instants"}
              </p>
            </div>
          </div>

          {leadView ? (
            <LeadForm
              slug={slug}
              conversationId={store?.conversationId}
              lastNeed={
                [...messages].reverse().find((m) => m.role === "user")?.content ??
                ""
              }
              done={leadSent}
              onDone={() => {
                setLeadSent(true);
                setStore((s) => (s ? { ...s, leadDone: true } : s));
                setLeadView(false);
                setNotice(null);
              }}
              primaryColor={primaryColor}
            />
          ) : (
            <>
              <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
              >
                <Bubble role="assistant" primaryColor={primaryColor}>
                  {openingMessage}
                </Bubble>
                {messages.map((m, i) => (
                  <Bubble key={i} role={m.role} primaryColor={primaryColor}>
                    {m.content ||
                      (streaming && i === messages.length - 1 ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        ""
                      ))}
                  </Bubble>
                ))}
                {notice && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    {notice}
                  </p>
                )}
              </div>

              {canOfferLead && (
                <button
                  type="button"
                  onClick={() => setLeadView(true)}
                  className="mx-4 mb-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Laisser mes coordonnées pour être rappelé
                </button>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-end gap-2 border-t border-slate-100 p-3"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Votre message…"
                  maxLength={2000}
                  disabled={streaming}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  aria-label="Envoyer"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white disabled:opacity-40"
                  style={{ backgroundColor: primaryColor }}
                >
                  {streaming ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </button>
              </form>
            </>
          )}

          {showBadge && (
            <a
              href={`https://${rootDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border-t border-slate-100 bg-slate-50 py-1.5 text-center text-[11px] text-slate-400 hover:text-slate-600"
            >
              Propulsé par Traballo
            </a>
          )}
        </div>
      )}
    </>
  );
}

function Bubble({
  role,
  primaryColor,
  children,
}: {
  role: "user" | "assistant";
  primaryColor: string;
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          isUser ? "text-white" : "bg-slate-100 text-slate-800"
        }`}
        style={isUser ? { backgroundColor: primaryColor } : undefined}
      >
        {children}
      </div>
    </div>
  );
}

function LeadForm({
  slug,
  conversationId,
  lastNeed,
  done,
  onDone,
  primaryColor,
}: {
  slug: string;
  conversationId?: string;
  lastNeed: string;
  done: boolean;
  onDone: () => void;
  primaryColor: string;
}) {
  const [name, setName] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  if (done) {
    return (
      <div className="flex-1 px-4 py-6 text-center text-sm text-slate-600">
        Merci, vos coordonnées ont bien été transmises. Vous serez recontacté
        rapidement.
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!conversationId) {
      setErr("Envoyez d'abord un message à l'assistant.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/agent/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          conversationId,
          name,
          contact,
          need: lastNeed.slice(0, 2000),
        }),
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
      <p className="text-sm text-slate-600">
        Laissez votre nom et un moyen de vous joindre, l&apos;artisan vous
        rappelle.
      </p>
      {err && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{err}</p>
      )}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Votre nom"
        required
        maxLength={120}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
      />
      <input
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder="Téléphone ou e-mail"
        required
        maxLength={160}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
      />
      <button
        type="submit"
        disabled={busy || !name.trim() || !contact.trim()}
        className="w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}
      >
        {busy ? "Envoi…" : "Être rappelé"}
      </button>
    </form>
  );
}
