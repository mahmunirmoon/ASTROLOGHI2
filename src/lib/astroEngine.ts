/**
 * Astrology calculation service — Swiss Ephemeris (WebAssembly).
 *
 * All astronomical positions (geocentric ecliptic longitudes, house cusps,
 * ascendant, midheaven, speeds) come from the Swiss Ephemeris with the
 * built-in Moshier ephemeris (~0.01° precision). Tropical zodiac.
 * No data here is invented — only computed.
 */
import { SwissEphemeris, Planet, HouseSystem, CalculationFlag } from "@swisseph/browser";
import { DateTime } from "luxon";
import { toJalaali } from "jalaali-js";

import { APP_CONFIG } from "./config";
import { normalizeLongitude, longitudeToSign, SIGN_BY_KEY } from "../data/zodiac";
import { computeAspects, angularSeparation } from "./aspects";
import { formatTimeFa, toFaDigits, JALAALI_MONTHS } from "./dates";
import type {
  AstrologyProfile,
  BalanceEntry,
  ChartAspect,
  DailyProfile,
  Element,
  HouseCusp,
  Modality,
  PlanetKey,
  PlanetPosition,
  UserBirthData,
  AnglePoint,
} from "../types";
import { AstroError } from "../types";

const CDN_WASM = "https://cdn.jsdelivr.net/npm/@swisseph/browser@1.3.1/dist/swisseph.wasm";

let enginePromise: Promise<SwissEphemeris> | null = null;

/** Lazy singleton with a CDN fallback for the WASM binary. */
export const getEngine = (): Promise<SwissEphemeris> => {
  if (!enginePromise) {
    enginePromise = (async () => {
      const engine = new SwissEphemeris();
      try {
        await engine.init();
      } catch {
        try {
          await engine.init(CDN_WASM);
        } catch {
          enginePromise = null;
          throw new AstroError(
            "بارگذاری موتور محاسبات نجومی ناموفق بود. لطفاً اتصال اینترنت را بررسی و دوباره تلاش کنید.",
          );
        }
      }
      return engine;
    })();
  }
  return enginePromise;
};

const PLANET_ENUM: Record<PlanetKey, Planet> = {
  sun: Planet.Sun,
  moon: Planet.Moon,
  mercury: Planet.Mercury,
  venus: Planet.Venus,
  mars: Planet.Mars,
  jupiter: Planet.Jupiter,
  saturn: Planet.Saturn,
  uranus: Planet.Uranus,
  neptune: Planet.Neptune,
  pluto: Planet.Pluto,
};

const PLANET_ORDER: PlanetKey[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];

/** Convert local wall-clock birth data into a UTC instant using the city's IANA timezone. */
export const birthUtcInstant = (birth: UserBirthData): number => {
  const hour = birth.timeUnknown ? 12 : birth.hour;
  const minute = birth.timeUnknown ? 0 : birth.minute;
  const dt = DateTime.fromObject(
    { year: birth.gYear, month: birth.gMonth, day: birth.gDay, hour, minute, second: 0 },
    { zone: birth.location.timezone },
  );
  if (!dt.isValid)
    throw new AstroError("منطقه‌ی زمانی شهر انتخابی نامعتبر است. لطفاً شهر دیگری از فهرست انتخاب کنید.");
  return dt.toMillis();
};

const anglePoint = (longitude: number, name: "ascendant" | "mc"): AnglePoint => {
  const lon = normalizeLongitude(longitude);
  const info = longitudeToSign(lon);
  return { name, longitude: lon, signKey: info.sign.key, degreeInSign: info.degreeInSign };
};

const houseOfLongitude = (lon: number, cusps: number[]): number => {
  for (let h = 1; h <= 12; h++) {
    const start = cusps[h - 1];
    const end = cusps[h % 12];
    const size = (end - start + 360) % 360;
    const pos = (lon - start + 360) % 360;
    if (pos < size) return h;
  }
  return 1;
};

export const computeProfile = async (birth: UserBirthData): Promise<AstrologyProfile> => {
  const swe = await getEngine();
  const utcMs = birthUtcInstant(birth);
  const jd = swe.dateToJulianDay(new Date(utcMs));

  /* ---- Planets ---- */
  const planets = {} as Record<PlanetKey, PlanetPosition>;
  for (const key of PLANET_ORDER) {
    try {
      const raw = swe.calculatePosition(
        jd,
        PLANET_ENUM[key],
        CalculationFlag.MoshierEphemeris | CalculationFlag.Speed,
      );
      const longitude = normalizeLongitude(raw.longitude);
      const info = longitudeToSign(longitude);
      planets[key] = {
        planet: key,
        longitude,
        signKey: info.sign.key,
        signIndex: info.signIndex,
        degreeInSign: info.degreeInSign,
        house: null,
        retrograde: key !== "sun" && key !== "moon" && raw.longitudeSpeed < 0,
        speedPerDay: raw.longitudeSpeed,
      };
    } catch {
      throw new AstroError(`محاسبه‌ی موقعیت سیاره‌ی ${key} ناموفق بود. لطفاً دوباره تلاش کنید.`);
    }
  }

  /* ---- Houses & angles (only meaningful with a birth time) ---- */
  let houses: HouseCusp[] | null = null;
  let ascendant: AnglePoint | null = null;
  let mc: AnglePoint | null = null;
  let housesError: string | undefined;

  if (!birth.timeUnknown) {
    try {
      const raw = swe.calculateHouses(
        jd,
        birth.location.latitude,
        birth.location.longitude,
        HouseSystem.Placidus,
      );
      const cuspArr = raw.cusps.length >= 13 ? raw.cusps.slice(1, 13) : raw.cusps.slice(-12);
      const normalized = cuspArr.map(normalizeLongitude);
      houses = normalized.map((longitude, i) => {
        const info = longitudeToSign(longitude);
        return { house: i + 1, longitude, signKey: info.sign.key, degreeInSign: info.degreeInSign };
      });
      ascendant = anglePoint(raw.ascendant, "ascendant");
      mc = anglePoint(raw.mc, "mc");
      for (const key of PLANET_ORDER) {
        planets[key].house = houseOfLongitude(planets[key].longitude, normalized);
      }
    } catch {
      housesError =
        "محاسبه‌ی خانه‌ها برای این عرض جغرافیایی با سیستم پلاسیدوس ممکن نشد؛ چارت بدون خانه نمایش داده می‌شود.";
    }
  } else {
    housesError = "بدون ساعت تولد، طالع (Ascendant) و خانه‌ها قابل محاسبه نیستند.";
  }

  /* ---- Aspects ---- */
  const aspects: ChartAspect[] = computeAspects(PLANET_ORDER.map((k) => planets[k]));

  /* ---- Element & modality balance (10 planets + ascendant when known) ---- */
  const elementCount: Record<Element, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalityCount: Record<Modality, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  const countSign = (signKey: PlanetPosition["signKey"]) => {
    const s = SIGN_BY_KEY[signKey];
    elementCount[s.element] += 1;
    modalityCount[s.modality] += 1;
  };
  for (const key of PLANET_ORDER) countSign(planets[key].signKey);
  if (ascendant) countSign(ascendant.signKey);
  const total = PLANET_ORDER.length + (ascendant ? 1 : 0);

  const toBalance = (c: number): BalanceEntry => ({
    count: c,
    percent: Math.round((c / total) * 1000) / 10,
  });

  const elementBalance = {
    fire: toBalance(elementCount.fire),
    earth: toBalance(elementCount.earth),
    air: toBalance(elementCount.air),
    water: toBalance(elementCount.water),
  };
  const modalityBalance = {
    cardinal: toBalance(modalityCount.cardinal),
    fixed: toBalance(modalityCount.fixed),
    mutable: toBalance(modalityCount.mutable),
  };

  const dominantElement = (Object.keys(elementCount) as Element[]).reduce((a, b) =>
    elementCount[b] > elementCount[a] ? b : a,
  );
  const dominantModality = (Object.keys(modalityCount) as Modality[]).reduce((a, b) =>
    modalityCount[b] > modalityCount[a] ? b : a,
  );

  /* ---- Local time label ---- */
  const localDt = DateTime.fromMillis(utcMs).setZone(birth.location.timezone);
  const j = toJalaali(localDt.year, localDt.month, localDt.day);
  const localTimeLabel = birth.timeUnknown
    ? `${toFaDigits(j.jd)} ${JALAALI_MONTHS[j.jm - 1]} ${toFaDigits(j.jy)} — ساعت: ۱۲:۰۰ (تقریبی، ساعت تولد نامشخص)`
    : `${toFaDigits(j.jd)} ${JALAALI_MONTHS[j.jm - 1]} ${toFaDigits(j.jy)} — ${formatTimeFa(
        localDt.hour,
        localDt.minute,
      )} به وقت محلی (${localDt.offsetNameShort ?? birth.location.timezone})`;

  return {
    birth,
    engine: APP_CONFIG.engineLabel,
    ephemeris: APP_CONFIG.ephemerisLabel,
    zodiac: APP_CONFIG.zodiac,
    houseSystem: APP_CONFIG.houseSystem,
    utcMs,
    localTimeLabel,
    planets,
    ascendant,
    mc,
    houses,
    housesError,
    aspects,
    elementBalance,
    modalityBalance,
    dominantElement,
    dominantModality,
  };
};

/* ---------- Daily transits (computed for today, never invented) ---------- */

export const computeDaily = async (profile: AstrologyProfile): Promise<DailyProfile> => {
  const swe = await getEngine();
  const now = DateTime.now().setZone(profile.birth.location.timezone);
  const noon = now.set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
  const jd = swe.dateToJulianDay(noon.toJSDate());

  const sunRaw = swe.calculatePosition(jd, Planet.Sun, CalculationFlag.MoshierEphemeris);
  const moonRaw = swe.calculatePosition(jd, Planet.Moon, CalculationFlag.MoshierEphemeris);
  const sunSign = longitudeToSign(normalizeLongitude(sunRaw.longitude)).sign;
  const moonSign = longitudeToSign(normalizeLongitude(moonRaw.longitude)).sign;

  const messages: string[] = [];
  messages.push(
    `امروز خورشید در ${sunSign.fa} ${sunSign.glyph} حرکت می‌کند؛ در آسترولوژی گفته می‌شود انرژی کلی روز با «${sunSign.keywordFa}» هم‌راستاست.`,
  );
  messages.push(
    `ماه امروز در ${moonSign.fa} ${moonSign.glyph} است و به تعبیر آسترولوژیک، رنگِ احساسی ساعات را «${moonSign.keywordFa}» می‌کند.`,
  );

  const checkAspect = (transitLon: number, natalLon: number, transitName: string, natalName: string) => {
    const sep = angularSeparation(transitLon, natalLon);
    const candidates: Array<[string, number, string]> = [
      ["مقارنه با", 0, "روز پررنگی برای موضوعات این جایگیری است"],
      ["تثلیث با", 120, "جریان امروز با این بخش از چارت شما هم‌صداست"],
      ["تسدیس با", 60, "فرصت‌های کوچک ارتباطی در مسیرند"],
      ["تربیع با", 90, "ممکن است کمی اصطکاک و دعوت به اقدام حس کنید"],
      ["تقابل با", 180, "روز خوبی برای دیدنِ دو سوی یک ماجراست"],
    ];
    for (const [label, angle, note] of candidates) {
      if (Math.abs(sep - angle) <= 6) {
        messages.push(`ماه/خورشیدِ امروز در حال ${label} ${natalName} تولد شماست؛ ${note}.`);
        return true;
      }
    }
    void transitName;
    return false;
  };
  checkAspect(moonRaw.longitude, profile.planets.sun.longitude, "ماه", "خورشید");
  checkAspect(moonRaw.longitude, profile.planets.moon.longitude, "ماه", "ماه");
  checkAspect(sunRaw.longitude, profile.planets.moon.longitude, "خورشید", "ماه");

  const j = toJalaali(now.year, now.month, now.day);
  return {
    dateJalaali: `${toFaDigits(j.jd)} ${JALAALI_MONTHS[j.jm - 1]} ${toFaDigits(j.jy)}`,
    dateGregorian: now.toFormat("yyyy/MM/dd"),
    sunSign: sunSign.key,
    moonSign: moonSign.key,
    messages: messages.slice(0, 4),
  };
};
