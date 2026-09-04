/**
 * Lightweight, token-driven UI mockups for the marketing site.
 * Not real screenshots — deliberate abstractions that stay on-brand in
 * both themes and never go stale.
 */

import {
  FileText,
  Users,
  CalendarDays,
  Globe,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";

export function DashboardMock() {
  return (
    <div className="grid grid-cols-[168px_1fr] text-[11px] leading-tight">
      <aside className="border-r border-border bg-sidebar p-3">
        <div className="flex items-center gap-2 px-1.5 py-1 font-display text-sm font-semibold">
          Traballo
        </div>
        <nav className="mt-4 space-y-0.5">
          {[
            { icon: LayoutDashboard, label: "Tableau de bord", active: true },
            { icon: FileText, label: "Factures" },
            { icon: Users, label: "Clients" },
            { icon: CalendarDays, label: "Rendez-vous" },
            { icon: Globe, label: "Mon site" },
            { icon: Sparkles, label: "Agent IA" },
          ].map((i) => (
            <div
              key={i.label}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
                i.active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <i.icon className="size-3.5" />
              {i.label}
            </div>
          ))}
        </nav>
      </aside>

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="font-display text-sm font-semibold text-foreground">
            Bonjour, Jean 👋
          </div>
          <div className="rounded-md bg-primary px-2.5 py-1 text-[10px] font-medium text-primary-foreground">
            Nouvelle facture
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {[
            { k: "Encaissé ce mois", v: "4 280 €", d: "+12 %" },
            { k: "En attente", v: "1 150 €", d: "3 factures" },
            { k: "RDV cette semaine", v: "6", d: "2 à confirmer" },
          ].map((s) => (
            <div key={s.k} className="rounded-lg border border-border bg-card p-2.5">
              <div className="truncate text-[10px] text-muted-foreground">{s.k}</div>
              <div className="mt-1 whitespace-nowrap font-display text-sm font-semibold tabular-nums text-foreground">
                {s.v}
              </div>
              <div className="mt-0.5 truncate text-[10px] text-success">{s.d}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
            <span>Dernières factures</span>
            <span>Statut</span>
          </div>
          {[
            { n: "2026-0042", c: "Mme Bernard", a: "890 €", s: "Payée", ok: true },
            { n: "2026-0041", c: "SCI Lumière", a: "2 340 €", s: "Envoyée", ok: false },
            { n: "2026-0040", c: "M. Rossi", a: "455 €", s: "Payée", ok: true },
          ].map((r) => (
            <div
              key={r.n}
              className="flex items-center justify-between border-t border-border/70 py-1.5 first:border-t-0"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 font-medium text-foreground">{r.n}</span>
                <span className="truncate text-muted-foreground">{r.c}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="whitespace-nowrap tabular-nums text-foreground">{r.a}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                    r.ok
                      ? "bg-success-subtle text-success"
                      : "bg-primary-subtle text-accent-foreground"
                  }`}
                >
                  {r.s}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InvoiceMock() {
  return (
    <div className="p-5 text-[11px] leading-relaxed">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-sm font-semibold text-foreground">
            Plomberie Dupont
          </div>
          <div className="text-muted-foreground">TVA BE0123.456.789 · Bruxelles</div>
        </div>
        <div className="text-right">
          <div className="font-display text-base font-semibold text-foreground">
            Facture 2026-0042
          </div>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-success-subtle px-2 py-0.5 text-[9px] font-medium text-success">
            <CheckCircle2 className="size-3" /> Conforme Factur-X
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-muted-foreground">
        <div>
          <div className="font-medium text-foreground">Client</div>
          Mme Bernard — 14 rue des Tilleuls
        </div>
        <div>
          <div className="font-medium text-foreground">Échéance</div>
          30 jours · 15 octobre 2026
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-md border border-border">
        <div className="flex bg-muted/70 px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
          <span className="flex-1">Prestation</span>
          <span className="w-14 text-right">Qté</span>
          <span className="w-20 text-right">Total HT</span>
        </div>
        {[
          ["Remplacement chauffe-eau 200 L", "1", "780,00 €"],
          ["Main d'œuvre (2 h)", "2", "110,00 €"],
        ].map((r) => (
          <div
            key={r[0]}
            className="flex border-t border-border px-3 py-1.5 text-foreground"
          >
            <span className="flex-1">{r[0]}</span>
            <span className="w-14 text-right text-muted-foreground">{r[1]}</span>
            <span className="w-20 text-right tabular-nums">{r[2]}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 ml-auto w-40 space-y-1 text-right">
        <div className="flex justify-between text-muted-foreground">
          <span>Total HT</span>
          <span className="tabular-nums">890,00 €</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>TVA 21 %</span>
          <span className="tabular-nums">186,90 €</span>
        </div>
        <div className="flex justify-between border-t border-border pt-1 font-display font-semibold text-foreground">
          <span>Total TTC</span>
          <span className="tabular-nums">1 076,90 €</span>
        </div>
      </div>
    </div>
  );
}

export function SiteMock() {
  return (
    <div className="text-[11px] leading-tight">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="font-display text-sm font-semibold text-foreground">
          Élec&nbsp;Martin
        </div>
        <div className="flex gap-3 text-muted-foreground">
          <span>Services</span>
          <span>Réalisations</span>
          <span>Contact</span>
        </div>
        <div className="rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground">
          Devis gratuit
        </div>
      </div>
      <div className="bg-primary-subtle px-5 py-7">
        <div className="max-w-[70%]">
          <div className="font-display text-base font-semibold text-foreground">
            Votre électricien à Lyon, disponible sous 24 h
          </div>
          <div className="mt-1.5 text-muted-foreground">
            Dépannage, mise aux normes, installation. Devis gratuit, intervention
            rapide.
          </div>
          <div className="mt-3 flex gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 text-[10px] font-medium text-primary-foreground">
              Prendre rendez-vous
            </span>
            <span className="rounded-md border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-foreground">
              06 12 34 56 78
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 p-4">
        {["Dépannage 24/7", "Mise aux normes", "Borne de recharge"].map((s) => (
          <div key={s} className="rounded-md border border-border bg-card p-2.5">
            <div className="size-5 rounded bg-primary-subtle" />
            <div className="mt-1.5 font-medium text-foreground">{s}</div>
            <div className="text-muted-foreground">À partir de 79 €</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatMock({ compact = false }: { compact?: boolean }) {
  if (compact) {
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
          Vous intervenez à Villeurbanne ce soir ?
        </div>
        <div className="max-w-[85%] rounded-lg rounded-bl-sm bg-muted px-2.5 py-1.5 text-foreground">
          Oui — un créneau à 18 h vous convient&nbsp;?
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 p-4 text-[11px]">
      <div className="flex items-center gap-2 border-b border-border pb-2.5">
        <div className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="size-3.5" />
        </div>
        <div>
          <div className="font-medium text-foreground">Assistant d'Élec Martin</div>
          <div className="text-[10px] text-success">● En ligne — répond en 2 s</div>
        </div>
      </div>

      <div className="ml-auto max-w-[80%] rounded-lg rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">
        Bonjour, mon tableau électrique fait disjoncter le soir. Vous intervenez à
        Villeurbanne ?
      </div>
      <div className="max-w-[85%] rounded-lg rounded-bl-sm bg-muted px-3 py-2 text-foreground">
        Oui, nous intervenons à Villeurbanne. Un déclenchement le soir vient
        souvent d'un appareil défectueux ou d'un différentiel sensible. Je peux
        vous réserver un créneau demain entre 9 h et 11 h — cela vous convient&nbsp;?
      </div>
      <div className="max-w-[80%] rounded-lg rounded-bl-sm bg-muted px-3 py-2 text-foreground">
        Parfait. À quel nom et numéro puis-je vous joindre&nbsp;?
      </div>
      <div className="rounded-md border border-dashed border-success/40 bg-success-subtle px-3 py-2 text-success">
        ✓ Lead capturé — RDV pré-réservé, l'artisan est notifié.
      </div>
    </div>
  );
}
