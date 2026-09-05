"use client";

import * as React from "react";
import { useTheme } from "next-themes";

/**
 * Cloudflare Turnstile widget (explicit render). Drops a hidden
 * `cf-turnstile-response` input inside the surrounding <form>, so the server
 * action receives the token via FormData with no extra wiring.
 *
 * Renders nothing when no site key is configured — the form still submits and
 * the server treats verification as skipped.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: Record<string, unknown>
      ) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
    onloadTurnstile?: () => void;
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onloadTurnstile";

let scriptState: "idle" | "loading" | "ready" = "idle";
const readyWaiters: Array<() => void> = [];

function loadScript(): Promise<void> {
  if (scriptState === "ready") return Promise.resolve();
  return new Promise((resolve) => {
    readyWaiters.push(resolve);
    if (scriptState === "loading") return;
    scriptState = "loading";
    window.onloadTurnstile = () => {
      scriptState = "ready";
      readyWaiters.splice(0).forEach((fn) => fn());
    };
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  });
}

export function Turnstile({ siteKey }: { siteKey?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const widgetId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!siteKey || !ref.current) return;
    let cancelled = false;
    const el = ref.current;

    loadScript().then(() => {
      if (cancelled || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(el, {
        sitekey: siteKey,
        theme: resolvedTheme === "dark" ? "dark" : "light",
        action: "contact",
        "response-field-name": "cf-turnstile-response",
      });
    });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
    // resolvedTheme intentionally excluded — a live theme swap re-mounting the
    // widget would clear a solved challenge. Initial theme is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) return null;

  return <div ref={ref} className="min-h-[65px]" />;
}
