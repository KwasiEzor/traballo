import { Fragment } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEATURE_MATRIX } from "@/lib/marketing/plans";

function Cell({ value }: { value: string | boolean }) {
  if (value === true)
    return <Check className="mx-auto size-4 text-primary" aria-label="Inclus" />;
  if (value === false)
    return (
      <Minus className="mx-auto size-4 text-muted-foreground/50" aria-label="Non inclus" />
    );
  return <span className="text-sm text-foreground">{value}</span>;
}

export function FeatureMatrix() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border bg-card">
            <th className="w-2/5 px-4 py-4 text-left font-semibold text-foreground">
              Fonctionnalité
            </th>
            {[
              { name: "Free", featured: false },
              { name: "Pro", featured: true },
              { name: "Business", featured: false },
            ].map((p) => (
              <th
                key={p.name}
                className={cn(
                  "px-4 py-4 text-center font-display font-semibold text-foreground",
                  p.featured && "bg-primary-subtle/40"
                )}
              >
                {p.name}
                {p.featured && (
                  <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-primary">
                    Populaire
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FEATURE_MATRIX.map((group) => (
            <Fragment key={group.title}>
              <tr className="bg-muted/60">
                <td
                  colSpan={4}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary"
                >
                  {group.title}
                </td>
              </tr>
              {group.rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3 text-foreground">{row.label}</td>
                  <td className="px-4 py-3 text-center">
                    <Cell value={row.free} />
                  </td>
                  <td className="bg-primary-subtle/25 px-4 py-3 text-center">
                    <Cell value={row.pro} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Cell value={row.business} />
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
