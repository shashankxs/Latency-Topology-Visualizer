import React from "react";
import { render, screen } from "@testing-library/react";
import LatencyStats from "../components/LatencyStats";

describe("LatencyStats", () => {
  it("renders stats for given points (rounded)", () => {
    const points = [
      { ts: 1, ms: 120.4 },
      { ts: 2, ms: 80.2 },
      { ts: 3, ms: 200.8 }
    ];
    render(<LatencyStats points={points} />);
    expect(screen.getByText("Latency Stats")).toBeInTheDocument();
    expect(screen.getByText(/^Min:/)).toHaveTextContent("Min: 80 ms");
    expect(screen.getByText(/^Max:/)).toHaveTextContent("Max: 201 ms");
    expect(screen.getByText(/^Average:/)).toHaveTextContent("Average: 134 ms");
  });

  it("renders dashes for empty points array", () => {
    render(<LatencyStats points={[]} />);
    // Robust: get all divs matching the known stats
    const min = screen.getByText((_, node) => node?.textContent === "Min: —");
    const max = screen.getByText((_, node) => node?.textContent === "Max: —");
    const avg = screen.getByText((_, node) => node?.textContent === "Average: —");

    expect(min).toBeInTheDocument();
    expect(max).toBeInTheDocument();
    expect(avg).toBeInTheDocument();
    expect(screen.getByText("Latency Stats")).toBeInTheDocument();
  });
});
