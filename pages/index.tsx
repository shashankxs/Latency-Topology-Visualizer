import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import ControlsPanel from "../components/ControlsPanel";
import LatencyChart from "../components/LatencyChart";
import { EXCHANGE_SERVERS } from "../data/exchanges";
import { MetricsDashboard } from "../components/MetrixDashboard";
import { useAppContext } from "../lib/appContext";
import HamburgerMenu from "../components/HamburgerMenu";

const Map3D = dynamic(() => import("../components/Map3D"), { ssr: false });

export default function Home() {
    const {
        providers,
        selectedExchange,
        searchQ,
        highlightedPair,
        latencyData,
        toggleProvider,
        setSelectedExchange,
        setSearchQ,
        setHighlightedPair,
    } = useAppContext();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const filtered = useMemo(() => {
        if (!searchQ) return EXCHANGE_SERVERS;
        const q = searchQ.toLowerCase();
        return EXCHANGE_SERVERS.filter((s) => s.name.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q));
    }, [searchQ]);

    return (
        <div className="app">
            {/* Mobile header */}
            <div className="mobile-header">
                <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#e6edf3" }}>🌐 Latency Topology Visualizer</h1>
                <HamburgerMenu isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && <div className="mobile-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Desktop sidebar */}
            <aside className="sidebar">
                <ControlsPanel
                    providers={providers}
                    onToggleProvider={toggleProvider}
                    onSelectExchange={setSelectedExchange}
                    selectedExchange={selectedExchange}
                    onSearch={setSearchQ}
                />
                <div style={{ marginTop: 12 }}>
                    <strong>Historical</strong>
                    <LatencyChart from={selectedExchange ?? undefined} to={selectedExchange ? EXCHANGE_SERVERS.find(s => s.id !== selectedExchange)?.id : undefined} />
                </div>
                <div style={{ marginTop: 12 }}>
                    <strong>Metrics</strong>
                    <MetricsDashboard />
                </div>
            </aside>

            {/* Mobile sidebar */}
            <aside className={`mobile-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <ControlsPanel
                    providers={providers}
                    onToggleProvider={toggleProvider}
                    onSelectExchange={(id) => {
                        setSelectedExchange(id);
                        setSidebarOpen(false); // Close sidebar after selection on mobile
                    }}
                    selectedExchange={selectedExchange}
                    onSearch={setSearchQ}
                />
                <div style={{ marginTop: 12 }}>
                    <strong>Historical</strong>
                    <LatencyChart from={selectedExchange ?? undefined} to={selectedExchange ? EXCHANGE_SERVERS.find(s => s.id !== selectedExchange)?.id : undefined} />
                </div>
                <div style={{ marginTop: 12 }}>
                    <strong>Metrics</strong>
                    <MetricsDashboard />
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
