"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";

const QUESTION = "Vous intervenez à Villeurbanne ce soir ?";
const REPLY = "Oui — un créneau à 18 h vous convient ?";

const TYPING_DELAY_MS = 32; // per character
const PAUSE_BEFORE_TYPING_MS = 700;
const PAUSE_AFTER_REPLY_MS = 3200;

/**
 * The Hero's compact chat badge (see ChatMock in mockups.tsx for the static
 * variant used elsewhere), with the assistant's reply typed out live and
 * looping — a quick, self-explanatory demo of "l'agent IA répond à vos
 * clients". Kept separate from mockups.tsx so that file's other usage
 * (fonctionnalites page) stays a plain static illustration.
 */
export function HeroChatDemo() {
  const reduced = useReducedMotion();
  const [replyLength, setReplyLength] = React.useState(reduced ? REPLY.length : 0);
  const [showTyping, setShowTyping] = React.useState(!reduced);

  React.useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function typeChar() {
      if (cancelled) return;
      setShowTyping(false);
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        i += 1;
        setReplyLength(i);
        if (i < REPLY.length) {
          timers.push(setTimeout(tick, TYPING_DELAY_MS));
        } else {
          timers.push(setTimeout(restart, PAUSE_AFTER_REPLY_MS));
        }
      };
      tick();
    }

    function restart() {
      if (cancelled) return;
      setShowTyping(true);
      setReplyLength(0);
      timers.push(setTimeout(typeChar, PAUSE_BEFORE_TYPING_MS));
    }

    timers.push(setTimeout(typeChar, PAUSE_BEFORE_TYPING_MS));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reduced]);

  return (
    <div className="space-y-2 p-3 text-[10px]">
      <div className="flex items-center gap-1.5">
        <div className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="size-3" />
        </div>
        <div className="font-medium text-foreground">Assistant IA</div>
        <span className="ml-auto size-1.5 rounded-full bg-success" />
      </div>
      <div className="ml-auto max-w-[85%] rounded-lg rounded-br-sm bg-primary px-2.5 py-1.5 text-primary-foreground">
        {QUESTION}
      </div>
      <div className="min-h-[1.5em] max-w-[85%] rounded-lg rounded-bl-sm bg-muted px-2.5 py-1.5 text-foreground">
        {showTyping ? (
          <span className="inline-flex items-center gap-0.5 py-0.5">
            {[0, 0.15, 0.3].map((delay) => (
              <motion.span
                key={delay}
                className="size-1 rounded-full bg-muted-foreground/60"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.9, repeat: Infinity, delay, ease: "easeInOut" }}
              />
            ))}
          </span>
        ) : (
          <>
            {REPLY.slice(0, replyLength)}
            {replyLength > 0 && replyLength < REPLY.length && (
              <span aria-hidden="true" className="animate-pulse">▍</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
