"use client";

import * as React from "react";
import { X } from "lucide-react";
import { isBeta, betaFeedbackUrl } from "@/lib/site-phase";

const STORAGE_KEY = "traballo:beta-banner-dismissed";

/**
 * Dismissible beta notice for the dashboard. Tells the artisan the product is
 * still evolving and points them at the feedback form. Dismissal is remembered
 * per browser in localStorage; render nothing until mounted to avoid a
 * hydration mismatch on the stored state.
 */
export function BetaBanner() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!isBeta()) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* private mode / storage blocked — show it */
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex items-start gap-3 border-b border-primary/20 bg-primary-subtle px-4 py-2.5 text-sm text-primary sm:px-6">
      <p className="flex-1 text-pretty">
        <span className="font-semibold">Traballo est en bêta.</span>{" "}
        <span className="text-primary/90">
          Vous pouvez tout utiliser — des correctifs et des améliorations
          arrivent régulièrement.{" "}
          <a
            href={betaFeedbackUrl()}
            className="font-medium underline underline-offset-2"
          >
            Signaler un souci ou une idée
          </a>
          .
        </span>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Masquer ce message"
        className="-m-1 rounded p-1 text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
