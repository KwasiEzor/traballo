import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { HeroChatDemo } from "@/components/marketing/hero-chat-demo";

// framer-motion's useReducedMotion() reads a module-level singleton
// initialised once per process (see motion-dom's initPrefersReducedMotion),
// so it can't be toggled per test via window.matchMedia — same reason no
// other component test in this repo covers that branch. These tests only
// exercise the (default, non-reduced) animated path.

describe("HeroChatDemo", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a typing indicator before the reply is typed out", () => {
    vi.useFakeTimers();
    render(<HeroChatDemo />);

    // Right after mount, the reply hasn't been typed yet.
    expect(screen.queryByText(/créneau à 18/)).not.toBeInTheDocument();

    // Advance past the "typing…" pause and every character tick.
    act(() => {
      vi.advanceTimersByTime(700 + 32 * 40);
    });
    expect(screen.getByText("Oui — un créneau à 18 h vous convient ?")).toBeInTheDocument();
  });

  it("loops back to the typing indicator after the reply has been shown a while", () => {
    vi.useFakeTimers();
    render(<HeroChatDemo />);

    act(() => {
      vi.advanceTimersByTime(700 + 32 * 40); // full reply typed
    });
    expect(screen.getByText("Oui — un créneau à 18 h vous convient ?")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3200 + 10); // past the post-reply pause
    });
    expect(screen.queryByText(/créneau à 18/)).not.toBeInTheDocument();
  });

  it("always shows the artisan's incoming question", () => {
    render(<HeroChatDemo />);
    expect(screen.getByText(/Villeurbanne ce soir/)).toBeInTheDocument();
  });
});
