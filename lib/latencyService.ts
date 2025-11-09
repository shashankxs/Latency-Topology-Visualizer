import { EXCHANGE_SERVERS, ExchangeServer } from "../data/exchanges";

type PairKey = string; // `${fromId}__${toId}`

type LatencyPoint = {
    ts: number;
    ms: number;
};

export type LatencyUpdate = {
    from: string;
    to: string;
    ms: number;
};

class MockLatencyService {
    interval = 5000;
    listeners: ((updates: LatencyUpdate[]) => void)[] = [];
    history: Record<PairKey, LatencyPoint[]> = {};

    start() {
        // seed history
        if (Object.keys(this.history).length === 0) {
            const now = Date.now();
            for (let i = 0; i < EXCHANGE_SERVERS.length; i++) {
                for (let j = 0; j < EXCHANGE_SERVERS.length; j++) {
                    if (i === j) continue;
                    const key = this.key(EXCHANGE_SERVERS[i].id, EXCHANGE_SERVERS[j].id);
                    this.history[key] = [];
                    // generate 60 points over the last 60 intervals
                    for (let k = 60; k >= 0; k--) {
                        this.history[key].push({
                            ts: now - k * this.interval,
                            ms: this.randomLatency(EXCHANGE_SERVERS[i], EXCHANGE_SERVERS[j])
                        });
                    }
                }
            }
        }

        this.tick();
    }

    stop() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = undefined;
        }
    }

    private _timer?: NodeJS.Timeout;

    // Getter for testing purposes
    get timer(): NodeJS.Timeout | undefined {
        return this._timer;
    }

    private tick() {
        const updates: LatencyUpdate[] = [];

        for (let i = 0; i < EXCHANGE_SERVERS.length; i++) {
            for (let j = 0; j < EXCHANGE_SERVERS.length; j++) {
                if (i === j) continue;
                const from = EXCHANGE_SERVERS[i];
                const to = EXCHANGE_SERVERS[j];
                const ms = this.randomLatency(from, to);
                const key = this.key(from.id, to.id);
                const point = { ts: Date.now(), ms };
                this.history[key].push(point);
                // keep history bounded
                if (this.history[key].length > 500) this.history[key].shift();
                updates.push({ from: from.id, to: to.id, ms });
            }
        }

        // broadcast
        this.listeners.forEach((l) => l(updates));

        // schedule next
        this._timer = setTimeout(() => this.tick(), this.interval);
    }

    subscribe(cb: (updates: LatencyUpdate[]) => void) {
        this.listeners.push(cb);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== cb);
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

    private baseDistance(a: ExchangeServer, b: ExchangeServer) {
        // simple haversine to approximate distance in km
        const toRad = (d: number) => (d * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(b.latitude - a.latitude);
        const dLon = toRad(b.longitude - a.longitude);
        const lat1 = toRad(a.latitude);
        const lat2 = toRad(b.latitude);
        const sinDlat = Math.sin(dLat / 2);
        const sinDlon = Math.sin(dLon / 2);
        const v =
            sinDlat * sinDlat +
            Math.cos(lat1) * Math.cos(lat2) * sinDlon * sinDlon;
        const c = 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v));
        return R * c;
    }

    private randomLatency(a: ExchangeServer, b: ExchangeServer) {
        // base by distance and provider mismatch (simplified)
        const distKm = this.baseDistance(a, b);
        // base latency ms = propagation approx (5us per km -> 0.005 ms per km) but add routing overhead
        const base = Math.max(5, distKm * 0.6 + Math.random() * 30);
        // bias by different cloud providers (extra hop)
        let providerPenalty = 0;
        if (a.provider !== b.provider) providerPenalty = 8 + Math.random() * 20;
        return Math.round(base + providerPenalty);
    }
}

export const mockLatencyService = new MockLatencyService();
