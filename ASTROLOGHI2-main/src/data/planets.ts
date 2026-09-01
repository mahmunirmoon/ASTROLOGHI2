import type { PlanetKey } from "../types";

export interface PlanetInfo {
  key: PlanetKey;
  fa: string;
  en: string;
  glyph: string;
  /** Domain of meaning used in interpretations */
  domainFa: string;
  color: string;
}

export const PLANETS: PlanetInfo[] = [
  { key: "sun", fa: "خورشید", en: "Sun", glyph: "☉", domainFa: "هویت و جوهره‌ی وجودی", color: "#e6c56a" },
  { key: "moon", fa: "ماه", en: "Moon", glyph: "☽", domainFa: "احساسات و دنیای درون", color: "#cfd6f0" },
  { key: "mercury", fa: "عطارد", en: "Mercury", glyph: "☿", domainFa: "ذهن، ارتباط و یادگیری", color: "#7cc7d8" },
  { key: "venus", fa: "زهره", en: "Venus", glyph: "♀", domainFa: "عشق، ارزش‌ها و زیبایی", color: "#9987db" },
  { key: "mars", fa: "مریخ", en: "Mars", glyph: "♂", domainFa: "انرژی، عمل و اراده", color: "#f08a4b" },
  { key: "jupiter", fa: "مشتری", en: "Jupiter", glyph: "♃", domainFa: "رشد، بخت و معنا", color: "#f0d98f" },
  { key: "saturn", fa: "زحل", en: "Saturn", glyph: "♄", domainFa: "درس‌ها، ساختار و زمان", color: "#8a90ba" },
  { key: "uranus", fa: "اورانوس", en: "Uranus", glyph: "♅", domainFa: "تغییر، بیداری و نوآوری", color: "#6fe0d8" },
  { key: "neptune", fa: "نپتون", en: "Neptune", glyph: "♆", domainFa: "رؤیا، شهود و الهام", color: "#6f9bf0" },
  { key: "pluto", fa: "پلوتو", en: "Pluto", glyph: "♇", domainFa: "تحول، قدرت و بازسازی", color: "#c99ae0" },
];

export const PLANET_BY_KEY: Record<PlanetKey, PlanetInfo> = Object.fromEntries(
  PLANETS.map((p) => [p.key, p]),
) as Record<PlanetKey, PlanetInfo>;

export const ASPECT_FA: Record<string, { label: string; en: string; angle: number; color: string; orb: number; nature: "harmonious" | "challenging" | "neutral" }> = {
  conjunction: { label: "مقارنه", en: "Conjunction", angle: 0, color: "#e6c56a", orb: 8, nature: "neutral" },
  sextile: { label: "تسدیس", en: "Sextile", angle: 60, color: "#7cc7d8", orb: 5, nature: "harmonious" },
  square: { label: "تربیع", en: "Square", angle: 90, color: "#e07a6f", orb: 7, nature: "challenging" },
  trine: { label: "تثلیث", en: "Trine", angle: 120, color: "#8ec97e", orb: 8, nature: "harmonious" },
  opposition: { label: "تقابل", en: "Opposition", angle: 180, color: "#b3a7e8", orb: 8, nature: "challenging" },
};
