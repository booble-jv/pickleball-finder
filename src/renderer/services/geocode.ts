// Simple geocoding helper using Nominatim (OpenStreetMap)
// Adds a small in-memory cache to reduce duplicate lookups.

export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
}

// Generic timeout wrapper for fetch
interface TimeoutInit extends RequestInit { timeoutMs?: number }
async function fetchWithTimeout(resource: string | URL, init: TimeoutInit = {}): Promise<Response> {
  const { timeoutMs = 15000, signal, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const composite = signal ? new AbortController() : controller;
  if (signal) {
    signal.addEventListener('abort', () => composite.abort(), { once: true });
  }
  try {
    return await fetch(resource, { ...rest, signal: composite.signal });
  } finally {
    clearTimeout(timer);
  }
}

// forward geocode cache (string -> GeocodeResult)
const geocodeCache = new Map<string, GeocodeResult>();
const GEOCODE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
interface CacheEntry { value: GeocodeResult; timestamp: number; }
const internalCache = new Map<string, CacheEntry>();

export async function geocodeLocation(query: string, abortSignal?: AbortSignal): Promise<GeocodeResult | null> {
  const key = query.toLowerCase().trim();
  const now = Date.now();
  const existing = internalCache.get(key);
  if (existing && now - existing.timestamp < GEOCODE_TTL_MS) return existing.value;

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  const res = await fetchWithTimeout(url.toString(), {
    headers: { 'Accept': 'application/json', 'User-Agent': 'PickleballFinder/1.0 (youremail@example.com)' },
    signal: abortSignal,
    timeoutMs: 15000
  });
  if (!res.ok) throw new Error(`Geocode failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const first = data[0];
  const result: GeocodeResult = { lat: parseFloat(first.lat), lon: parseFloat(first.lon), displayName: first.display_name };
  internalCache.set(key, { value: result, timestamp: now });
  return result;
}

// Reverse geocoding with clustering cache (latRounded|lonRounded -> place string)
interface ReverseCacheEntry { value: string; timestamp: number; }
const reverseCache = new Map<string, ReverseCacheEntry>();
const REVERSE_TTL_MS = GEOCODE_TTL_MS;

export async function reverseGeocode(lat: number, lon: number, abortSignal?: AbortSignal): Promise<string | null> {
  const key = `${lat.toFixed(3)}|${lon.toFixed(3)}`; // cluster to ~100m
  const now = Date.now();
  const existing = reverseCache.get(key);
  if (existing && now - existing.timestamp < REVERSE_TTL_MS) return existing.value;

  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'json');
  url.searchParams.set('zoom', '16');
  url.searchParams.set('addressdetails', '1');

  const res = await fetchWithTimeout(url.toString(), {
    headers: { 'Accept': 'application/json', 'User-Agent': 'PickleballFinder/1.0 (youremail@example.com)' },
    signal: abortSignal,
    timeoutMs: 15000
  });
  if (!res.ok) return null;
  const data = await res.json();
  const place: string | undefined = data?.name || data?.display_name?.split(',')[0];
  if (!place) return null;
  reverseCache.set(key, { value: place, timestamp: now });
  return place;
}

export function clearGeocodeCaches() {
  geocodeCache.clear();
  internalCache.clear();
  reverseCache.clear();
}
