
import React, { useState } from "react";
import ControlsPanel from "../components/ControlsPanel";
import ExchangeMap from "../components/ExchangeMap";
import ProviderLegend from "../components/ProviderLegend";
import { useAppContext } from "../lib/appContext";
import HamburgerMenu from "../components/HamburgerMenu";

export default function TopologyPage() {
  const {
    providers,
    selectedExchange,
    toggleProvider,
    setSelectedExchange,
    setSearchQ,
  } = useAppContext();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      {/* Mobile header */}
      <div className="mobile-header">
        <h1 style={{ margin: 0, fontSize: "18px" }}>Topology Map</h1>
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
      </aside>

      <main className="main">
        <ExchangeMap onSelect={setSelectedExchange} selectedId={selectedExchange} />
        <ProviderLegend />
      </main>
    </div>
  );
}
