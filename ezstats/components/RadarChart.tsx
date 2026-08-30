"use client";

import { useState } from "react";

interface RadarPoint {
  label: string;
  value: number;
}

interface Props {
  data: RadarPoint[];
  color: string;
  size?: number;
  maxWidth?: number;
}

const GRID_LEVELS = [0.25, 0.5, 0.75, 1];
const GRID_COLOR = "#E5E7EB";
const LABEL_COLOR = "#6B7280";
// Reserved so side/top/bottom labels (and the value shown next to a hovered
// one) have room to render fully instead of running past the SVG's edge.
const PAD_X = 78;
const PAD_Y = 32;

export default function RadarChart({ data, color, size = 300, maxWidth = 440 }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const width = size + PAD_X * 2;
  const height = size + PAD_Y * 2;
  const center = { x: width / 2, y: height / 2 };
  const radius = size * 0.32;
  const labelRadius = radius + 26;
  const n = data.length;
  const maxValue = Math.max(1, ...data.map(d => d.value));

  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pointAt = (i: number, frac: number) => {
    const angle = angleFor(i);
    return { x: center.x + Math.cos(angle) * radius * frac, y: center.y + Math.sin(angle) * radius * frac };
  };

  const dataPoints = data.map((d, i) => pointAt(i, d.value / maxValue));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full mx-auto block"
      style={{ aspectRatio: `${width} / ${height}`, maxWidth }}
    >
      {GRID_LEVELS.map(level => (
        <polygon
          key={level}
          points={data.map((_, i) => pointAt(i, level)).map(p => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={GRID_COLOR}
          strokeWidth={1}
        />
      ))}
      {data.map((_, i) => {
        const p = pointAt(i, 1);
        return <line key={i} x1={center.x} y1={center.y} x2={p.x} y2={p.y} stroke={GRID_COLOR} strokeWidth={1} />;
      })}

      {/* Closed at the center, then spreads open to each point's real
          position on mount (i.e. every time the view switches to Chart). */}
      <g
        style={{ transformOrigin: `${center.x}px ${center.y}px`, transformBox: "view-box" }}
        className="animate-[radar-grow_0.7s_ease-out]"
      >
        <polygon
          points={dataPoints.map(p => `${p.x},${p.y}`).join(" ")}
          fill={color}
          fillOpacity={0.25}
          stroke={color}
          strokeWidth={2}
        />

        {dataPoints.map((p, i) => {
          const isHovered = hovered === data[i].label;
          return (
            <circle
              key={data[i].label}
              cx={p.x}
              cy={p.y}
              r={isHovered ? 5.5 : 3}
              fill={color}
              stroke="#fff"
              strokeWidth={isHovered ? 2 : 1}
              onMouseEnter={() => setHovered(data[i].label)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </g>

      {data.map((d, i) => {
        const angle = angleFor(i);
        const cos = Math.cos(angle);
        const lp = { x: center.x + cos * labelRadius, y: center.y + Math.sin(angle) * labelRadius };
        const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
        const isHovered = hovered === d.label;
        return (
          <g
            key={d.label}
            onMouseEnter={() => setHovered(d.label)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Wider invisible hit target so the label is easy to hover. */}
            <rect
              x={lp.x - 50}
              y={lp.y - 12}
              width={100}
              height={24}
              fill="transparent"
            />
            <text
              x={lp.x}
              y={lp.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={12}
              fontWeight={isHovered ? 700 : 400}
              fill={isHovered ? color : LABEL_COLOR}
            >
              {isHovered ? `${d.label}: ${d.value}` : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
