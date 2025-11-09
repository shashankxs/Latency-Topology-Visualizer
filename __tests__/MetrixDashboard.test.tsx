import React from "react";
import { render, screen } from "@testing-library/react";
import { MetricsDashboard } from "../components/MetrixDashboard";
import { AppContext } from "../lib/appContext";

// Base context for tests with data
const mockAppContextValue = {
  // STATE
  providers: { AWS: true, GCP: true, Azure: true },
  selectedExchange: null,
  searchQ: "",
  highlightedPair: null,
  latencyData: [
    { from: "A", to: "B", latency: 25 },
    { from: "A", to: "C", latency: 45 },
    { from: "B", to: "C", latency: 35 },
  ],
  allUpdates: [
    { from: "A", to: "B", ms: 25 },
    { from: "A", to: "C", ms: 45 },
    { from: "B", to: "C", ms: 35 },
  ],
  // ACTIONS (no-ops for testing)
  setProviders: () => {},
  toggleProvider: () => {},
  setSelectedExchange: () => {},
  setSearchQ: () => {},
  setHighlightedPair: () => {},
};

describe("MetricsDashboard", () => {
  function WithMockProvider({ children, contextValue }) {
    // Re-define context and provider for each test for isolation
    const { AppContext } = require("../lib/appContext");
    return (
      <AppContext.Provider value={contextValue}>
        {children}
      </AppContext.Provider>
    );
  }

  it("renders statistics based on latency data", () => {
    render(
      <WithMockProvider contextValue={mockAppContextValue}>
        <MetricsDashboard />
      </WithMockProvider>
    );
    expect(screen.getByText(/Average Latency/i)).toBeInTheDocument();
    expect(screen.getByText(/Minimum Latency/i)).toBeInTheDocument();
    expect(screen.getByText(/Maximum Latency/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Connections/i)).toBeInTheDocument();

    // Metrics
    expect(screen.getByText("35.0 ms")).toBeInTheDocument(); // avg
    expect(screen.getByText("25.0 ms")).toBeInTheDocument(); // min
    expect(screen.getByText("45.0 ms")).toBeInTheDocument(); // max
    expect(screen.getAllByText("3")[0]).toBeInTheDocument(); // active connections (3)
  });

  it("renders zeroes when no data is present", () => {
    const contextValue = { ...mockAppContextValue, latencyData: [], allUpdates: [] };
    render(
      <WithMockProvider contextValue={contextValue}>
        <MetricsDashboard />
      </WithMockProvider>
    );

    // There should be three "0.0 ms" (avg, min, max latency)
    const zeroStats = screen.getAllByText("0.0 ms");
    expect(zeroStats).toHaveLength(3);

    // Only one "0" for active connections
    expect(screen.getAllByText("0")).toHaveLength(1);
  });
});
