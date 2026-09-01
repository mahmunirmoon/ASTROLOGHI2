/**
 * Synastry (compatibility) heuristics.
 * Scores are symbolic entertainment heuristics derived from element
 * affinities and cross-aspects — never a prediction of relationship success.
 */
import { computeProfile } from "./astroEngine";
import { angularSeparation } from "./aspects";
import { resolveBirthDate } from "./dates";
import { SIGN_BY_KEY } from "../data/zodiac";
import type {
  AstrologyProfile,
  CompatibilityInput,
  CompatibilityResult,
  Element,
  UserBirthData,
} from "../types";

const ELEMENT_AFFINITY: Record<Element, Record<Element, number>> = {
  fire: { fire: 88, earth: 52, air: 90, water: 55 },
  earth: { fire: 52, earth: 84, air: 62, water: 90 },
  air: { fire: 90, earth: 62, air: 85, water: 58 },
  water: { fire: 55, earth: 90, air: 58, water: 86 },
};

const clamp = (n: number) => Math.max(30, Math.min(98, Math.round(n)));

const inputToBirth = (input: CompatibilityInput): UserBirthData => {
  const resolved = resolveBirthDate("gregorian", input.gYear, input.gMonth, input.gDay);
  return {
    firstName: input.name,
    lastName: "",
    calendar: "gregorian",
    ...resolved,
    timeUnknown: input.timeUnknown,
    hour: input.hour,
    minute: input.minute,
    location: input.location,
  };
};

const crossAspects = (a: AstrologyProfile, b: AstrologyProfile): { harmonious: string[]; challenging: string[] } => {
  const pairs: Array<["sun" | "moon" | "venus" | "mars" | "mercury", "sun" | "moon" | "venus" | "mars" | "mercury"]> = [
    ["sun", "sun"],
    ["sun", "moon"],
    ["moon", "moon"],
    ["moon", "sun"],
    ["venus", "mars"],
    ["mars", "venus"],
    ["venus", "venus"],
    ["mercury", "mercury"],
    ["mercury", "moon"],
    ["sun", "venus"],
  ];
  const harmonious: string[] = [];
  const challenging: string[] = [];
  const faName: Record<string, string> = { sun: "خورشید", moon: "ماه", venus: "زهره", mars: "مریخ", mercury: "عطارد" };
  for (const [ka, kb] of pairs) {
    const sep = angularSeparation(a.planets[ka].longitude, b.planets[kb].longitude);
    const checks: Array<[string, number, "h" | "c"]> = [
      ["مقارنه", 0, "h"],
      ["تثلیث", 120, "h"],
      ["تسدیس", 60, "h"],
      ["تربیع", 90, "c"],
      ["تقابل", 180, "c"],
    ];
    for (const [label, angle, kind] of checks) {
      if (Math.abs(sep - angle) <= 7) {
        const text = `${faName[ka]}ِ ${a.birth.firstName} در ${label} با ${faName[kb]}ِ ${b.birth.firstName}`;
        if (kind === "h") harmonious.push(text);
        else challenging.push(text);
        break;
      }
    }
  }
  return { harmonious, challenging };
};

export const computeCompatibility = async (
  profileA: AstrologyProfile,
  inputB: CompatibilityInput,
): Promise<CompatibilityResult> => {
  const profileB = await computeProfile(inputToBirth(inputB));

  const e = (p: AstrologyProfile, k: "sun" | "moon" | "venus" | "mars"): Element =>
    SIGN_BY_KEY[p.planets[k].signKey].element;

  const sunScore = ELEMENT_AFFINITY[e(profileA, "sun")][e(profileB, "sun")];
  const moonScore = ELEMENT_AFFINITY[e(profileA, "moon")][e(profileB, "moon")];
  const venusMars =
    (ELEMENT_AFFINITY[e(profileA, "venus")][e(profileB, "mars")] +
      ELEMENT_AFFINITY[e(profileA, "mars")][e(profileB, "venus")]) /
    2;
  const mercury = ELEMENT_AFFINITY[SIGN_BY_KEY[profileA.planets.mercury.signKey].element][
    SIGN_BY_KEY[profileB.planets.mercury.signKey].element
  ];

  const { harmonious, challenging } = crossAspects(profileA, profileB);
  const aspectBonus = clamp(60 + harmonious.length * 6 - challenging.length * 4);

  const emotional = clamp(moonScore * 0.6 + venusMars * 0.2 + aspectBonus * 0.2);
  const communication = clamp(mercury * 0.6 + sunScore * 0.2 + aspectBonus * 0.2);
  const attraction = clamp(venusMars * 0.6 + sunScore * 0.2 + aspectBonus * 0.2);
  const overall = clamp(emotional * 0.35 + communication * 0.25 + attraction * 0.4);

  const bothAsc = profileA.ascendant && profileB.ascendant;
  const ascendantSummary = bothAsc
    ? `طالع‌های ${SIGN_BY_KEY[profileA.ascendant!.signKey].fa} و ${SIGN_BY_KEY[profileB.ascendant!.signKey].fa} — در آسترولوژی، رابطه‌ی این دو عنصر (${
        ELEMENT_AFFINITY[SIGN_BY_KEY[profileA.ascendant!.signKey].element][SIGN_BY_KEY[profileB.ascendant!.signKey].element] >= 70
          ? "گرم و روان"
          : "جالب اما نیازمند درک متقابل"
      }) توصیف می‌شود.`
    : null;

  return {
    personA: profileA.birth.firstName,
    personB: inputB.name,
    scores: { emotional, communication, attraction, overall },
    sunSummary: `خورشیدهای ${SIGN_BY_KEY[profileA.planets.sun.signKey].fa} و ${SIGN_BY_KEY[profileB.planets.sun.signKey].fa} — عنصرِ مشترکِ هویت شما ${
      sunScore >= 80 ? "هم‌جنس است و در آسترولوژی هم‌زبانیِ بالایی دارد" : sunScore >= 62 ? "متفاوت اما مکمل دانسته می‌شود" : "متفاوت است و نیازمندِ گفتگوی آگاهانه‌تر"
    }.`,
    moonSummary: `ماه‌های ${SIGN_BY_KEY[profileA.planets.moon.signKey].fa} و ${SIGN_BY_KEY[profileB.planets.moon.signKey].fa} — نیازهای عاطفی شما در این نگاه ${
      moonScore >= 80 ? "بسیار هم‌سوست" : moonScore >= 62 ? "با کمی ترجمه، قابل درک متقابل است" : "متفاوت است و صبر می‌خواهد"
    }.`,
    venusMarsSummary: `زهره و مریخ دو طرف — زبانِ جاذبه و ابراز علاقه — امتیاز نمادین ${Math.round(venusMars)} از ۱۰۰ گرفت.`,
    ascendantSummary,
    strengths:
      harmonious.length > 0
        ? harmonious.map((h) => `${h} — در سیناستری معمولاً جریانِ طبیعی و حمایت متقابل تفسیر می‌شود.`)
        : ["حتی بدون زاویه‌ی کلاسیک، آشناییِ عنصری میان چارت‌ها می‌تواند پلِ ارتباط باشد."],
    challenges:
      challenging.length > 0
        ? challenging.map((c) => `${c} — در سیناستری معمولاً دعوت به گفتگو و رشد مشترک تفسیر می‌شود، نه بن‌بست.`)
        : ["زاویه‌ی چالش‌برانگیزِ برجسته‌ای دیده نشد؛ البته هر رابطه‌ای چالش‌های واقعیِ خودش را دارد."],
    aspects: [...harmonious, ...challenging],
  };
};
