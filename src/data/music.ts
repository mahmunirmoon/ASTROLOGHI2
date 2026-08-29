/**
 * Background music configuration — one ambient track per page/section.
 *
 * Each track is currently rendered by the generative ambient engine
 * (Web Audio synthesis) so the site ships with real, license-free,
 * mood-matched music and zero binary assets. To use recorded files later,
 * set the optional `file` field to an audio URL (e.g. "/audio/home.mp3") —
 * the engine will automatically switch from synthesis to the file source.
 */

export type TrackId =
  | "night-sky"
  | "zodiac-whisper"
  | "moonlit"
  | "awakening"
  | "cosmic-palace"
  | "twin-stars";

export interface AmbientTrackConfig {
  id: TrackId;
  titleFa: string;
  titleEn: string;
  moodFa: string;
  /** Optional real audio file — replaces synthesis when provided */
  file?: string;

  /* --- generative synthesis parameters --- */
  /** Base frequency (Hz) of the track */
  root: number;
  /** Scale as semitone offsets from root */
  scale: number[];
  /** Pad chord (semitone offsets) */
  chord: number[];
  /** Seconds between arpeggio steps */
  tempo: number;
  pad: { wave: OscillatorType; voices: number; detune: number; level: number };
  /** Low-pass filter cutoff (Hz) — lower = darker */
  filter: number;
  /** LFO speed (Hz) slowly breathing the filter */
  drift: number;
  /** 0..1 chance of a melodic note per step */
  arpProb: number;
  arp: { wave: OscillatorType; level: number };
  /** 0..1 chance of a high sparkle ping per step */
  shimmerProb: number;
  /** Airy noise layer level */
  noise: number;
  delay: { time: number; feedback: number; wet: number };
}

export const MUSIC_TRACKS: Record<TrackId, AmbientTrackConfig> = {
  /* صفحه اصلی — مرموز، آرام و نجومی */
  "night-sky": {
    id: "night-sky",
    titleFa: "نوای آسمان شب",
    titleEn: "Night Sky Drift",
    moodFa: "مرموز · آرام · کیهانی",
    root: 110,
    scale: [0, 3, 5, 7, 10],
    chord: [0, 7, 12],
    tempo: 1.9,
    pad: { wave: "sawtooth", voices: 3, detune: 7, level: 0.16 },
    filter: 720,
    drift: 0.05,
    arpProb: 0.72,
    arp: { wave: "triangle", level: 0.13 },
    shimmerProb: 0.24,
    noise: 0.045,
    delay: { time: 0.42, feedback: 0.46, wet: 0.5 },
  },

  /* آشنایی با آسترولوژی — آموزشی و لطیف */
  "zodiac-whisper": {
    id: "zodiac-whisper",
    titleFa: "زمزمه‌ی برج‌ها",
    titleEn: "Zodiac Whisper",
    moodFa: "آموزشی · لطیف · روشن",
    root: 146.83,
    scale: [0, 2, 3, 7, 9],
    chord: [0, 3, 7, 12],
    tempo: 1.5,
    pad: { wave: "triangle", voices: 3, detune: 5, level: 0.2 },
    filter: 1050,
    drift: 0.07,
    arpProb: 0.8,
    arp: { wave: "sine", level: 0.12 },
    shimmerProb: 0.3,
    noise: 0.03,
    delay: { time: 0.36, feedback: 0.4, wet: 0.44 },
  },

  /* درباره سازنده — ملایم و احساسی */
  moonlit: {
    id: "moonlit",
    titleFa: "نورِ ماه",
    titleEn: "Moonlit",
    moodFa: "ملایم · احساسی · رؤیایی",
    root: 164.81,
    scale: [0, 3, 5, 7, 10],
    chord: [0, 7, 12],
    tempo: 2.6,
    pad: { wave: "sine", voices: 3, detune: 4, level: 0.24 },
    filter: 880,
    drift: 0.04,
    arpProb: 0.5,
    arp: { wave: "sine", level: 0.1 },
    shimmerProb: 0.42,
    noise: 0.025,
    delay: { time: 0.55, feedback: 0.52, wet: 0.6 },
  },

  /* شروع تحلیل / فرم تولد — الهام‌بخش و عمیق */
  awakening: {
    id: "awakening",
    titleFa: "بیداری ستاره",
    titleEn: "Awakening",
    moodFa: "الهام‌بخش · عمیق · رو به اوج",
    root: 98,
    scale: [0, 2, 4, 7, 9],
    chord: [0, 4, 7, 12],
    tempo: 1.15,
    pad: { wave: "sawtooth", voices: 4, detune: 8, level: 0.15 },
    filter: 1300,
    drift: 0.08,
    arpProb: 0.85,
    arp: { wave: "triangle", level: 0.14 },
    shimmerProb: 0.28,
    noise: 0.04,
    delay: { time: 0.33, feedback: 0.42, wet: 0.45 },
  },

  /* نتایج و گزارش — آرام، لوکس و کیهانی */
  "cosmic-palace": {
    id: "cosmic-palace",
    titleFa: "کاخ کهکشان",
    titleEn: "Cosmic Palace",
    moodFa: "لوکس · کیهانی · با‌شکوه",
    root: 110,
    scale: [0, 2, 4, 7, 9],
    chord: [0, 4, 7, 12],
    tempo: 1.7,
    pad: { wave: "sawtooth", voices: 5, detune: 9, level: 0.13 },
    filter: 1000,
    drift: 0.045,
    arpProb: 0.68,
    arp: { wave: "triangle", level: 0.12 },
    shimmerProb: 0.46,
    noise: 0.05,
    delay: { time: 0.47, feedback: 0.5, wet: 0.55 },
  },

  /* سازگاری دو نفر — گرم و رمانتیک */
  "twin-stars": {
    id: "twin-stars",
    titleFa: "رقص دو ستاره",
    titleEn: "Twin Stars",
    moodFa: "گرم · رمانتیک · صمیمی",
    root: 130.81,
    scale: [0, 2, 4, 7, 9],
    chord: [0, 4, 12],
    tempo: 1.4,
    pad: { wave: "triangle", voices: 4, detune: 6, level: 0.18 },
    filter: 1100,
    drift: 0.06,
    arpProb: 0.78,
    arp: { wave: "sine", level: 0.13 },
    shimmerProb: 0.32,
    noise: 0.035,
    delay: { time: 0.38, feedback: 0.44, wet: 0.5 },
  },
};

/** Route → default track mapping */
export const ROUTE_TRACKS: Array<{ prefix: string; track: TrackId }> = [
  { prefix: "/wizard", track: "awakening" },
  { prefix: "/profile", track: "cosmic-palace" },
  { prefix: "/compatibility", track: "twin-stars" },
];

export const trackForPath = (pathname: string): TrackId => {
  const hit = ROUTE_TRACKS.find((r) => pathname.startsWith(r.prefix));
  return hit ? hit.track : "night-sky";
};

/** In-page zones on the Home page → track overrides (scroll-driven) */
export const HOME_ZONES: Array<{ zone: string; track: TrackId }> = [
  { zone: "home", track: "night-sky" },
  { zone: "astronomy-101", track: "zodiac-whisper" },
  { zone: "about-creator", track: "moonlit" },
];
