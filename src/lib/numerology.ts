/**
 * Numerology service.
 *
 * Systems used (clearly separated from the astrology engine):
 *  - Life Path: Western numerology on the Gregorian date of birth.
 *  - Name / Destiny / Personality numbers:
 *      • Latin names  → Pythagorean letter values (A=1 … I=9, J=1 …).
 *      • Persian names → documented Abjad-e Kabir letter values, each reduced
 *        to a single digit (ی=۱۰→۱، ک=۲۰→۲، …). Persian letters پ/چ/ژ/گ take the
 *        value of their nearest Abjad counterpart (ب/ج/ز/ک), a standard convention.
 *  - Personality number uses consonants only (Persian vowels: ا و ی / Latin: A E I O U).
 */
import type { NumerologyNumber, NumerologyProfile } from "../types";
import { toFaDigits } from "./dates";

const PYTHAGOREAN: Record<string, number> = {};
"abcdefghijklmnopqrstuvwxyz".split("").forEach((ch, i) => {
  PYTHAGOREAN[ch] = (i % 9) + 1;
});
const LATIN_VOWELS = new Set(["a", "e", "i", "o", "u"]);

/** Abjad-e Kabir values reduced to a single digit */
const ABJAD: Record<string, number> = {
  ا: 1, آ: 1, أ: 1, إ: 1, ء: 1,
  ب: 2, پ: 2,
  ج: 3, چ: 3,
  د: 4,
  ه: 5, ة: 5, ۀ: 5,
  و: 6, ؤ: 6,
  ز: 7, ژ: 7,
  ح: 8,
  ط: 9,
  ی: 1, ي: 1, ئ: 1, // ۱۰ → ۱
  ک: 2, ك: 2, گ: 2, // ۲۰ → ۲
  ل: 3, // ۳۰ → ۳
  م: 4, // ۴۰ → ۴
  ن: 5, // ۵۰ → ۵
  س: 6, // ۶۰ → ۶
  ع: 7, // ۷۰ → ۷
  ف: 8, // ۸۰ → ۸
  ص: 9, // ۹۰ → ۹
  ق: 1, // ۱۰۰ → ۱
  ر: 2, // ۲۰۰ → ۲
  ش: 3, // ۳۰۰ → ۳
  ت: 4, // ۴۰۰ → ۴
  ث: 5, // ۵۰۰ → ۵
  خ: 6, // ۶۰۰ → ۶
  ذ: 7, // ۷۰۰ → ۷
  ض: 8, // ۸۰۰ → ۸
  ظ: 9, // ۹۰۰ → ۹
  غ: 1, // ۱۰۰۰ → ۱
};
const PERSIAN_VOWELS = new Set(["ا", "آ", "أ", "إ", "و", "ی", "ي"]);

const isPersian = (s: string) => /[\u0600-\u06FF]/.test(s);

const digitSum = (n: number): number =>
  String(n)
    .split("")
    .reduce((acc, d) => acc + Number(d), 0);

const MASTER_NUMBERS = new Set([11, 22, 33]);

const reduce = (n: number): number => {
  let v = n;
  while (v > 9 && !MASTER_NUMBERS.has(v)) v = digitSum(v);
  return v;
};

const sumName = (name: string, consonantsOnly: boolean): number => {
  let total = 0;
  const persian = isPersian(name);
  for (const raw of name) {
    const ch = raw.toLowerCase();
    if (persian) {
      if (consonantsOnly && PERSIAN_VOWELS.has(ch)) continue;
      total += ABJAD[ch] ?? 0;
    } else {
      if (!/[a-z]/.test(ch)) continue;
      if (consonantsOnly && LATIN_VOWELS.has(ch)) continue;
      total += PYTHAGOREAN[ch] ?? 0;
    }
  }
  return total;
};

const fmtReduction = (total: number): string => {
  const steps: number[] = [total];
  let v = total;
  while (v > 9 && !MASTER_NUMBERS.has(v)) {
    v = digitSum(v);
    steps.push(v);
  }
  return toFaDigits(steps.join(" ← "));
};

export const computeNumerology = (
  firstName: string,
  lastName: string,
  gYear: number,
  gMonth: number,
  gDay: number,
): NumerologyProfile => {
  const dateSum = digitSum(gYear) + digitSum(gMonth) + digitSum(gDay);
  const lifePath = reduce(dateSum);

  const full = `${firstName} ${lastName}`.trim();
  const nameSum = sumName(full, false);
  const personalitySum = sumName(full, true);
  const firstSum = sumName(firstName.trim(), false);

  const numbers: NumerologyNumber[] = [
    {
      key: "lifePath",
      labelFa: "عدد مسیر زندگی",
      labelEn: "Life Path",
      value: lifePath,
      isMaster: MASTER_NUMBERS.has(lifePath),
      breakdown: `جمع ارقام تاریخ تولد میلادی: ${toFaDigits(dateSum)} ← ${fmtReduction(dateSum)}`,
    },
    {
      key: "name",
      labelFa: "عدد نام",
      labelEn: "Name Number",
      value: reduce(firstSum || 1),
      isMaster: MASTER_NUMBERS.has(reduce(firstSum || 1)),
      breakdown: `جمع ارزش عددی حروف نام: ${toFaDigits(firstSum)} ← ${fmtReduction(firstSum || 1)}`,
    },
    {
      key: "personality",
      labelFa: "عدد شخصیت",
      labelEn: "Personality",
      value: reduce(personalitySum || 1),
      isMaster: MASTER_NUMBERS.has(reduce(personalitySum || 1)),
      breakdown: `جمع ارزش عددی حروف بی‌واک (صامت): ${toFaDigits(personalitySum)} ← ${fmtReduction(
        personalitySum || 1,
      )}`,
    },
    {
      key: "destiny",
      labelFa: "عدد سرنوشت",
      labelEn: "Destiny",
      value: reduce(nameSum || 1),
      isMaster: MASTER_NUMBERS.has(reduce(nameSum || 1)),
      breakdown: `جمع ارزش عددی همه‌ی حروف نام کامل: ${toFaDigits(nameSum)} ← ${fmtReduction(nameSum || 1)}`,
    },
  ];

  return {
    system: isPersian(full)
      ? "ابجد (Abjad) — ارزش عددی حروف ابجد کبیر با تقلیل به تک‌رقم"
      : "فیتاغورثی (Pythagorean) — ارزش عددی حروف لاتین",
    numbers,
  };
};
