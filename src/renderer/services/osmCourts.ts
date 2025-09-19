// Service for fetching pickleball courts from OpenStreetMap via Overpass API
// Includes in-memory caching keyed by rounded lat/lon + radius
import { reverseGeocode } from './geocode';

export interface Court {
  id: string;
  name?: string;
  displayName: string; // Resolved name or fallback label
  address?: string; // Human-readable address composed from tags
  latitude: number;
  longitude: number;
  source: 'osm';
  surface?: string;
  lighting?: boolean;
  covered?: boolean;
  rawTags: Record<string, string>;
}

interface OverpassElement {
  id: number;
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

interface TimeoutInit extends RequestInit { timeoutMs?: number }
async function fetchWithTimeout(resource: string, init: TimeoutInit = {}): Promise<Response> {
  const { timeoutMs = 20000, signal, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const composite = signal ? new AbortController() : controller;
  if (signal) signal.addEventListener('abort', () => composite.abort(), { once: true });
  try {
    return await fetch(resource, { ...rest, signal: composite.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Simple in-memory cache
interface CacheEntry { courts: Court[]; timestamp: number; }
const courtCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function cacheKey(lat: number, lon: number, radius: number) {
  // Round to ~2 decimal places (~1.1km) so nearby searches reuse results
  const rLat = lat.toFixed(2);
  const rLon = lon.toFixed(2);
  return `${rLat}|${rLon}|${radius}`;
}

function mapElement(e: OverpassElement): Court | null {
  const lat = e.lat ?? e.center?.lat;
  const lon = e.lon ?? e.center?.lon;
  if (lat == null || lon == null) return null;
  const tags = e.tags || {};
  // Build a best-effort display name
  const name = tags.name || tags['facility'] || undefined;
  let displayName = name || 'Unnamed Court';
  if (!name) {
    // Try constructing something from context
    if (tags.operator) displayName = `Court @ ${tags.operator}`;
    else if (tags['addr:street']) displayName = `Court @ ${tags['addr:street']}`;
  }
  const addressParts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:city'],
    tags['addr:state'] || tags['addr:province'],
    tags['addr:postcode']
  ].filter(Boolean);
  const address = addressParts.length ? addressParts.join(', ') : undefined;
  return {
    id: `osm-${e.type}-${e.id}`,
    name: tags.name,
    displayName,
    address,
    latitude: lat,
    longitude: lon,
    source: 'osm',
    surface: tags.surface,
    lighting: tags.lit === 'yes',
    covered: tags.covered === 'yes',
    rawTags: tags
  };
}

function dedupe(courts: Court[]): Court[] {
  const map = new Map<string, Court>();
  for (const c of courts) {
    const key = `${c.name ?? ''}|${c.latitude.toFixed(5)}|${c.longitude.toFixed(5)}`;
    if (!map.has(key)) map.set(key, c);
  }
  return Array.from(map.values());
}

export async function fetchCourtsByLatLon(lat: number, lon: number, radiusMeters = 20000, abortSignal?: AbortSignal): Promise<Court[]> {
  const key = cacheKey(lat, lon, radiusMeters);
  const now = Date.now();
  const existing = courtCache.get(key);
  if (existing && now - existing.timestamp < CACHE_TTL_MS) {
    return existing.courts;
  }

  const query = `\n[out:json][timeout:25];\n(\n  node["leisure"="pitch"]["sport"="pickleball"](around:${radiusMeters},${lat},${lon});\n  way["leisure"="pitch"]["sport"="pickleball"](around:${radiusMeters},${lat},${lon});\n  relation["leisure"="pitch"]["sport"="pickleball"](around:${radiusMeters},${lat},${lon});\n  node["sport"="pickleball"](around:${radiusMeters},${lat},${lon});\n  way["sport"="pickleball"](around:${radiusMeters},${lat},${lon});\n  relation["sport"="pickleball"](around:${radiusMeters},${lat},${lon});\n);\nout center tags;`;

  const body = new URLSearchParams({ data: query });
  const res = await fetchWithTimeout('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: abortSignal,
    timeoutMs: 25000
  });
  if (!res.ok) throw new Error(`Overpass error: ${res.status} ${res.statusText}`);
  const json: OverpassResponse = await res.json();

  const courts = dedupe(json.elements.map(mapElement).filter((c): c is Court => !!c));

  // Hybrid enrichment: reverse geocode clusters of unnamed courts (limit 8 lookups)
  const unnamed = courts.filter(c => c.displayName === 'Unnamed Court' || (!c.name && !c.address));
  const clusterKeys = Array.from(new Set(unnamed.map(c => `${c.latitude.toFixed(3)}|${c.longitude.toFixed(3)}`))).slice(0, 8);
  for (const ck of clusterKeys) {
    if (abortSignal?.aborted) break;
    const [clat, clon] = ck.split('|');
    try {
      const place = await reverseGeocode(parseFloat(clat), parseFloat(clon), abortSignal);
      if (place) {
        courts
          .filter(c => c.latitude.toFixed(3) === clat && c.longitude.toFixed(3) === clon && c.displayName === 'Unnamed Court')
          .forEach(c => { c.displayName = `Pickleball Court – ${place}`; });
      }
    } catch {
      // ignore reverse geocode failures per cluster
    }
  }

  courtCache.set(key, { courts, timestamp: now });
  return courts;
}

export function clearCourtCache() { courtCache.clear(); }
