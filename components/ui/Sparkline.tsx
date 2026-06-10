// Lightweight inline SVG sparkline — used by the analytics page to render
// a series without pulling a charting lib. Renders as a smooth path with an
// optional fill, scaled to the container box. Zero-only series fall back to
// a flat line so the card doesn't visually collapse.

type Props = {
  values: number[];
  width?: number;
  height?: number;
  /** CSS color (Tailwind class on the parent + currentColor works too). */
  stroke?: string;
  /** Light fill under the line. Set to `null` to disable. */
  fill?: string | null;
  className?: string;
};

export function Sparkline({
  values,
  width = 200,
  height = 48,
  stroke = "currentColor",
  fill = "currentColor",
  className,
}: Props) {
  if (!values.length) {
    return <svg width={width} height={height} className={className} />;
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : width;
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2; // 2px top/bottom padding
    return [x, y] as const;
  });
  const pathD = points
    .map(([x, y], i) => (i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`))
    .join(" ");
  const fillPath = fill
    ? `${pathD} L${width.toFixed(1)},${height} L0,${height} Z`
    : null;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none">
      {fillPath && fill && <path d={fillPath} fill={fill} fillOpacity={0.12} stroke="none" />}
      <path d={pathD} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
