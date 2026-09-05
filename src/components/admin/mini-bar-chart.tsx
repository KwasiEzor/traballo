/**
 * Tiny dependency-free SVG bar chart for admin trends.
 */
export function MiniBarChart({
  data,
  height = 120,
  valueLabel = "",
}: {
  data: { label: string; value: number }[];
  height?: number;
  valueLabel?: string;
}) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Pas encore de données.
      </p>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.value));
  const barW = 100 / data.length;

  return (
    <div>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={`Graphique : ${valueLabel}`}
      >
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 4);
          return (
            <rect
              key={i}
              x={i * barW + barW * 0.15}
              y={height - h}
              width={barW * 0.7}
              height={Math.max(h, d.value > 0 ? 2 : 0)}
              rx={1}
              className="fill-primary"
            />
          );
        })}
      </svg>
      <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
