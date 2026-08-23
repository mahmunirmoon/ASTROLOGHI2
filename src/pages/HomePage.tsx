import { Link } from "react-router-dom";
import { Sparkles, CircleDot, BrainCircuit, Hash, ArrowLeft, BookOpen, Orbit, Compass } from "lucide-react";
import Reveal from "../components/Reveal";
import { ZODIAC_SIGNS, ELEMENT_FA } from "../data/zodiac";
import { PLANETS } from "../data/planets";
import { APP_CONFIG } from "../lib/config";

/** Decorative rotating birth-chart hero visual */
const HeroWheel = () => (
  <div className="relative mx-auto aspect-square w-full max-w-[520px]" aria-hidden="true">
    <div className="absolute inset-0 animate-spin-slower">
      <svg viewBox="0 0 400 400" className="h-full w-full">
        <circle cx="200" cy="200" r="196" fill="none" stroke="rgba(212,175,55,0.35)" strokeWidth="1" strokeDasharray="2 8" />
        <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(212,175,55,0.5)" strokeWidth="1.2" />
        <circle cx="200" cy="200" r="108" fill="none" stroke="rgba(153,135,219,0.45)" strokeWidth="1" />
        <circle cx="200" cy="200" r="64" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1" strokeDasharray="4 6" />
        {ZODIAC_SIGNS.map((s, i) => {
          const a = ((i * 30 - 90 + 15) * Math.PI) / 180;
          const x = 200 + 134 * Math.cos(a);
          const y = 200 + 134 * Math.sin(a);
          return (
            <text key={s.key} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="20" fill={ELEMENT_FA[s.element].color} opacity="0.9" className="glyph">
              {s.glyph}
            </text>
          );
        })}
        {[18, 74, 130, 205, 262, 318].map((deg, i) => {
          const a = ((deg - 90) * Math.PI) / 180;
          const x = 200 + 86 * Math.cos(a);
          const y = 200 + 86 * Math.sin(a);
          return (
            <g key={deg}>
              <circle cx={x} cy={y} r={i % 2 ? 4 : 5.5} fill={PLANETS[i].color} opacity="0.95" />
              <circle cx={x} cy={y} r={i % 2 ? 9 : 12} fill="none" stroke={PLANETS[i].color} opacity="0.28" />
            </g>
          );
        })}
        <line x1="40" y1="200" x2="360" y2="200" stroke="rgba(230,197,106,0.3)" strokeWidth="0.8" />
        <line x1="200" y1="40" x2="200" y2="360" stroke="rgba(153,135,219,0.3)" strokeWidth="0.8" />
      </svg>
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="glass flex h-40 w-40 flex-col items-center justify-center rounded-full animate-floaty">
        <span className="glyph text-4xl text-gold-300 text-glow-gold">☉</span>
        <span className="font-display mt-1 text-lg text-ink-50">چارت تولد</span>
        <span className="font-latin text-[9px] tracking-[0.35em] text-ink-500">NATAL CHART</span>
      </div>
    </div>
    <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(127,108,201,0.14),transparent_65%)]" />
  </div>
);

const FEATURES = [
  {
    icon: CircleDot,
    num: "۰۱",
    title: "چارت تولد",
    en: "Birth Chart",
    color: "#e6c56a",
    text: "نقشه‌ی دقیق آسمان لحظه‌ی تولد شما — موقعیت ده سیاره در دوازده برج، خانه‌ها و زوایای اصلی، محاسبه‌شده با Swiss Ephemeris.",
  },
  {
    icon: BrainCircuit,
    num: "۰۲",
    title: "تحلیل شخصیت",
    en: "Personality Reading",
    color: "#9987db",
    text: "سه‌گانه‌ی اصلی (خورشید، ماه، طالع)، تحلیل عنصر و حالت غالب، و نه بخش تفسیر شخصیتی با زبان نمادین آسترولوژی.",
  },
  {
    icon: Hash,
    num: "۰۳",
    title: "عددشناسی",
    en: "Numerology",
    color: "#7cc7d8",
    text: "عدد مسیر زندگی، عدد نام، شخصیت و سرنوشت — با جدول مستند ابجد برای نام‌های فارسی و فیتاغورثی برای لاتین.",
  },
];

const HomePage = () => {
  return (
    <div className="relative">
      {/* ============ HERO ============ */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-2 lg:pt-40">
        <div className="animate-fade-up">
          <p className="font-latin text-xs font-semibold tracking-[0.45em] text-gold-500/80">
            NATAL CHART · PERSONAL ASTROLOGY
          </p>
          <h1 className="font-display mt-5 text-5xl leading-[1.15] text-ink-50 sm:text-6xl lg:text-7xl">
            چارت تولد خود را
            <span className="block text-gold-300 text-glow-gold">کشف کنید</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-ink-400">
            با وارد کردن اطلاعات تولد، نقشه آسمان لحظه تولد خود را ببینید و پروفایل شخصی آسترولوژی خود را دریافت
            کنید.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link to="/wizard" className="btn-gold text-base">
              <Sparkles className="h-5 w-5" />
              شروع تحلیل
            </Link>
            <a href="#about" className="btn-ghost text-base">
              <BookOpen className="h-5 w-5" />
              آشنایی با آسترولوژی
            </a>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-mystic-600/20 pt-6">
            {[
              ["۱۰", "سیاره و نور"],
              ["۱۲", "برج و خانه"],
              ["۵", "زاویه‌ی اصلی"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd className="font-display text-3xl text-gold-300">{v}</dd>
                <dd className="mt-1 text-xs text-ink-500">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Reveal delay={150}>
          <HeroWheel />
        </Reveal>
      </section>

      {/* Zodiac glyph strip */}
      <div className="border-y border-gold-500/10 bg-night-900/40 py-4">
        <div className="glyph flex justify-center gap-6 overflow-hidden text-2xl text-ink-600 sm:gap-10">
          {ZODIAC_SIGNS.map((s) => (
            <span key={s.key} className="transition-colors hover:text-gold-400" title={`${s.fa} · ${s.en}`}>
              {s.glyph}
            </span>
          ))}
        </div>
      </div>

      {/* ============ FEATURES ============ */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal>
          <p className="font-latin text-[11px] font-semibold tracking-[0.42em] text-gold-500/80">WHAT YOU GET</p>
          <h2 className="font-display mt-2 text-3xl text-ink-50 sm:text-4xl">آنچه از آسمانِ تولدتان می‌خوانیم</h2>
          <div className="gold-line mt-4 w-24" />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 130}>
              <article
                className="glass group relative h-full overflow-hidden rounded-xl p-7 transition-all duration-300 hover:-translate-y-1.5"
                style={{ borderColor: `${f.color}30` }}
              >
                <span className="font-latin absolute -top-2 left-4 text-7xl font-bold opacity-[0.06]" style={{ color: f.color }}>
                  {f.num}
                </span>
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-lg border"
                  style={{ color: f.color, borderColor: `${f.color}45`, background: `${f.color}12` }}
                >
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="font-display mt-5 text-2xl text-ink-50">{f.title}</h3>
                <p className="font-latin mt-1 text-[10px] tracking-[0.3em]" style={{ color: f.color }}>
                  {f.en.toUpperCase()}
                </p>
                <p className="mt-4 text-sm leading-7 text-ink-400">{f.text}</p>
                <Link
                  to="/wizard"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                  style={{ color: f.color }}
                >
                  شروع کنید
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <div>
              <p className="font-latin text-[11px] font-semibold tracking-[0.42em] text-gold-500/80">ASTROLOGY 101</p>
              <h2 className="font-display mt-2 text-3xl leading-snug text-ink-50 sm:text-4xl">
                آسترولوژی چیست و چارت تولد چه می‌گوید؟
              </h2>
              <div className="gold-line mt-4 w-24" />
              <div className="mt-6 space-y-5 text-sm leading-8 text-ink-400">
                <p>
                  آسترولوژی یک زبان نمادین چند هزار ساله است که آرایش سیارات در لحظه‌ی تولد هر فرد را آینه‌ای از
                  الگوهای شخصیتی او می‌داند. چارت تولد (Natal Chart) نقشه‌ای دایره‌ای از موقعیت واقعی سیارات در
                  آسمانِ همان دقیقه و همان مکان است — یک داده‌ی نجومی واقعی، که تفسیرش نمادین است.
                </p>
                <p>
                  سه نقطه‌ی کلیدی چارت — <strong className="text-gold-300">خورشید</strong> (هویت و جوهره)،{" "}
                  <strong className="text-mystic-300">ماه</strong> (احساسات و نیازهای درونی) و{" "}
                  <strong className="text-airx-400">طالع یا رایزینگ</strong> (چهره‌ای که دنیا اول می‌بیند) — سه‌گانه‌ی
                  اصلی شخصیت شما را می‌سازند. طالع فقط با داشتن ساعت تولد قابل محاسبه است.
                </p>
                <p>
                  ما در این ابزار همه‌ی محاسبات را با موتور دقیق <span className="text-ink-200">Swiss Ephemeris</span>{" "}
                  در مرورگر شما انجام می‌دهیم؛ نتیجه داده‌ای واقعی درباره‌ی آسمان است، اما تفسیرها زبانِ نماد و
                  خودشناسی‌اند — نه پیشگویی علمی.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="glass rounded-xl p-7">
              <h3 className="flex items-center gap-2 font-display text-xl text-gold-300">
                <Compass className="h-5 w-5" />
                سیستم محاسباتی ما
              </h3>
              <ul className="mt-5 space-y-4 text-sm">
                {[
                  ["موتور نجومی", APP_CONFIG.engineLabel],
                  ["افمرید", APP_CONFIG.ephemerisLabel],
                  ["زودیاک", APP_CONFIG.zodiacLabel],
                  ["سیستم خانه", APP_CONFIG.houseSystemLabel],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-start justify-between gap-4 border-b border-mystic-600/15 pb-3">
                    <span className="flex items-center gap-2 text-ink-500">
                      <Orbit className="h-4 w-4 text-gold-500/70" />
                      {k}
                    </span>
                    <span className="text-left text-xs leading-6 text-ink-200">{v}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-6 text-ink-600">
                موقعیت‌های سیاره‌ها ژئوسنتریک (زمین‌مرکز) و بر پایه‌ی مختصات اکلیپتیک واقعی همان لحظه محاسبه می‌شوند —
                نه داده‌ی از پیش ساخته.
              </p>
              <Link to="/wizard" className="btn-gold mt-6 w-full">
                دیدن چارت خودم
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ DISCLAIMER CTA ============ */}
      <section className="mx-auto max-w-4xl px-4 pb-8 sm:px-6">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-xl p-10 text-center">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold-500/60 to-transparent" />
            <span className="glyph text-4xl text-gold-300">✶</span>
            <h2 className="font-display mt-4 text-3xl text-ink-50">آسمانِ لحظه‌ی تولد شما منتظر است</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink-400">
              در کمتر از دو دقیقه، پروفایل آسمانی کامل خود را دریافت کنید — رایگان، خصوصی، و بدون نیاز به ثبت‌نام.
            </p>
            <Link to="/wizard" className="btn-gold mt-7 text-base">
              <Sparkles className="h-5 w-5" />
              شروع تحلیل
            </Link>
            <p className="mt-8 border-t border-mystic-600/15 pt-5 text-xs leading-6 text-ink-600">
              این اطلاعات جنبه سرگرمی و خودشناسی دارند و جایگزین مشاوره تخصصی پزشکی، مالی یا حقوقی نیستند.
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default HomePage;
