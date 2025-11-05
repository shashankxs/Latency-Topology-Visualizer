import React, { useMemo } from "react";

export type LatencyPoint = { ts: number; ms: number };

type Props = {
  points: LatencyPoint[];
};

export default function LatencyStats({ points }: Props) {
  const stats = useMemo(() => {
    if (!points.length) return { min: null, max: null, avg: null };
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (const p of points) {
      if (p.ms < min) min = p.ms;
      if (p.ms > max) max = p.ms;
      sum += p.ms;
    }
    const avg = sum / points.length;
    return { min, max, avg };
  }, [points]);

  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 6,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(13,17,23,0.6)",
        color: "#ddd",
        fontSize: 12
      }}
    >
      <div><strong>Latency Stats</strong></div>
      <div style={{ display: "flex", gap: 16 }}>
        <div>Min: {stats.min !== null ? `${Math.round(stats.min)} ms` : "—"}</div>
        <div>Max: {stats.max !== null ? `${Math.round(stats.max)} ms` : "—"}</div>
        <div>Average: {stats.avg !== null ? `${Math.round(stats.avg)} ms` : "—"}</div>
      </div>
    </div>
  );
}
