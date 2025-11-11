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
      background: "linear-gradient(135deg, rgba(22, 27, 34, 0.8) 0%, rgba(13, 17, 23, 0.9) 100%)",
      color: "#e6edf3",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
    }}>
      <div style={{
        border: "1px solid rgba(56, 139, 253, 0.2)",
        padding: "16px",
        borderRadius: "8px",
        background: "linear-gradient(135deg, rgba(56, 139, 253, 0.05) 0%, rgba(56, 139, 253, 0.02) 100%)",
        transition: "all 0.2s ease"
      }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#58a6ff" }}>Average Latency</h3>
        <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#e6edf3" }}>{avgLatency.toFixed(1)} ms</p>
      </div>
      <div style={{
        border: "1px solid rgba(46, 160, 67, 0.2)",
        padding: "16px",
        borderRadius: "8px",
        background: "linear-gradient(135deg, rgba(46, 160, 67, 0.05) 0%, rgba(46, 160, 67, 0.02) 100%)",
        transition: "all 0.2s ease"
      }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#56d364" }}>Minimum Latency</h3>
        <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#e6edf3" }}>{minLatency.toFixed(1)} ms</p>
      </div>
      <div style={{
        border: "1px solid rgba(240, 84, 84, 0.2)",
        padding: "16px",
        borderRadius: "8px",
        background: "linear-gradient(135deg, rgba(240, 84, 84, 0.05) 0%, rgba(240, 84, 84, 0.02) 100%)",
        transition: "all 0.2s ease"
      }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#f85149" }}>Maximum Latency</h3>
        <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#e6edf3" }}>{maxLatency.toFixed(1)} ms</p>
      </div>
      <div style={{
        border: "1px solid rgba(187, 128, 9, 0.2)",
        padding: "16px",
        borderRadius: "8px",
        background: "linear-gradient(135deg, rgba(187, 128, 9, 0.05) 0%, rgba(187, 128, 9, 0.02) 100%)",
        transition: "all 0.2s ease"
      }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#d29922" }}>Active Connections</h3>
        <p style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#e6edf3" }}>{activeConnections}</p>
      </div>
    </div>
  );
}
