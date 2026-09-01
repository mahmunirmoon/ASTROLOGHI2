import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, Loader2, Sparkles } from "lucide-react";
import { jalaaliMonthLength } from "jalaali-js";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import CitySearch from "../components/CitySearch";
import { useProfile } from "../context/ProfileContext";
import { computeProfile } from "../lib/astroEngine";
import { computeCompatibility } from "../lib/compatibility";
import { resolveBirthDate, validateJalaali, validateGregorian, toFaDigits, JALAALI_MONTHS, GREGORIAN_MONTHS_FA } from "../lib/dates";
import type { AstrologyProfile, BirthLocation, CalendarKind, CompatibilityInput, CompatibilityResult } from "../types";
import { AstroError } from "../types";

const SCORE_LABELS: Array<{ key: keyof CompatibilityResult["scores"]; label: string; color: string }> = [
  { key: "overall", label: "هم‌خوانی کلی", color: "#e6c56a" },
  { key: "emotional", label: "سازگاری عاطفی", color: "#b3a7e8" },
  { key: "communication", label: "ارتباط", color: "#7cc7d8" },
  { key: "attraction", label: "جاذبه", color: "#f08a4b" },
];

const CompatibilityPage = () => {
  const { birthData } = useProfile();
  const [profileA, setProfileA] = useState<AstrologyProfile | null>(null);
  const [aLoading, setALoading] = useState(!!birthData);

  /* Person B form */
  const [name, setName] = useState("");
  const [calendar, setCalendar] = useState<CalendarKind>("jalaali");
  const [year, setYear] = useState(1370);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [timeUnknown, setTimeUnknown] = useState(true);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [city, setCity] = useState<BirthLocation | null>(null);

  const [errors, setErrors] = useState<{ name?: string; date?: string; city?: string }>({});
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!birthData) return;
    let alive = true;
    setALoading(true);
    computeProfile(birthData)
      .then((p) => alive && setProfileA(p))
      .catch(() => alive && setProfileA(null))
      .finally(() => alive && setALoading(false));
    return () => {
      alive = false;
    };
  }, [birthData]);

  const months = calendar === "jalaali" ? JALAALI_MONTHS : GREGORIAN_MONTHS_FA;
  const years = useMemo(() => {
    const list: number[] = [];
    const [from, to] = calendar === "jalaali" ? [1279, 1405] : [1900, 2026];
    for (let y = to; y >= from; y--) list.push(y);
    return list;
  }, [calendar]);
  const maxDay = calendar === "jalaali" ? jalaaliMonthLength(year, month) : new Date(year, month, 0).getDate();

  const switchCalendar = (next: CalendarKind) => {
    if (next === calendar) return;
    const r = resolveBirthDate(calendar, year, month, day);
    setCalendar(next);
    setYear(next === "jalaali" ? r.jYear : r.gYear);
    setMonth(next === "jalaali" ? r.jMonth : r.gMonth);
    setDay(next === "jalaali" ? r.jDay : r.gDay);
  };

  if (!birthData) {
    return (
      <div className="mx-auto max-w-xl px-4 pb-24 pt-40 text-center sm:px-6">
        <HeartHandshake className="mx-auto h-14 w-14 text-mystic-300" />
        <h1 className="font-display mt-6 text-4xl text-ink-50">اول چارت خودتان را بسازید</h1>
        <p className="mt-4 text-sm leading-8 text-ink-400">
          برای تحلیل سازگاری، ابتدا اطلاعات تولد خود را وارد کنید تا چارت شما محاسبه شود؛ سپس نفر دوم را اضافه می‌کنیم.
        </p>
        <Link to="/wizard" className="btn-gold mt-8">
          <Sparkles className="h-4 w-4" />
          ساخت چارت تولد
        </Link>
      </div>
    );
  }

  const submit = async () => {
    setError(null);
    const e: typeof errors = {};
    if (name.trim().length < 2) e.name = "نام نفر دوم را وارد کنید.";
    const dateErr = calendar === "jalaali" ? validateJalaali(year, month, day) : validateGregorian(year, month, day);
    if (dateErr) e.date = dateErr;
    if (!city) e.city = "شهر تولد نفر دوم را انتخاب کنید.";
    setErrors(e);
    if (Object.values(e).some(Boolean) || !profileA) return;

    const resolved = resolveBirthDate(calendar, year, month, day);
    const input: CompatibilityInput = {
      name: name.trim(),
      gYear: resolved.gYear,
      gMonth: resolved.gMonth,
      gDay: resolved.gDay,
      timeUnknown,
      hour,
      minute,
      location: city as BirthLocation,
    };
    setComputing(true);
    try {
      const r = await computeCompatibility(profileA, input);
      setResult(r);
    } catch (err) {
      setError(err instanceof AstroError ? err.faMessage : "محاسبه‌ی سازگاری ناموفق بود؛ دوباره تلاش کنید.");
    } finally {
      setComputing(false);
    }
  };

  const jalaaliPreview = (() => {
    const g = resolveBirthDate(calendar, year, month, day);
    return `معادل میلادی: ${toFaDigits(g.gDay)} / ${toFaDigits(g.gMonth)} / ${toFaDigits(g.gYear)} · شمسی: ${toFaDigits(g.jDay)} / ${toFaDigits(g.jMonth)} / ${toFaDigits(g.jYear)}`;
  })();

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
      <SectionHeading
        kicker="SYNASTRY"
        title="سازگاری دو نفر"
        subtitle={`چارت شما (${birthData.firstName}) آماده است. اطلاعات نفر دوم را وارد کنید تا مقایسه‌ی نمادینِ خورشید، ماه، زهره، مریخ و زوایای متقابل انجام شود.`}
      />

      <Reveal>
        <div className="glass rounded-xl p-6 sm:p-8">
          {aLoading ? (
            <div className="flex items-center gap-3 py-6 text-sm text-ink-400">
              <Loader2 className="h-5 w-5 animate-spin text-gold-400" />
              در حال آماده‌سازی چارت شما...
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label htmlFor="p2name" className="mb-2 block text-sm font-semibold text-ink-200">
                  نام نفر دوم <span className="text-gold-400">*</span>
                </label>
                <input id="p2name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: امیر" />
                {errors.name && <p className="mt-2 text-xs text-[#f0a49b]" role="alert">{errors.name}</p>}
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-ink-200">تاریخ تولد نفر دوم</legend>
                <div className="mb-3 inline-flex rounded-lg border border-mystic-600/30 bg-night-850 p-1" role="radiogroup">
                  {(
                    [
                      ["jalaali", "هجری شمسی"],
                      ["gregorian", "میلادی"],
                    ] as Array<[CalendarKind, string]>
                  ).map(([k, label]) => (
                    <button
                      key={k}
                      role="radio"
                      aria-checked={calendar === k}
                      onClick={() => switchCalendar(k)}
                      className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
                        calendar === k ? "bg-gold-500/15 text-gold-300" : "text-ink-500 hover:text-ink-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <select aria-label="روز" className="field" value={Math.min(day, maxDay)} onChange={(e) => setDay(Number(e.target.value))}>
                    {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{toFaDigits(d)}</option>
                    ))}
                  </select>
                  <select aria-label="ماه" className="field" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                    {months.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <select aria-label="سال" className="field" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                    {years.map((y) => (
                      <option key={y} value={y}>{toFaDigits(y)}</option>
                    ))}
                  </select>
                </div>
                <p className="mt-2 text-xs text-mystic-300">{jalaaliPreview}</p>
                {errors.date && <p className="mt-2 text-xs text-[#f0a49b]" role="alert">{errors.date}</p>}
              </fieldset>

              <fieldset className="rounded-lg border border-mystic-600/20 p-4">
                <legend className="px-2 text-sm font-semibold text-ink-200">ساعت تولد نفر دوم</legend>
                <label className="flex cursor-pointer items-center gap-3 text-xs leading-6 text-ink-400">
                  <input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} className="h-4 w-4 accent-[#d4af37]" />
                  ساعت تولد را نمی‌دانم — تحلیل بدون طالعِ نفر دوم انجام می‌شود.
                </label>
                {!timeUnknown && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <select aria-label="ساعت" className="field" value={hour} onChange={(e) => setHour(Number(e.target.value))}>
                      {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                        <option key={h} value={h}>{toFaDigits(String(h).padStart(2, "0"))}</option>
                      ))}
                    </select>
                    <select aria-label="دقیقه" className="field" value={minute} onChange={(e) => setMinute(Number(e.target.value))}>
                      {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                        <option key={m} value={m}>{toFaDigits(String(m).padStart(2, "0"))}</option>
                      ))}
                    </select>
                  </div>
                )}
              </fieldset>

              <div>
                <label htmlFor="p2city" className="mb-2 block text-sm font-semibold text-ink-200">
                  شهر تولد نفر دوم <span className="text-gold-400">*</span>
                </label>
                <CitySearch id="p2city" value={city} onChange={setCity} />
                {errors.city && <p className="mt-2 text-xs text-[#f0a49b]" role="alert">{errors.city}</p>}
              </div>

              {error && (
                <p role="alert" className="rounded-lg border border-[#e07a6f]/50 bg-[#e07a6f]/10 px-4 py-3 text-sm text-[#f0a49b]">
                  {error}
                </p>
              )}

              <button onClick={submit} disabled={computing || aLoading} className="btn-gold w-full">
                {computing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال مقایسه‌ی دو آسمان...
                  </>
                ) : (
                  <>
                    <HeartHandshake className="h-4 w-4" />
                    تحلیل سازگاری
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </Reveal>

      {result && (
        <Reveal>
          <div className="mt-12 animate-fade-up">
            <h2 className="font-display text-2xl text-ink-50">
              {result.personA} <span className="text-gold-300">✶</span> {result.personB}
            </h2>

            {/* Scores */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {SCORE_LABELS.map((s) => (
                <div key={s.key} className="glass rounded-xl p-5">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-ink-200">{s.label}</span>
                    <span className="font-display text-2xl" style={{ color: s.color }}>{toFaDigits(result.scores[s.key])}٪</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-night-800/90">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${result.scores[s.key]}%`, background: `linear-gradient(90deg, ${s.color}88, ${s.color})`, boxShadow: `0 0 12px ${s.color}55` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Interpretations */}
            <div className="glass mt-6 space-y-4 rounded-xl p-7">
              {[result.sunSummary, result.moonSummary, result.venusMarsSummary, ...(result.ascendantSummary ? [result.ascendantSummary] : [])].map((t, i) => (
                <p key={i} className="border-r-2 border-gold-500/40 pr-4 text-sm leading-8 text-ink-300">{t}</p>
              ))}
              <div className="grid gap-5 pt-2 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-bold text-terra-400">نقاط قوت رابطه</h3>
                  <ul className="mt-3 space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="rounded-lg bg-night-900/60 p-3 text-xs leading-6 text-ink-400">✦ {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#e07a6f]">چالش‌های پویا</h3>
                  <ul className="mt-3 space-y-2">
                    {result.challenges.map((s, i) => (
                      <li key={i} className="rounded-lg bg-night-900/60 p-3 text-xs leading-6 text-ink-400">✧ {s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-[11px] leading-6 text-ink-600">
              امتیازها بر اساس هم‌خوانی عنصرها و زوایای متقابل، صرفاً جنبه‌ی سرگرمی و بازتاب نمادین دارند — آسترولوژی
              موفقیت یا شکست هیچ رابطه‌ی واقعی را تعیین نمی‌کند.
            </p>
          </div>
        </Reveal>
      )}
    </div>
  );
};

export default CompatibilityPage;
