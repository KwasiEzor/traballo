import { Fragment } from "react";
import { Check, Minus } from "lucide-react";
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
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            <th className="w-2/5 px-4 py-3 text-left font-semibold text-foreground">
              Fonctionnalité
            </th>
            {["Free", "Pro", "Business"].map((p) => (
              <th
                key={p}
                className="px-4 py-3 text-center font-display font-semibold text-foreground"
              >
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FEATURE_MATRIX.map((group) => (
            <Fragment key={group.title}>
              <tr className="bg-primary-subtle/50">
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
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 text-foreground">{row.label}</td>
                  <td className="px-4 py-3 text-center">
                    <Cell value={row.free} />
                  </td>
                  <td className="bg-primary-subtle/30 px-4 py-3 text-center">
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
