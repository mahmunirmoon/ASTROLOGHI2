import type { Element, Modality, SignKey, ZodiacSignInfo } from "../types";

export const ZODIAC_SIGNS: ZodiacSignInfo[] = [
  { key: "aries", fa: "حمل (بره)", en: "Aries", glyph: "♈", element: "fire", modality: "cardinal", keywordFa: "شجاعت و شروع", dateRangeFa: "۱ فروردین – ۳۱ فروردین" },
  { key: "taurus", fa: "ثور (گاو)", en: "Taurus", glyph: "♉", element: "earth", modality: "fixed", keywordFa: "ثبات و لذت", dateRangeFa: "۱ اردیبهشت – ۱۱ خرداد" },
  { key: "gemini", fa: "جوزا (دوپیکر)", en: "Gemini", glyph: "♊", element: "air", modality: "mutable", keywordFa: "کنجکاوی و گفتگو", dateRangeFa: "۱ خرداد – ۳۱ خرداد" },
  { key: "cancer", fa: "سرطان (خرچنگ)", en: "Cancer", glyph: "♋", element: "water", modality: "cardinal", keywordFa: "احساس و ریشه", dateRangeFa: "۱ تیر – ۳۱ تیر" },
  { key: "leo", fa: "اسد (شیر)", en: "Leo", glyph: "♌", element: "fire", modality: "fixed", keywordFa: "خلاقیت و درخشش", dateRangeFa: "۱ مرداد – ۳۱ مرداد" },
  { key: "virgo", fa: "سنبله (خوشه)", en: "Virgo", glyph: "♍", element: "earth", modality: "mutable", keywordFa: "دقت و تحلیل", dateRangeFa: "۱ شهریور – ۳۱ شهریور" },
  { key: "libra", fa: "میزان (ترازو)", en: "Libra", glyph: "♎", element: "air", modality: "cardinal", keywordFa: "تعادل و زیبایی", dateRangeFa: "۱ مهر – ۳۰ مهر" },
  { key: "scorpio", fa: "عقرب (کژدم)", en: "Scorpio", glyph: "♏", element: "water", modality: "fixed", keywordFa: "عمق و تحول", dateRangeFa: "۱ آبان – ۳۰ آبان" },
  { key: "sagittarius", fa: "قوس (کماندار)", en: "Sagittarius", glyph: "♐", element: "fire", modality: "mutable", keywordFa: "سفر و معنا", dateRangeFa: "۱ آذر – ۳۰ آذر" },
  { key: "capricorn", fa: "جدی (بُز)", en: "Capricorn", glyph: "♑", element: "earth", modality: "cardinal", keywordFa: "نظم و بلندپروازی", dateRangeFa: "۱ دی – ۳۰ دی" },
  { key: "aquarius", fa: "دلو (آبریز)", en: "Aquarius", glyph: "♒", element: "air", modality: "fixed", keywordFa: "نوآوری و استقلال", dateRangeFa: "۱ بهمن – ۳۰ بهمن" },
  { key: "pisces", fa: "حوت (ماهی)", en: "Pisces", glyph: "♓", element: "water", modality: "mutable", keywordFa: "رؤیا و شهود", dateRangeFa: "۱ اسفند – ۲۹ اسفند" },
];

export const SIGN_BY_KEY: Record<SignKey, ZodiacSignInfo> = Object.fromEntries(
  ZODIAC_SIGNS.map((s) => [s.key, s]),
) as Record<SignKey, ZodiacSignInfo>;

export const signIndex = (key: SignKey): number => ZODIAC_SIGNS.findIndex((s) => s.key === key);

export const ELEMENT_FA: Record<Element, { label: string; glyph: string; color: string; en: string }> = {
  fire: { label: "آتش", glyph: "🔥", color: "#f08a4b", en: "Fire" },
  earth: { label: "خاک", glyph: "🌍", color: "#8ec97e", en: "Earth" },
  air: { label: "باد", glyph: "💨", color: "#7cc7d8", en: "Air" },
  water: { label: "آب", glyph: "💧", color: "#6f9bf0", en: "Water" },
};

export const MODALITY_FA: Record<Modality, { label: string; color: string; en: string }> = {
  cardinal: { label: "کاردینال (آغازگر)", color: "#e6c56a", en: "Cardinal" },
  fixed: { label: "فیکسد (ثابت)", color: "#9987db", en: "Fixed" },
  mutable: { label: "میوتیبل (تغییرپذیر)", color: "#7cc7d8", en: "Mutable" },
};

export const normalizeLongitude = (deg: number): number => ((deg % 360) + 360) % 360;

export const longitudeToSign = (longitude: number) => {
  const lon = normalizeLongitude(longitude);
  const idx = Math.floor(lon / 30);
  return {
    sign: ZODIAC_SIGNS[idx],
    signIndex: idx,
    degreeInSign: lon - idx * 30,
  };
};
