import { mockLatencyService } from '../lib/latencyService';
import { EXCHANGE_SERVERS } from '../data/exchanges';

describe('MockLatencyService', () => {
  beforeEach(() => {
    // Reset the service state before each test
    mockLatencyService.stop();
    mockLatencyService.listeners = [];
    mockLatencyService.history = {};
  });

  describe('start', () => {
    it('should seed history with initial data', () => {
      mockLatencyService.start();
      mockLatencyService.stop();

      const keys = Object.keys(mockLatencyService.history);
      expect(keys.length).toBeGreaterThan(0);

      // Check that history has 62 points (60 + 2 current)
      const firstKey = keys[0];
      expect(mockLatencyService.history[firstKey]).toHaveLength(62);
    });
  });

  describe('getHistory', () => {
    it('should return all history if no sinceTs provided', () => {
      mockLatencyService.start();
      mockLatencyService.stop();

      const from = EXCHANGE_SERVERS[0].id;
      const to = EXCHANGE_SERVERS[1].id;
      const history = mockLatencyService.getHistory(from, to);

      expect(history.length).toBe(62);
      expect(history[0]).toHaveProperty('ts');
      expect(history[0]).toHaveProperty('ms');
    });

    it('should filter history by sinceTs', () => {
      mockLatencyService.start();
      mockLatencyService.stop();

      const from = EXCHANGE_SERVERS[0].id;
      const to = EXCHANGE_SERVERS[1].id;
      const allHistory = mockLatencyService.getHistory(from, to);
      const sinceTs = allHistory[30].ts;

      const filteredHistory = mockLatencyService.getHistory(from, to, sinceTs);

      expect(filteredHistory.length).toBeLessThan(allHistory.length);
      expect(filteredHistory.every(p => p.ts >= sinceTs)).toBe(true);
    });
  });

  describe('subscribe', () => {
    it('should add and remove listeners', () => {
      const callback = jest.fn();
      const unsubscribe = mockLatencyService.subscribe(callback);

      expect(mockLatencyService.listeners).toContain(callback);

      unsubscribe();
      expect(mockLatencyService.listeners).not.toContain(callback);
    });

    it('should call listeners on tick', (done) => {
      const callback = jest.fn();
      mockLatencyService.subscribe(callback);

      mockLatencyService.start();

      setTimeout(() => {
        mockLatencyService.stop();
        expect(callback).toHaveBeenCalled();
        const updates = callback.mock.calls[0][0];
        expect(Array.isArray(updates)).toBe(true);
        expect(updates.length).toBeGreaterThan(0);
        expect(updates[0]).toHaveProperty('from');
        expect(updates[0]).toHaveProperty('to');
        expect(updates[0]).toHaveProperty('ms');
        done();
      }, 100);
    });
  });

  describe('stop', () => {
    it('should clear the timer', () => {
      mockLatencyService.start();
      expect(mockLatencyService.timer).toBeDefined();

      mockLatencyService.stop();
      expect(mockLatencyService.timer).toBeUndefined();
    });
  });

  describe('private methods', () => {
    it('should calculate base distance correctly', () => {
      const a = EXCHANGE_SERVERS[0];
      const b = EXCHANGE_SERVERS[1];
      const distance = (mockLatencyService as any).baseDistance(a, b);

      expect(typeof distance).toBe('number');
      expect(distance).toBeGreaterThan(0);
    });

    it('should generate random latency', () => {
      const a = EXCHANGE_SERVERS[0];
      const b = EXCHANGE_SERVERS[1];
      const latency = (mockLatencyService as any).randomLatency(a, b);

      expect(typeof latency).toBe('number');
      expect(latency).toBeGreaterThan(0);
    });
  });
});
