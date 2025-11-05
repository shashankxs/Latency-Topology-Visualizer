import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import ControlsPanel from "../components/ControlsPanel";
import LatencyChart from "../components/LatencyChart";
import { EXCHANGE_SERVERS, Provider } from "../data/exchanges";

const Map3D = dynamic(() => import("../components/Map3D"), { ssr: false });

export default function Home() {
  const [providers, setProviders] = useState<Record<string, boolean>>({
    AWS: true,
    GCP: true,
    Azure: true
  });
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [highlightedPair, setHighlightedPair] = useState<{ from: string; to: string } | null>(null);

  const filtered = useMemo(() => {
    if (!searchQ) return EXCHANGE_SERVERS;
    const q = searchQ.toLowerCase();
    return EXCHANGE_SERVERS.filter((s) => s.name.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q));
  }, [searchQ]);

  return (
    <div className="app">
      <aside className="sidebar">
        <ControlsPanel
          providers={providers}
          onToggleProvider={(p: Provider) =>
            setProviders((prev) => ({ ...prev, [p]: !prev[p] }))
          }
          onSelectExchange={(id) => setSelectedExchange(id)}
          selectedExchange={selectedExchange}
          onSearch={(q) => setSearchQ(q)}
        />
        <div style={{ marginTop: 12 }}>
          <strong>Historical</strong>
          <LatencyChart from={selectedExchange ?? undefined} to={selectedExchange ? EXCHANGE_SERVERS.find(s => s.id !== selectedExchange)?.id : undefined} />
        </div>
      </aside>

      <main className="main">
        <Map3D
          filterProviders={providers}
          onSelect={(id) => {
            // select logic: when user clicks first, set as 'from', second click sets 'to'
            if (!id) return;
            if (!selectedExchange || selectedExchange === id) {
              setSelectedExchange(id);
              setHighlightedPair(null);
            } else {
              setHighlightedPair({ from: selectedExchange, to: id });
            }
          }}
          highlightedPair={highlightedPair}
        />
      </main>
    </div>
  );
}