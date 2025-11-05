import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Filler
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import { latencyProvider } from "../lib/latencyProvider";

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend, CategoryScale, Filler);

type Props = {
  from?: string | null;
  to?: string | null;
};

export default function LatencyChart({ from, to }: Props) {
  const [dataPoints, setDataPoints] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (!from || !to) {
      setDataPoints([]);
      return;
    }

    const load = () => {
      const h = latencyProvider.getHistory(from, to);
      setDataPoints(h.map((p) => ({ x: p.ts, y: p.ms })));
    };

    load();
    const unsub = latencyProvider.subscribe(() => {
      load();
    });
    return unsub;
  }, [from, to]);

  const chartData = {
    datasets: [
      {
        label: from && to ? `${from} → ${to}` : "Latency",
        data: dataPoints,
        borderColor: "#1e90ff",
        backgroundColor: "rgba(30,144,255,0.12)",
        tension: 0.2,
        fill: true,
        pointRadius: 0
      }
    ]
  };

  const options: any = {
    scales: {
      x: {
        type: "time",
        time: { unit: "minute" },
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.04)" }
      },
      y: {
        ticks: { color: "#fff" },
        title: { display: true, text: "Latency (ms)", color: "#fff" },
        grid: { color: "rgba(255,255,255,0.04)" }
      }
    },
    plugins: {
      legend: { labels: { color: "#fff" } },
      tooltip: { mode: "index", intersect: false }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div style={{ height: 220 }}>
      {!from || !to ? (
        <div style={{ color: "#fff", padding: 12 }}>Select a pair to show historical latency</div>
      ) : (
        <Line data={chartData as any} options={options} />
      )}
    </div>
  );
}