import type { ReactNode } from 'react';

/** رسم دائري (Donut) بمقاطع ملوّنة */
export function Donut({
  segments,
  size = 132,
  stroke = 16,
  center,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  stroke?: number;
  center?: ReactNode;
}) {
  const total = Math.max(
    segments.reduce((a, s) => a + s.value, 0),
    0.0001,
  );
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;
  const hasData = segments.some((s) => s.value > 0);

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
          opacity={0.7}
        />
        {hasData &&
          segments.map((s, i) => {
            if (s.value <= 0) return null;
            const frac = s.value / total;
            const dash = `${frac * C} ${C}`;
            const off = -acc * C;
            acc += frac;
            return (
              <circle
                key={i}
                className="donut-seg"
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={dash}
                strokeDashoffset={off}
              />
            );
          })}
      </svg>
      {center && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {center}
        </div>
      )}
    </div>
  );
}

/** شريط أفقي بنسبة مئوية */
export function HBar({
  value,
  color,
  track = 'var(--color-line)',
}: {
  value: number;
  color: string;
  track?: string;
}) {
  return (
    <span
      className="block h-2 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: track }}
    >
      <span
        className="bar-fill block h-full rounded-full"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          backgroundColor: color,
        }}
      />
    </span>
  );
}

/** خط اتجاه صغير */
export function Sparkline({
  values,
  color = 'var(--color-board-600)',
  width = 110,
  height = 34,
}: {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (values.length < 2)
    return <svg width={width} height={height} aria-hidden />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (width - 4) + 2;
      const y = height - 4 - ((v - min) / span) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </svg>
  );
}
