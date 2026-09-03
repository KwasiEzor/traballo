"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitLead, type LeadState } from "@/app/sites/[slug]/actions";

const initial: LeadState = {};

export function LeadForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(submitLead, initial);

  if (state.ok) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
        <p>
          Merci, votre demande est bien envoyée. Vous serez recontacté au plus
          vite.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {state.error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
      )}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
          Votre nom
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-[15px] outline-none focus:border-[var(--sp)] focus:ring-2 focus:ring-[var(--sp)]/20"
        />
      </div>
      <div>
        <label htmlFor="contact" className="mb-1.5 block text-sm font-medium text-slate-700">
          Téléphone ou e-mail
        </label>
        <input
          id="contact"
          name="contact"
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-[15px] outline-none focus:border-[var(--sp)] focus:ring-2 focus:ring-[var(--sp)]/20"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-700">
          Votre besoin
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-[15px] outline-none focus:border-[var(--sp)] focus:ring-2 focus:ring-[var(--sp)]/20"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[var(--sp)] px-5 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Envoi…" : "Envoyer ma demande"}
      </button>
    </form>
  );
}
