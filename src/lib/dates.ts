import { toGregorian, toJalaali, jalaaliMonthLength, isValidJalaaliDate } from "jalaali-js";
import type { CalendarKind } from "../types";

export const JALAALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export const GREGORIAN_MONTHS_FA = [
  "ژانویه",
  "فوریه",
  "مارس",
  "آوریل",
  "مه",
  "ژوئن",
  "ژوئیه",
  "اوت",
  "سپتامبر",
  "اکتبر",
  "نوامبر",
  "دسامبر",
];

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Convert any number/string to Persian digits */
export const toFaDigits = (value: number | string): string =>
  String(value).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);

export const formatJalaali = (jy: number, jm: number, jd: number): string =>
  `${toFaDigits(jd)} ${JALAALI_MONTHS[jm - 1]} ${toFaDigits(jy)}`;

export const formatGregorianFa = (gy: number, gm: number, gd: number): string =>
  `${toFaDigits(gd)} ${GREGORIAN_MONTHS_FA[gm - 1]} ${toFaDigits(gy)}`;

export const formatTimeFa = (hour: number, minute: number): string =>
  `${toFaDigits(String(hour).padStart(2, "0"))}:${toFaDigits(String(minute).padStart(2, "0"))}`;

/** Format a degree-within-sign like ۲۳°۱۴′ */
export const formatDegreeInSign = (deg: number): string => {
  const int = Math.floor(deg);
  const minutes = Math.round((deg - int) * 60);
  return `${toFaDigits(int)}°${toFaDigits(String(minutes === 60 ? 0 : minutes).padStart(2, "0"))}′`;
};

/** Resolve any calendar input into both Gregorian and Jalaali triplets. */
export const resolveBirthDate = (
  calendar: CalendarKind,
  year: number,
  month: number,
  day: number,
): {
  gYear: number;
  gMonth: number;
  gDay: number;
  jYear: number;
  jMonth: number;
  jDay: number;
} => {
  if (calendar === "jalaali") {
    const g = toGregorian(year, month, day);
    return { gYear: g.gy, gMonth: g.gm, gDay: g.gd, jYear: year, jMonth: month, jDay: day };
  }
  const j = toJalaali(year, month, day);
  return { gYear: year, gMonth: month, gDay: day, jYear: j.jy, jMonth: j.jm, jDay: j.jd };
};

export const validateJalaali = (jy: number, jm: number, jd: number): string | null => {
  if (jy < 1279 || jy > 1405) return "سال تولد باید بین ۱۲۷۹ تا ۱۴۰۵ باشد.";
  if (jm < 1 || jm > 12) return "ماه نامعتبر است.";
  const maxDay = jalaaliMonthLength(jy, jm);
  if (jd < 1 || jd > maxDay) return `روز نامعتبر است — ${JALAALI_MONTHS[jm - 1]} ${toFaDigits(maxDay)} روز دارد.`;
  if (!isValidJalaaliDate(jy, jm, jd)) return "تاریخ نامعتبر است.";
  const g = toGregorian(jy, jm, jd);
  if (g.gy > new Date().getFullYear() + 1) return "تاریخ تولد نمی‌تواند در آینده باشد.";
  return null;
};

export const validateGregorian = (gy: number, gm: number, gd: number): string | null => {
  if (gy < 1900 || gy > new Date().getFullYear() + 1) return "سال تولد باید بین ۱۹۰۰ تا امروز باشد.";
  const d = new Date(gy, gm - 1, gd);
  if (d.getFullYear() !== gy || d.getMonth() !== gm - 1 || d.getDate() !== gd)
    return "تاریخ نامعتبر است.";
  return null;
};
