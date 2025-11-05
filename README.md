```markdown
# Latency Topology Visualizer

Preview: A Next.js + React Three Fiber app that visualizes exchange server locations and latency topology on a 3D globe.

This scaffold implements:
- 3D interactive globe using three.js + @react-three/fiber
- Plotted exchange servers with provider-colored markers (AWS/GCP/Azure)
- Mock real-time latency service that emits latency updates every 5s (placeholder for integrating a real free API)
- Historical latency chart (time-series) using Chart.js
- Basic control panel for filtering providers and selecting server pairs
- Typescript + Zustand for light state management

What this repo is: a starting point / minimal implementation you can extend for your assignment. The real-time latency source is simulated in `lib/latencyService.ts` so you can easily swap in a real provider (Cloudflare Radar, public probe APIs, or your internal telemetry).

Getting started (local):
1. Install dependencies
   - npm install
2. Start dev server
   - npm run dev
3. Open http://localhost:3000

Files of interest:
- pages/index.tsx — main UI layout and controls
- components/Map3D.tsx — 3D globe, markers, animated latency arcs
- components/ControlsPanel.tsx — filter/search UI
- components/LatencyChart.tsx — historical latency chart
- lib/latencyService.ts — simulated real-time/historical latency provider
- data/exchanges.ts — exchange server locations & metadata
- src/lib/latencyProvider.ts Subscription-based latency updates producing { from, to, ms }

Assumptions & notes
- No single free public “latency matrix” API reliably returns cross-cloud latencies in a CORS-friendly way for demos. For this assignment we provide a simulated service that can be swapped for a real service.
- The globe uses a low-poly textured sphere for performance; you can upgrade to a Mapbox/MapLibre basemap if you need geo-tiling.
- Focus is on functionality and extensibility: hooks, TypeScript, and clear places to integrate real data.

Suggested next steps
- Integrate a real network probe source (e.g., publicly accessible monitoring endpoints or your own probe servers).
- Add server-side caching for heavy API calls.
- Add authentication if desired, and export/reporting functionality.

License: MIT
```