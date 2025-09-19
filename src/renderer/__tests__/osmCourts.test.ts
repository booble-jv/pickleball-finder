import { fetchCourtsByLatLon } from '../services/osmCourts';

// NOTE: This is a lightweight test that mocks fetch to validate mapping/dedup logic.

describe('fetchCourtsByLatLon', () => {
  const originalFetch = global.fetch;

  afterEach(() => { global.fetch = originalFetch; });

  it('maps and dedupes courts', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        elements: [
          { id: 1, type: 'node', lat: 10, lon: 20, tags: { name: 'Court A', surface: 'asphalt', lit: 'yes' } },
          { id: 2, type: 'node', lat: 10, lon: 20, tags: { name: 'Court A', surface: 'asphalt', lit: 'yes' } }, // dup
          { id: 3, type: 'way', center: { lat: 11, lon: 21 }, tags: { name: 'Court B', covered: 'yes' } }
        ]
      })
    }) as unknown as typeof fetch;

    const courts = await fetchCourtsByLatLon(10, 20, 1000);
    expect(courts.length).toBe(2);
    const names = courts.map(c => c.displayName).sort();
    expect(names).toEqual(['Court A', 'Court B']);
    // address and displayName fallback behavior (no address data in mock)
    courts.forEach(c => {
      expect(c.displayName.length).toBeGreaterThan(0);
    });
  });
});
