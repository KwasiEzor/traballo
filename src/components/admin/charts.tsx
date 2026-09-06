/**
 * Dependency-free SVG charts for the admin console. Theme-aware via the
 * --chart-* CSS variables. All responsive: the SVG scales to its container.
 */

const CHART = {
  1: "var(--chart-1)", // brand blue
  2: "var(--chart-2)", // green
  3: "var(--chart-3)", // amber
  4: "var(--chart-4)", // purple
  5: "var(--chart-5)", // cyan
} as const;

type Point = { label: string; value: number };

/* ------------------------------------------------------------------ */
/* Area / line chart — trend over time                                 */
/* ------------------------------------------------------------------ */

export function AreaChart({
  data,
  color = CHART[1],
  height = 160,
  formatValue = (n: number) => String(n),
}: {
  data: Point[];
  color?: string;
  height?: number;
  formatValue?: (n: number) => string;
}) {
  if (data.length < 2) {
    return <Empty height={height} />;
  }
  const W = 100;
  const H = height;
  const pad = 6;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = (W - pad * 2) / (data.length - 1);
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2);
  const pts = data.map((d, i) => [pad + i * step, y(d.value)] as const);
  const line = pts.map(([x, yy], i) => `${i ? "L" : "M"}${x},${yy}`).join(" ");
  const area = `${line} L${pts[pts.length - 1]![0]},${H - pad} L${pts[0]![0]},${H - pad} Z`;
  const gid = `area-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={W - pad}
            y1={pad + f * (H - pad * 2)}
            y2={pad + f * (H - pad * 2)}
            stroke="var(--border)"
            strokeWidth="0.4"
          />
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {pts.map(([x, yy], i) => (
          <circle key={i} cx={x} cy={yy} r="1.1" fill={color} />
        ))}
      </svg>
      <Axis
        left={data[0]?.label}
        right={data[data.length - 1]?.label}
        note={`max ${formatValue(max)}`}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bar series — counts per bucket                                      */
/* ------------------------------------------------------------------ */

export function BarSeries({
  data,
  color = CHART[1],
  height = 140,
}: {
  data: Point[];
  color?: string;
  height?: number;
}) {
  if (data.length === 0) return <Empty height={height} />;
  const max = Math.max(1, ...data.map((d) => d.value));
  const bw = 100 / data.length;

  return (
    <div>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
      >
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 6);
          return (
            <rect
              key={i}
              x={i * bw + bw * 0.18}
              y={height - Math.max(h, d.value > 0 ? 2 : 0)}
              width={bw * 0.64}
              height={Math.max(h, d.value > 0 ? 2 : 0)}
              rx="1.5"
              fill={color}
              opacity={i === data.length - 1 ? 1 : 0.55}
            />
          );
        })}
      </svg>
      <Axis left={data[0]?.label} right={data[data.length - 1]?.label} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Donut — distribution with legend                                    */
/* ------------------------------------------------------------------ */

export function Donut({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color: string }[];
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const R = 40;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="relative shrink-0" style={{ width: 132, height: 132 }}>
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--muted)" strokeWidth="12" />
          {segments.map((seg, i) => {
            const frac = seg.value / total;
            const dash = frac * C;
            const el = (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-semibold text-foreground">
            {centerValue ?? total}
          </span>
          {centerLabel && (
            <span className="text-[11px] text-muted-foreground">{centerLabel}</span>
          )}
        </div>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {segments.map((seg) => {
          const pct = Math.round((seg.value / total) * 100);
          return (
            <li key={seg.label} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-muted-foreground">{seg.label}</span>
              <span className="ml-auto font-medium text-foreground">
                {seg.value}{" "}
                <span className="text-xs text-muted-foreground">({pct} %)</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Axis({
  left,
  right,
  note,
}: {
  left?: string;
  right?: string;
  note?: string;
}) {
  return (
    <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
      <span>{left}</span>
      {note && <span className="text-muted-foreground/70">{note}</span>}
      <span>{right}</span>
    </div>
  );
}

function Empty({ height }: { height: number }) {
  return (
    <div
      className="grid place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground"
      style={{ height }}
    >
      Pas encore assez de données.
    </div>
  );
}

export { CHART };
