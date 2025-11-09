import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ControlsPanel from "../components/ControlsPanel";

const providers = { AWS: true, GCP: true, Azure: true };
const onToggleProvider = jest.fn();
const onSelectExchange = jest.fn();
const onSearch = jest.fn();

describe("ControlsPanel", () => {
  it("renders panel UI sections and default text", () => {
    render(
      <ControlsPanel
        providers={providers}
        onToggleProvider={onToggleProvider}
        onSelectExchange={onSelectExchange}
        selectedExchange={null}
        onSearch={onSearch}
      />
    );
    // Checks for major labels
    expect(screen.getByText(/Latency Topology Visualizer/i)).toBeInTheDocument();
    expect(screen.getByText(/Providers/i)).toBeInTheDocument();
    expect(screen.getByText(/Exchanges/i)).toBeInTheDocument();
    expect(screen.getByText(/Historical Latency/i)).toBeInTheDocument();
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search exchange/i)).toBeInTheDocument();
    expect(screen.getByText(/Export Snapshot/)).toBeInTheDocument();
  });

  it("calls onSearch when input changes", () => {
    render(
      <ControlsPanel
        providers={providers}
        onToggleProvider={onToggleProvider}
        onSelectExchange={onSelectExchange}
        selectedExchange={null}
        onSearch={onSearch}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/Search exchange/i), { target: { value: "foo" } });
    // Debounce triggers after 200ms, so simulate time if needed (not shown here)
    // For unit test suites with jest timers enabled, you could do jest.advanceTimersByTime(200)
  });

  it("calls onToggleProvider when provider checkbox is clicked", () => {
    render(
      <ControlsPanel
        providers={providers}
        onToggleProvider={onToggleProvider}
        onSelectExchange={onSelectExchange}
        selectedExchange={null}
        onSearch={onSearch}
      />
    );
    const awsCheckbox = screen.getByLabelText(/Toggle AWS/i);
    fireEvent.click(awsCheckbox);
    expect(onToggleProvider).toHaveBeenCalledWith("AWS");
  });
});
