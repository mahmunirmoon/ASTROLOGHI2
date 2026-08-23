/**
 * Application configuration layer.
 * Central place for astrology system choices, API endpoints and feature toggles.
 * No secrets are used — all external services are key-less public APIs.
 */
export const APP_CONFIG = {
  version: "1.0.0",

  /** Zodiac reference frame */
  zodiac: "tropical" as const,
  zodiacLabel: "زودیاک استوایی (Tropical)",

  /** House system */
  houseSystem: "placidus" as const,
  houseSystemLabel: "پلاسیدوس (Placidus)",

  /** Calculation engine */
  engineLabel: "Swiss Ephemeris (WebAssembly)",
  ephemerisLabel: "افمرید Moshier (دقت ~0.01 درجه)",

  /** Geocoding — Open-Meteo public API (no API key required) */
  geo: {
    apiUrl: "https://geocoding-api.open-meteo.com/v1/search",
    language: "fa",
    maxResults: 6,
    debounceMs: 350,
  },

  /** Local persistence (birth data is optional & deletable) */
  storageKey: "astroprofile:birthdata:v1",

  /** Feature toggles for future modules */
  features: {
    compatibility: true,
    numerology: true,
    daily: true,
    accounts: false,
    pdfExport: false,
    transits: false,
    solarReturn: false,
  },

  limits: {
    minJalaaliYear: 1279, // 1900 CE
    maxJalaaliYear: 1405, // 2026 CE
  },
} as const;
