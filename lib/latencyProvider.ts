
import { EXCHANGE_SERVERS, ExchangeServer } from "../data/exchanges";

type PairKey = string;

export type LatencyPoint = {
  ts: number;
  ms: number;
};

export type LatencyUpdate = {
  from: string;
  to: string;
  ms: number;
};


type Subscriber = (updates: LatencyUpdate[]) => void;

// simple haversine distance
function haversine(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const sinDlat = Math.sin(dLat / 2);
  const sinDlon = Math.sin(dLon / 2);
  const v = sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon * sinDlon;
  const c = 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v));
  return R * c;
}

// Small per-host cache to avoid redundant calls within TTL
const HOST_CACHE_TTL_MS = 4000;
const hostCache = new Map<string, { ts: number; ms: number }>();

// attempt to fetch latency from latencyapi.com; extract host from URL
async function probeUrl(url: string, timeoutMs = 2500): Promise<number> {
  const host = new URL(url).hostname;

  // cache check
  const cached = hostCache.get(host);
  const now = Date.now();
  if (cached && now - cached.ts < HOST_CACHE_TTL_MS) {
    return cached.ms;
  }

  const apiUrl = `https://latencyapi.com/ping?host=${encodeURIComponent(host)}`;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(apiUrl, {
      cache: "no-store",
      credentials: "omit",
      mode: "cors",
      signal: controller.signal
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json().catch(() => ({} as any));
    const latency = typeof data?.latency === "number" ? data.latency : NaN;
    if (! Number.isFinite(latency) || latency <= 0) {
      throw new Error("Invalid latency data");
    }

    const ms = Math.max(1, Math.round(latency));
    hostCache.set(host, { ts: now, ms });
    return ms;
  } finally {
    clearTimeout(id);
  }
}

// Lightweight concurrency limiter
async function withConcurrency<T>(items: T[], limit: number, worker: (item: T, idx: number) => Promise<void>) {
  const executing: Promise<void>[] = [];
  for (let i = 0; i < items.length; i++) {
    const p = worker(items[i], i);
    executing.push(p);
    if (executing.length >= limit) {
      await Promise.race(executing).catch(() => undefined);
      // remove settled
      for (let j = executing.length - 1; j >= 0; j--) {
        if ((executing[j] as any).settled) continue;
      }
      // compact by filtering settled promises
      for (let k = executing.length - 1; k >= 0; k--) {
        if ((executing[k] as any).__done__) {
          executing.splice(k, 1);
        }
      }
    }
    // mark completion
    p.then(() => ((p as any).__done__ = true), () => ((p as any).__done__ = true));
  }
  // await remaining
  await Promise.allSettled(executing);
}

class ProbeLatencyService {
  interval = 5000;
  subscribers: Subscriber[] = [];
  history: Record<PairKey, LatencyPoint[]> = {};
  private _timer: number | undefined;
  private running = false;
  private ticking = false; // prevent overlapping ticks

  start() {
    if (this.running) return;
    this.running = true;

    // seed history for pairs
    const now = Date.now();
    for (let i = 0; i < EXCHANGE_SERVERS.length; i++) {
      for (let j = 0; j < EXCHANGE_SERVERS.length; j++) {
        if (i === j) continue;
        const key = this.key(EXCHANGE_SERVERS[i].id, EXCHANGE_SERVERS[j].id);
        if (!this.history[key]) {
          this.history[key] = [];
          for (let k = 60; k >= 0; k--) {
            const ts = now - k * this.interval;
            const ms = this.syntheticLatency(EXCHANGE_SERVERS[i], EXCHANGE_SERVERS[j]);
            this.history[key].push({ ts, ms });
          }
        }
      }
    }

    this.tick();
  }

  stop() {
    this.running = false;
    if (this._timer !== undefined) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }

  subscribe(cb: Subscriber) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  getHistory(from: string, to: string, sinceTs?: number) {
    const key = this.key(from, to);
    const h = this.history[key] || [];
    if (!sinceTs) return h;
    return h.filter((p) => p.ts >= sinceTs);
  }

  private key(a: string, b: string) {
    return `${a}__${b}`;
  }

  private async tick() {
    if (this.ticking) {
      // prevent overlap; schedule next
      if (this.running) {
        this._timer = window.setTimeout(() => this.tick(), this.interval) as unknown as number;
      }
      return;
    }
    this.ticking = true;

    const updates: LatencyUpdate[] = [];

    // Build task list once
    type Task = { from: ExchangeServer; to: ExchangeServer; probeHosts: string[] };
    const tasks: Task[] = [];

    for (let i = 0; i < EXCHANGE_SERVERS.length; i++) {
      for (let j = 0; j < EXCHANGE_SERVERS.length; j++) {
        if (i === j) continue;
        const from = EXCHANGE_SERVERS[i];
        const to = EXCHANGE_SERVERS[j];

        // If you later add probes?: string[] to ExchangeServer, safely combine and dedupe here.
        const candidates = new Set<string>();
        // Example (uncomment when probes exist):
        // (from.probes ?? []).forEach((u) => candidates.add(u));
        // (to.probes ?? []).forEach((u) => candidates.add(u));

        tasks.push({ from, to, probeHosts: Array.from(candidates) });
      }
    }

    // Worker executes per pair
    const worker = async (task: Task) => {
      const { from, to, probeHosts } = task;
      let ms: number | null = null;

      // Probe through candidates if any; else use synthetic
      for (const url of probeHosts) {
        try {
          const rtt = await probeUrl(url, 2000);
          ms = rtt;
          break;
        } catch {
          // try next candidate
        }
      }

      if (ms === null) {
        ms = this.syntheticLatency(from, to);
      }

      const key = this.key(from.id, to.id);
      const point = { ts: Date.now(), ms };
      if (!this.history[key]) this.history[key] = [];
      this.history[key].push(point);
      if (this.history[key].length > 1500) this.history[key].shift();

      updates.push({ from: from.id, to: to.id, ms });
    };

    // Constrain concurrency; 10 is conservative for browsers
    try {
      await withConcurrency(tasks, 10, worker);
    } catch {
      // swallow; demo-friendly
    }

    if (updates.length) {
      // Notify subscribers
      this.subscribers.forEach((s) => {
        try {
          s(updates);
        } catch {
          // ignore subscriber errors
        }
      });
    }

    this.ticking = false;

    if (this.running) {
      this._timer = window.setTimeout(() => this.tick(), this.interval) as unknown as number;
    }
  }

  private syntheticLatency(a: ExchangeServer, b: ExchangeServer) {
    const distKm = haversine(a, b);
    // Base: distance-based + small noise
    const base = Math.max(5, distKm * 0.6 + Math.random() * 20);
    // Cross-provider penalty to simulate inter-cloud paths
    const providerPenalty = a.provider !== b.provider ? 8 + Math.random() * 18 : 0;
    return Math.round(base + providerPenalty);
  }
}

export const latencyProvider = new ProbeLatencyService();
