/**
 * Interpretation builders. All texts are generated from the computed chart
 * and intentionally use hedged language — astrology is presented as a
 * symbolic language for self-reflection, never as scientific fact.
 */
import { SIGN_BY_KEY, ELEMENT_FA, MODALITY_FA } from "../data/zodiac";
import { PLANET_BY_KEY } from "../data/planets";
import {
  PLANET_IN_SIGN,
  SUN_IN_SIGN,
  MOON_IN_SIGN,
  RISING_IN_SIGN,
  ELEMENT_DESC,
  MODALITY_DESC,
  elementPairText,
} from "../data/interpretations";
import type { AstrologyProfile, Element, PlanetKey, SignKey } from "../types";

const signFa = (k: SignKey) => SIGN_BY_KEY[k].fa;
const signEn = (k: SignKey) => SIGN_BY_KEY[k].en;
const elFa = (e: Element) => ELEMENT_FA[e].label;

const flavor = (planet: PlanetKey, sign: SignKey): string =>
  PLANET_IN_SIGN[planet][signIndex(sign)];

const signIndex = (k: SignKey): number =>
  ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"].indexOf(k);

export interface SectionText {
  id: string;
  titleFa: string;
  en: string;
  text: string;
}

export const personalitySections = (p: AstrologyProfile): SectionText[] => {
  const sun = p.planets.sun;
  const moon = p.planets.moon;
  const mercury = p.planets.mercury;
  const venus = p.planets.venus;
  const mars = p.planets.mars;
  const jupiter = p.planets.jupiter;
  const saturn = p.planets.saturn;
  const domEl = ELEMENT_FA[p.dominantElement];
  const domMod = MODALITY_FA[p.dominantModality];
  const retroMercury = mercury.retrograde
    ? " عطاردِ بازگشتی (رتروگرید) در چارت تولد معمولاً به پردازش درونی‌تر و بازبینیِ فکر پیش از بیان تعبیر می‌شود."
    : "";

  const houseNote = (label: string, house: number | null, sign: SignKey): string =>
    house
      ? `${label} شما در خانه‌ی ${["","اول","دوم","سوم","چهارم","پنجم","ششم","هفتم","هشتم","نهم","دهم","یازدهم","دوازدهم"][house]} قرار دارد و در آسترولوژی این حوزه از زندگی را پررنگ می‌کند.`
      : `${label} شما در ${signFa(sign)} قرار دارد.`;

  return [
    {
      id: "core",
      titleFa: "شخصیت کلی",
      en: "Core Personality",
      text: `خورشید شما در ${signFa(sun.signKey)} (${signEn(sun.signKey)}) است؛ در آسترولوژی این جایگیری معمولاً به عنوان «${flavor("sun", sun.signKey)}» تفسیر می‌شود. عنصر غالب چارت شما ${domEl.label} (${domEl.en}) و حالت غالب، ${domMod.label} است که به این برداشت، رنگ و ریتم ویژه‌ای می‌دهد.`,
    },
    {
      id: "emotions",
      titleFa: "احساسات",
      en: "Emotional World",
      text: `ماه شما در ${signFa(moon.signKey)} قرار دارد و در آسترولوژی، دنیای احساسی فرد را توصیف می‌کند: «${flavor("moon", moon.signKey)}». چنین تعبیر می‌شود که آرامش درونی شما وقتی برمی‌گردد که این نیازِ ماه به شکلی سالم ابراز شود.`,
    },
    {
      id: "communication",
      titleFa: "سبک ارتباطی",
      en: "Communication Style",
      text: `عطارد، سیاره‌ی ارتباط، در ${signFa(mercury.signKey)} است: «${flavor("mercury", mercury.signKey)}».${retroMercury}`,
    },
    {
      id: "love",
      titleFa: "روابط عاطفی",
      en: "Love Style",
      text: `ونوس شما در ${signFa(venus.signKey)} جای گرفته؛ در آسترولوژی این جایگیری معمولاً زبانِ عشق و جاذبه را نشان می‌دهد: «${flavor("venus", venus.signKey)}». ${houseNote("ونوس", venus.house, venus.signKey)}`,
    },
    {
      id: "talents",
      titleFa: "استعدادها",
      en: "Talents",
      text: `مشتری در ${signFa(jupiter.signKey)} معمولاً به عنوان «${flavor("jupiter", jupiter.signKey)}» تفسیر می‌شود؛ ترکیب آن با عطاردِ ${signFa(mercury.signKey)} و مریخِ ${signFa(mars.signKey)} در آسترولوژی استعدادِ ${elFa(SIGN_BY_KEY[mercury.signKey].element)}‌گونه‌ی شما را در حوزه‌ی ${PLANET_BY_KEY.mercury.domainFa} پررنگ می‌داند.`,
    },
    {
      id: "strengths",
      titleFa: "نقاط قوت",
      en: "Strengths",
      text: `بر اساس عنصر غالب (${domEl.label}) و خورشیدِ ${SIGN_BY_KEY[sun.signKey].modality === "cardinal" ? "آغازگر" : SIGN_BY_KEY[sun.signKey].modality === "fixed" ? "باثبات" : "تطبیق‌پذیر"} در ${signFa(sun.signKey)}، در آسترولوژی نقاط قوت شما معمولاً «${SIGN_BY_KEY[sun.signKey].keywordFa}» به اضافه‌ی ظرفیتِ ${domEl.en === "Fire" ? "الهام‌بخشی" : domEl.en === "Earth" ? "ساختن و پایبندی" : domEl.en === "Air" ? "ارتباط و تحلیل" : "همدلی و شهود"} دانسته می‌شود.`,
    },
    {
      id: "challenges",
      titleFa: "چالش‌ها",
      en: "Challenges",
      text: `زحل در ${signFa(saturn.signKey)} معمولاً درسِ اصلی چارت را نشان می‌دهد: «${flavor("saturn", saturn.signKey)}». در این نگاه، چالش‌ها مانع نیستند؛ دعوتِ زحل به صبر و ساختار است و با زمان، به همان نقطه‌ی قوت بدل می‌شوند.`,
    },
    {
      id: "career",
      titleFa: "مسیر شغلی",
      en: "Career Path",
      text: `خورشید در ${signFa(sun.signKey)}${p.mc ? ` و میلاد (MC) در ${signFa(p.mc.signKey)}` : ""} در آسترولوژی مسیر دیده‌شدنِ حرفه‌ای را توصیف می‌کنند؛ ترکیب آن با «${flavor("mercury", mercury.signKey)}» و «${flavor("mars", mars.signKey)}» جهتِ عمومیِ استعداد شغلی را می‌سازد — البته هیچ چارتی مسیر قطعی کسی را تعیین نمی‌کند.`,
    },
    {
      id: "decisions",
      titleFa: "سبک تصمیم‌گیری",
      en: "Decision Making",
      text: `سبک تصمیم‌گیری شما ترکیبی از ذهنِ ${signFa(mercury.signKey)} و قلبِ ${signFa(moon.signKey)} است؛ در آسترولوژی گفته می‌شود وقتی این دو عنصر (${elFa(SIGN_BY_KEY[mercury.signKey].element)} و ${elFa(SIGN_BY_KEY[moon.signKey].element)}) با هم گفتگو کنند، تصمیم‌های شما هم منطقی‌تر و هم آرام‌تر می‌شوند.`,
    },
  ];
};

/* ---------- Big Three ---------- */

export interface BigThreeCard {
  id: "sun" | "moon" | "rising";
  titleFa: string;
  en: string;
  meaningFa: string;
  sign: SignKey;
  text: string;
  interaction: string;
  available: boolean;
}

export const bigThreeCards = (p: AstrologyProfile): BigThreeCard[] => {
  const sun = p.planets.sun;
  const moon = p.planets.moon;
  const sunEl = SIGN_BY_KEY[sun.signKey].element;
  const moonEl = SIGN_BY_KEY[moon.signKey].element;
  const rising = p.ascendant;
  const risingEl = rising ? SIGN_BY_KEY[rising.signKey].element : null;

  return [
    {
      id: "sun",
      titleFa: "خورشید",
      en: "Sun Sign",
      meaningFa: "جوهره‌ی هویت، انرژی حیاتی و مسیری که در آن می‌درخشید.",
      sign: sun.signKey,
      text: SUN_IN_SIGN[signIndex(sun.signKey)],
      interaction: risingEl
        ? `خورشیدِ ${elFa(sunEl)} شما با ماهِ ${elFa(moonEl)} و طالعِ ${elFa(risingEl)} ترکیب می‌شود: ${elementPairText(sunEl, moonEl)}`
        : `خورشیدِ ${elFa(sunEl)} شما با ماهِ ${elFa(moonEl)} ترکیب می‌شود: ${elementPairText(sunEl, moonEl)}`,
      available: true,
    },
    {
      id: "moon",
      titleFa: "ماه",
      en: "Moon Sign",
      meaningFa: "دنیای احساسات، نیازهای درونی و آنچه شما را امن می‌کند.",
      sign: moon.signKey,
      text: MOON_IN_SIGN[signIndex(moon.signKey)],
      interaction: risingEl
        ? `ماه با طالعِ ${elFa(risingEl)} شما رابطه‌ی جالبی دارد: ${elementPairText(moonEl, risingEl)}`
        : "ماه شما لنگرِ احساسی چارت است؛ شناخت نیازهای آن، کلیدِ آرامش درونی شماست.",
      available: true,
    },
    {
      id: "rising",
      titleFa: "طالع",
      en: "Rising / Ascendant",
      meaningFa: "چهره‌ای که دنیا اول می‌بیند؛ سبک ورود شما به تجربه‌ها.",
      sign: rising?.signKey ?? "aries",
      text: rising
        ? RISING_IN_SIGN[signIndex(rising.signKey)]
        : "ساعت تولد ثبت نشده است، بنابراین طالع قابل محاسبه نیست. با افزودن ساعت تولد (حتی تقریبی) این بخش تکمیل می‌شود.",
      interaction: rising && risingEl
        ? `طالع، پلی میان خورشیدِ ${elFa(sunEl)} و نگاه دیگران می‌سازد: ${elementPairText(sunEl, risingEl)}`
        : "برای دیدن این تعامل، ساعت تولد لازم است.",
      available: !!rising,
    },
  ];
};

/* ---------- Relationship profile ---------- */

export const relationshipText = (p: AstrologyProfile): string[] => {
  const venus = p.planets.venus;
  const mars = p.planets.mars;
  const moon = p.planets.moon;
  const seventh = p.houses?.[6] ?? null;
  const out: string[] = [];
  out.push(
    `ونوس در ${signFa(venus.signKey)} زبانِ عشقِ شما را توصیف می‌کند: «${flavor("venus", venus.signKey)}». در آسترولوژی این جایگیری نشان می‌دهد چه چیزی شما را جذب می‌کند و چگونه محبت را ابراز می‌کنید.`,
  );
  out.push(
    `مریخ در ${signFa(mars.signKey)} نحوه‌ی ابراز خواسته و انرژیِ تعقیب را نشان می‌دهد: «${flavor("mars", mars.signKey)}». فاصله‌ی میان سبکِ ونوس و مریخ، به تعبیر آسترولوژیک، داستانِ کششِ شماست.`,
  );
  out.push(
    `ماه در ${signFa(moon.signKey)} نیازِ عاطفیِ عمیق شماست: «${flavor("moon", moon.signKey)}». رابطه‌ای برای شما «خانه» می‌شود که این نیاز را به رسمیت بشناسد.`,
  );
  if (seventh) {
    out.push(
      `خانه‌ی هفتم — خانه‌ی شراکت — در ${signFa(seventh.signKey)} آغاز می‌شود؛ در آسترولوژی گفته می‌شود این جایگیری کیفیتی است که شما در شریک زندگی جستجو می‌کنید: «${SIGN_BY_KEY[seventh.signKey].keywordFa}».`,
    );
  } else {
    out.push("با ثبت ساعت تولد، خانه‌ی هفتم (شراکت) نیز به این تحلیل اضافه می‌شود.");
  }
  return out;
};

/* ---------- Career profile ---------- */

export const careerText = (p: AstrologyProfile): string[] => {
  const sun = p.planets.sun;
  const mercury = p.planets.mercury;
  const mars = p.planets.mars;
  const jupiter = p.planets.jupiter;
  const mc = p.mc;
  const out: string[] = [];
  out.push(
    `خورشید در ${signFa(sun.signKey)} جهتِ کلیِ «دیده‌شدن» شما را می‌سازد: «${flavor("sun", sun.signKey)}». در آسترولوژی چنین تعبیر می‌شود که کاری با شما می‌ماند که به این جوهره اجازه‌ی بیان بدهد.`,
  );
  if (mc) {
    out.push(
      `میلاد (MC) — نقطه‌ی اوج چارت — در ${signFa(mc.signKey)} است و در آسترولوژی سبکِ جایگاه حرفه‌ای و اعتبار اجتماعی شما را توصیف می‌کند: «${SIGN_BY_KEY[mc.signKey].keywordFa}».`,
    );
  } else {
    out.push("با ثبت ساعت تولد، نقطه‌ی میلاد (MC) — شاخصِ مسیر شغلی — به این تحلیل اضافه می‌شود.");
  }
  out.push(
    `عطارد در ${signFa(mercury.signKey)} ابزارِ فکری شماست: «${flavor("mercury", mercury.signKey)}»، و مریخ در ${signFa(mars.signKey)} سوختِ اجرایی: «${flavor("mars", mars.signKey)}».`,
  );
  out.push(
    `مشتری در ${signFa(jupiter.signKey)} معمولاً جایی از زندگی را نشان می‌دهد که رشد و بخت در آن جریان دارد: «${flavor("jupiter", jupiter.signKey)}». البته چارت تولد هیچ موفقیت یا درآمدی را تضمین نمی‌کند؛ فقط استعدادهای نمادین را برجسته می‌کند.`,
  );
  return out;
};
