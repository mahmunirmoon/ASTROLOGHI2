/* ---------- Data models for AstroProfile AI ---------- */

export type Element = "fire" | "earth" | "air" | "water";
export type Modality = "cardinal" | "fixed" | "mutable";

export type SignKey =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export type PlanetKey =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export interface ZodiacSignInfo {
  key: SignKey;
  fa: string;
  en: string;
  glyph: string;
  element: Element;
  modality: Modality;
  keywordFa: string;
  dateRangeFa: string;
}

export interface BirthLocation {
  name: string;
  nameFa?: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  source: "open-meteo" | "local";
}

export type CalendarKind = "jalaali" | "gregorian";

export interface UserBirthData {
  firstName: string;
  lastName: string;
  calendar: CalendarKind;
  /** Gregorian birth date (always resolved) */
  gYear: number;
  gMonth: number;
  gDay: number;
  /** Jalaali (Solar Hijri) birth date (always resolved) */
  jYear: number;
  jMonth: number;
  jDay: number;
  timeUnknown: boolean;
  hour: number;
  minute: number;
  location: BirthLocation;
}

export interface PlanetPosition {
  planet: PlanetKey;
  /** Absolute ecliptic longitude 0–360 (tropical) */
  longitude: number;
  signKey: SignKey;
  signIndex: number;
  /** Degree within the sign 0–30 */
  degreeInSign: number;
  /** 1–12, null when birth time is unknown */
  house: number | null;
  retrograde: boolean;
  speedPerDay: number;
}

export interface AnglePoint {
  name: "ascendant" | "mc";
  longitude: number;
  signKey: SignKey;
  degreeInSign: number;
}

export interface HouseCusp {
  house: number;
  longitude: number;
  signKey: SignKey;
  degreeInSign: number;
}

export interface ChartAspect {
  p1: PlanetKey;
  p2: PlanetKey;
  type: AspectType;
  angle: number;
  orb: number;
}

export interface BalanceEntry {
  count: number;
  percent: number;
}

export interface AstrologyProfile {
  birth: UserBirthData;
  engine: string;
  ephemeris: string;
  zodiac: "tropical";
  houseSystem: "placidus";
  /** UTC instant of birth, ms since epoch */
  utcMs: number;
  /** Local wall-clock label in the birth timezone */
  localTimeLabel: string;
  planets: Record<PlanetKey, PlanetPosition>;
  ascendant: AnglePoint | null;
  mc: AnglePoint | null;
  houses: HouseCusp[] | null;
  /** Friendly reason when house/ascendant calculation is unavailable */
  housesError?: string;
  aspects: ChartAspect[];
  elementBalance: Record<Element, BalanceEntry>;
  modalityBalance: Record<Modality, BalanceEntry>;
  dominantElement: Element;
  dominantModality: Modality;
}

/* ---------- Numerology ---------- */

export interface NumerologyNumber {
  key: "lifePath" | "name" | "personality" | "destiny";
  labelFa: string;
  labelEn: string;
  value: number;
  isMaster: boolean;
  breakdown: string;
}

export interface NumerologyProfile {
  system: string;
  numbers: NumerologyNumber[];
}

/* ---------- Daily ---------- */

export interface DailyProfile {
  dateJalaali: string;
  dateGregorian: string;
  sunSign: SignKey;
  moonSign: SignKey;
  messages: string[];
}

/* ---------- Compatibility ---------- */

export interface CompatibilityInput {
  name: string;
  gYear: number;
  gMonth: number;
  gDay: number;
  timeUnknown: boolean;
  hour: number;
  minute: number;
  location: BirthLocation;
}

export interface CompatibilityResult {
  personA: string;
  personB: string;
  scores: {
    emotional: number;
    communication: number;
    attraction: number;
    overall: number;
  };
  sunSummary: string;
  moonSummary: string;
  venusMarsSummary: string;
  ascendantSummary: string | null;
  strengths: string[];
  challenges: string[];
  aspects: string[];
}

/* ---------- Errors ---------- */

export class AstroError extends Error {
  faMessage: string;
  constructor(faMessage: string) {
    super(faMessage);
    this.faMessage = faMessage;
  }
}
