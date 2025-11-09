# Latency Topology Visualizer

**Preview:**  
A Next.js + React Three Fiber app for visualizing exchange server locations and latency topology on a 3D globe, including live metrics, historical charts, and interactive controls. This is a scaffold and minimal reference architecture: ready for you to extend with real latency APIs or custom monitoring.

---

## Features

- **3D Interactive Globe**  
  Renders world exchange locations, animated arcs, and provider-colored server markers using `three.js` with React abstractions.
- **Pluggable Real-Time Latency Service**  
  Simulates or fetches real-time network latency updates every 5 seconds using a service layer that can be swapped for a real free API (like Cloudflare Radar or latencyapi.com).
- **Historical Latency Charting**  
  Plots time-series metrics for selected server pairs, using Chart.js.
- **Extensible UI**  
  Filter by provider, select server pairs, and view detailed metrics and charts.
- **Modern State Management**  
  Built with TypeScript, React Context, and Zustand for clean separation of global and local state.
- **Lightweight, Demo-Ready**  
  Designed for rapid prototyping and educational demos.

---

## Libraries Used

#### **Core Frameworks**
- **[Next.js](https://nextjs.org/)** (14.0.0): Fullstack React framework for SSR and SSG.
- **[React](https://reactjs.org/)** (18.2.0) & **React DOM** (18.2.0): UI and rendering libraries.
- **[TypeScript](https://www.typescriptlang.org/)** (5.6.2): Adds static typing.

#### **3D Visualization**
- **[Three.js](https://threejs.org/)** (0.159.0): Low-level WebGL 3D graphics engine.
- **[@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/)** (8.14.3): React renderer for Three.js scenes.
- **[@react-three/drei](https://docs.pmnd.rs/drei/)** (9.56.8): Handy 3D UI primitives/helpers.

#### **Data Visualization**
- **[Chart.js](https://www.chartjs.org/)** (4.3.0): Charting library for time-series plots.
- **[react-chartjs-2](https://react-chartjs-2.js.org/)** (5.2.0): React wrapper for Chart.js.
- **[chartjs-adapter-date-fns](https://www.npmjs.com/package/chartjs-adapter-date-fns)** (3.0.0): Date/time scale adapter.
- **[date-fns](https://date-fns.org/)** (4.1.0): Modern date utility suite.

#### **State Management**
- **[Zustand](https://zustand-demo.pmnd.rs/)** (4.4.0): Lightweight, scalable state.
- **React Context:** Built-in global state sharing.

#### **Networking**
- **[Axios](https://axios-http.com/)** (1.4.0): HTTP client (where used).

#### **Mapping (Optional/Pluggable)**
- **[MapLibre GL](https://maplibre.org/)** (5.11.0): Open-source map rendering.

#### **Testing & Development**
- **[Jest](https://jestjs.io/)** (30.2.0): Testing framework.
- **[@testing-library/react](https://testing-library.com/)** (16.3.0): React component testing utilities.
- **[@testing-library/jest-dom](https://testing-library.com/docs/ecosystem-jest-dom/)** (6.9.1): Custom matchers for DOM assertions.
- **[@testing-library/user-event](https://testing-library.com/docs/user-event/intro)** (14.6.1): Simulate user actions.
- **[ts-jest](https://kulshekhar.github.io/ts-jest/)** (29.4.5): TS preprocessor for Jest.
- **[jest-environment-jsdom](https://github.com/jsdom/jsdom)** (30.2.0): DOM emulation for testing.
- **[ESLint](https://eslint.org/)** (8.45.0): Linting and code style.
- **[eslint-config-next](https://nextjs.org/docs/basic-features/eslint)** (14.0.0): Next.js lint config.

---

## Assumptions & Design Notes

- **Latency Data Source**  
  - There is no universally free or CORS-friendly “public latency matrix” API that provides cross-cloud/live pairwise measurements.  
  - This scaffold includes a **mock/simulated latency provider** (see `lib/latencyService.ts`) which is simple to swap for real-world sources (Cloudflare Radar, latencyapi.com, internal APIs, etc.).
  - When demoing with real APIs, ensure endpoints have open CORS and are reliable for repeated polling.

- **Visualization**  
  - The 3D globe is rendered efficiently for desktop; mobile support is experimental.
  - Globe can be switched from a textured sphere to a map-tiles solution (like MapLibre or Mapbox) if finer cartography is required.

- **State Management**  
  - Uses React Context for app-wide settings, and Zustand for UI or chart-specific controls. This offers clarity and low coupling for growing complex apps.

- **Performance and Compatibility**  
  - WebGL required (modern browsers).
  - Designed for education, demo, and prototype use only.

- **Test Coverage**  
  - Core UI and service logic are tested using Jest and React Testing Library. Not all 3D features are covered by default.

- **License**: MIT

---

## Getting Started

1. **Install dependencies**
   ```bash
   npm install



Project Structure & Files of Interest

pages/index.tsx — Main UI layout and controls.
pages/topology.tsx — Alternative topology/network view.
pages/_app.tsx — App wrapper + global context.
components/Map3D.tsx — 3D globe, markers, and animated lines/arcs.
components/ControlsPanel.tsx — UI for filtering/search/selecting servers/providers.
components/LatencyChart.tsx — Historical chart with interactive controls.
components/MetrixDashboard.tsx — At-a-glance metrics display (avg, min, max, trending).
lib/latencyService.ts — Simulated + real-time/historical latency logic and synthetic fallback.
lib/latencyProvider.ts — Pub/sub and history handling for latency events.
lib/appContext.tsx — App-level React context (global UI state).
data/exchanges.ts — Predefined server list, locations, providers.
utils/exportCsv.ts — Helper to export latency logs as CSV.


Running Tests
This project uses Jest and React Testing Library.
To run tests:
Bashnpm test

Review test coverage in the /__tests__/ directory.
