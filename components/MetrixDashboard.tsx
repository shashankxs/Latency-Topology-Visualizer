// components/MetricsDashboard.tsx
"use client";

import React, { useMemo } from "react";
import { useAppContext } from "../lib/appContext";

export function MetricsDashboard() {
  const { latencyData } = useAppContext();

  const avgLatency = useMemo(() => {
    if (latencyData.length === 0) return 0;
    return latencyData.reduce((sum, d) => sum + d.latency, 0) / latencyData.length;
  }, [latencyData]);

  const minLatency = useMemo(() => {
    if (latencyData.length === 0) return 0;
    return Math.min(...latencyData.map((d) => d.latency));
  }, [latencyData]);

  const maxLatency = useMemo(() => {
    if (latencyData.length === 0) return 0;
    return Math.max(...latencyData.map((d) => d.latency));
  }, [latencyData]);

  const activeConnections = latencyData.length;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      padding: "16px",
      backgroundColor: "#0d1117",
      color: "#ddd",
      borderRadius: "8px"
    }}>
      <div style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "12px", borderRadius: "6px" }}>
        <h3>Average Latency</h3>
        <p>{avgLatency.toFixed(1)} ms</p>
      </div>
      <div style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "12px", borderRadius: "6px" }}>
        <h3>Minimum Latency</h3>
        <p>{minLatency.toFixed(1)} ms</p>
      </div>
      <div style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "12px", borderRadius: "6px" }}>
        <h3>Maximum Latency</h3>
        <p>{maxLatency.toFixed(1)} ms</p>
      </div>
      <div style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "12px", borderRadius: "6px" }}>
        <h3>Active Connections</h3>
        <p>{activeConnections}</p>
      </div>
    </div>
  );
}
