import { APP_CONFIG } from "./config";
import { FALLBACK_CITIES } from "../data/cities";
import type { BirthLocation } from "../types";

/** Normalize Persian/Arabic digits & ي/ک to Latin for matching */
const normalize = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک");

interface OpenMeteoResult {
  name: string;
  country?: string;
  country_code?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

const fromOpenMeteo = (r: OpenMeteoResult): BirthLocation | null => {
  if (!r.timezone) return null; // we require an IANA timezone
  return {
    name: r.name,
    country: r.country ?? "—",
    countryCode: r.country_code,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
    source: "open-meteo",
  };
};

const searchLocal = (query: string): BirthLocation[] => {
  const q = normalize(query);
  if (q.length < 2) return [];
  return FALLBACK_CITIES.filter(
    (c) =>
      normalize(c.name).includes(q) ||
      (c.nameFa && normalize(c.nameFa).includes(q)) ||
      normalize(c.country).includes(q),
  ).slice(0, APP_CONFIG.geo.maxResults);
};

/**
 * Geocoding service. Primary source: Open-Meteo public geocoding API (no key).
 * Gracefully falls back to the bundled city dataset when offline.
 */
export const searchCities = async (query: string): Promise<BirthLocation[]> => {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const url = `${APP_CONFIG.geo.apiUrl}?name=${encodeURIComponent(trimmed)}&count=${
      APP_CONFIG.geo.maxResults
    }&language=${APP_CONFIG.geo.language}&format=json`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { results?: OpenMeteoResult[] };
    const mapped = (data.results ?? []).map(fromOpenMeteo).filter((x): x is BirthLocation => !!x);
    if (mapped.length > 0) return mapped;
    return searchLocal(trimmed);
  } catch {
    return searchLocal(trimmed);
  }
};
