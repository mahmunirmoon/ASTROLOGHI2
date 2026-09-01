import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, MapPin, Search, Clock, Loader2, RotateCcw } from "lucide-react";
import { toGregorian, toJalaali, jalaaliMonthLength } from "jalaali-js";
import LoadingScreen from "../components/LoadingScreen";
import { useProfile } from "../context/ProfileContext";
import { searchCities } from "../lib/geo";
import { computeProfile } from "../lib/astroEngine";
import {
  JALAALI_MONTHS,
  GREGORIAN_MONTHS_FA,
  resolveBirthDate,
  validateJalaali,
  validateGregorian,
  toFaDigits,
} from "../lib/dates";
import { APP_CONFIG } from "../lib/config";
import type { BirthLocation, CalendarKind, UserBirthData } from "../types";
import { AstroError } from "../types";

interface FieldErrors {
  firstName?: string;
  date?: string;
  time?: string;
  city?: string;
}

const WizardPage = () => {
  const navigate = useNavigate();
  const { birthData, saveBirthData, showToast } = useProfile();

  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState<"form" | "loading">("form");
  const [formError, setFormError] = useState<string | null>(null);

  /* ---- Step 1 ---- */
  const [firstName, setFirstName] = useState(birthData?.firstName ?? "");
  const [lastName, setLastName] = useState(birthData?.lastName ?? "");

  /* ---- Step 2 ---- */
  const [calendar, setCalendar] = useState<CalendarKind>(birthData?.calendar ?? "jalaali");
  const [year, setYear] = useState(() => (birthData ? (birthData.calendar === "jalaali" ? birthData.jYear : birthData.gYear) : 1370));
  const [month, setMonth] = useState(() => (birthData ? (birthData.calendar === "jalaali" ? birthData.jMonth : birthData.gMonth) : 1));
  const [day, setDay] = useState(() => (birthData ? (birthData.calendar === "jalaali" ? birthData.jDay : birthData.gDay) : 1));
  const [timeUnknown, setTimeUnknown] = useState(birthData?.timeUnknown ?? false);
  const [hour, setHour] = useState(birthData?.hour ?? 12);
  const [minute, setMinute] = useState(birthData?.minute ?? 0);

  /* ---- City search ---- */
  const [cityQuery, setCityQuery] = useState(
    birthData?.location ? `${birthData.location.nameFa ?? birthData.location.name}، ${birthData.location.country}` : "",
  );
  const [cityResults, setCityResults] = useState<BirthLocation[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<BirthLocation | null>(birthData?.location ?? null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const searchSeq = useRef(0);

  const months = calendar === "jalaali" ? JALAALI_MONTHS : GREGORIAN_MONTHS_FA;
  const years = useMemo(() => {
    const list: number[] = [];
    const [from, to] = calendar === "jalaali" ? [1279, 1405] : [1900, 2026];
    for (let y = to; y >= from; y--) list.push(y);
    return list;
  }, [calendar]);

  const maxDay = useMemo(() => {
    if (calendar === "jalaali") return jalaaliMonthLength(year, month);
    return new Date(year, month, 0).getDate();
  }, [calendar, year, month]);

  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
  }, [maxDay, day]);

  const switchCalendar = (next: CalendarKind) => {
    if (next === calendar) return;
    const resolved = resolveBirthDate(calendar, year, month, day);
    setCalendar(next);
    setYear(next === "jalaali" ? resolved.jYear : resolved.gYear);
    setMonth(next === "jalaali" ? resolved.jMonth : resolved.gMonth);
    setDay(next === "jalaali" ? resolved.jDay : resolved.gDay);
  };

  /* ---- debounced geocoding ---- */
  useEffect(() => {
    const q = cityQuery.trim();
    if (q.length < 2) {
      setCityResults([]);
      return;
    }
    const seq = ++searchSeq.current;
    setCityLoading(true);
    const t = setTimeout(async () => {
      const results = await searchCities(q);
      if (seq === searchSeq.current) {
        setCityResults(results);
        setCityLoading(false);
      }
    }, APP_CONFIG.geo.debounceMs);
    return () => clearTimeout(t);
  }, [cityQuery]);

  const pickCity = (loc: BirthLocation) => {
    setSelectedCity(loc);
    setCityQuery(`${loc.nameFa ?? loc.name}، ${loc.country}`);
    setCityResults([]);
    setErrors((e) => ({ ...e, city: undefined }));
  };

  /* ---- validation ---- */
  const validateStep1 = (): boolean => {
    const e: FieldErrors = {};
    if (firstName.trim().length < 2) e.firstName = "نام باید حداقل ۲ حرف باشد.";
    setErrors(e);
    return !e.firstName;
  };

  const validateStep2 = (): boolean => {
    const e: FieldErrors = {};
    const dateErr =
      calendar === "jalaali" ? validateJalaali(year, month, day) : validateGregorian(year, month, day);
    if (dateErr) e.date = dateErr;
    if (!selectedCity) e.city = "لطفاً شهر تولد را از فهرست پیشنهادی انتخاب کنید.";
    setErrors(e);
    return !e.date && !e.city;
  };

  const next = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submit = async () => {
    setFormError(null);
    if (!validateStep2()) return;
    const resolved = resolveBirthDate(calendar, year, month, day);
    const data: UserBirthData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      calendar,
      ...resolved,
      timeUnknown,
      hour,
      minute,
      location: selectedCity!,
    };
    setPhase("loading");
    try {
      await computeProfile(data); // real computation completes before the ceremonial transition
      saveBirthData(data);
    } catch (err) {
      setPhase("form");
      setFormError(
        err instanceof AstroError
          ? err.faMessage
          : "خطای غیرمنتظره‌ای در محاسبه رخ داد. لطفاً دوباره تلاش کنید.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onLoadingDone = useCallback(() => {
    showToast("پروفایل آسمانی شما آماده شد ✶", "success");
    navigate("/profile");
  }, [navigate, showToast]);

  const jalaaliPreview = useMemo(() => {
    if (calendar === "jalaali") return null;
    const j = toJalaali(year, month, day);
    return `معادل شمسی: ${toFaDigits(j.jd)} ${JALAALI_MONTHS[j.jm - 1]} ${toFaDigits(j.jy)}`;
  }, [calendar, year, month, day]);

  const gregorianPreview = useMemo(() => {
    if (calendar !== "jalaali") return null;
    const g = toGregorian(year, month, day);
    return `معادل میلادی: ${toFaDigits(g.gd)} / ${toFaDigits(g.gm)} / ${toFaDigits(g.gy)}`;
  }, [calendar, year, month, day]);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-28 sm:px-6">
      {phase === "loading" ? (
        <LoadingScreen onDone={onLoadingDone} />
      ) : (
        <>
          <p className="font-latin text-xs font-semibold tracking-[0.45em] text-gold-500/80">BIRTH DATA</p>
          <h1 className="font-display mt-2 text-4xl text-ink-50 sm:text-5xl">اطلاعات تولد شما</h1>
          <p className="mt-3 text-sm leading-7 text-ink-400">
            برای ترسیم دقیق نقشه آسمان، به تاریخ، شهر و (در صورت امکان) ساعت تولد نیاز داریم. ساعت تولد برای محاسبه‌ی
            طالع و خانه‌ها ضروری است.
          </p>

          {/* Stepper */}
          <ol className="mt-8 flex items-center gap-3" aria-label="مراحل فرم">
            {[
              { n: 1, label: "اطلاعات شخصی" },
              { n: 2, label: "اطلاعات تولد" },
            ].map((s, i) => (
              <li key={s.n} className="flex flex-1 items-center gap-3">
                <button
                  onClick={() => s.n < step && setStep(s.n)}
                  disabled={s.n > step}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                    step === s.n
                      ? "border-gold-500/70 bg-gold-500/10 text-gold-300"
                      : step > s.n
                        ? "border-mystic-500/40 text-mystic-300"
                        : "border-mystic-600/20 text-ink-600"
                  }`}
                  aria-current={step === s.n ? "step" : undefined}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                      step > s.n ? "bg-mystic-500 text-night-950" : "bg-night-700"
                    }`}
                  >
                    {step > s.n ? <Check className="h-3 w-3" /> : toFaDigits(s.n)}
                  </span>
                  {s.label}
                </button>
                {i === 0 && <span className="gold-line h-px flex-1" />}
              </li>
            ))}
          </ol>

          {formError && (
            <div role="alert" className="mt-6 rounded-lg border border-[#e07a6f]/50 bg-[#e07a6f]/10 px-4 py-3 text-sm text-[#f0a49b]">
              {formError}
            </div>
          )}

          <div className="glass mt-8 rounded-xl p-6 sm:p-8">
            {step === 1 ? (
              <div className="space-y-6 animate-fade-up" key="s1">
                <div>
                  <label htmlFor="firstName" className="mb-2 block text-sm font-semibold text-ink-200">
                    نام <span className="text-gold-400">*</span>
                  </label>
                  <input
                    id="firstName"
                    className="field"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="مثلاً: سارا"
                    aria-invalid={!!errors.firstName}
                    autoComplete="given-name"
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-xs text-[#f0a49b]" role="alert">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-2 block text-sm font-semibold text-ink-200">
                    نام خانوادگی <span className="text-xs font-normal text-ink-600">(اختیاری)</span>
                  </label>
                  <input
                    id="lastName"
                    className="field"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="مثلاً: محمدی"
                    autoComplete="family-name"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button onClick={next} className="btn-gold">
                    مرحله بعد
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-7 animate-fade-up" key="s2">
                {/* Calendar switch */}
                <div>
                  <span className="mb-2 block text-sm font-semibold text-ink-200">تقویم</span>
                  <div className="inline-flex rounded-lg border border-mystic-600/30 bg-night-850 p-1" role="radiogroup" aria-label="انتخاب تقویم">
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
                </div>

                {/* Date */}
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-ink-200">تاریخ تولد</legend>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="day" className="mb-1 block text-xs text-ink-500">روز</label>
                      <select id="day" className="field" value={day} onChange={(e) => setDay(Number(e.target.value))}>
                        {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>{toFaDigits(d)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="month" className="mb-1 block text-xs text-ink-500">ماه</label>
                      <select id="month" className="field" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                        {months.map((m, i) => (
                          <option key={m} value={i + 1}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="year" className="mb-1 block text-xs text-ink-500">سال</label>
                      <select id="year" className="field" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                        {years.map((y) => (
                          <option key={y} value={y}>{toFaDigits(y)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-mystic-300">{jalaaliPreview ?? gregorianPreview}</p>
                  {errors.date && (
                    <p className="mt-2 text-xs text-[#f0a49b]" role="alert">{errors.date}</p>
                  )}
                </fieldset>

                {/* Time */}
                <fieldset className="rounded-lg border border-mystic-600/20 p-4">
                  <legend className="flex items-center gap-2 px-2 text-sm font-semibold text-ink-200">
                    <Clock className="h-4 w-4 text-gold-400" />
                    ساعت تولد
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="hour" className="mb-1 block text-xs text-ink-500">ساعت</label>
                      <select id="hour" className="field" value={hour} onChange={(e) => setHour(Number(e.target.value))} disabled={timeUnknown}>
                        {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                          <option key={h} value={h}>{toFaDigits(String(h).padStart(2, "0"))}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="minute" className="mb-1 block text-xs text-ink-500">دقیقه</label>
                      <select id="minute" className="field" value={minute} onChange={(e) => setMinute(Number(e.target.value))} disabled={timeUnknown}>
                        {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                          <option key={m} value={m}>{toFaDigits(String(m).padStart(2, "0"))}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg border border-mystic-600/20 bg-night-900/50 px-4 py-3 text-xs leading-6 text-ink-400 transition-colors hover:border-gold-500/40">
                    <input
                      type="checkbox"
                      checked={timeUnknown}
                      onChange={(e) => setTimeUnknown(e.target.checked)}
                      className="h-4 w-4 accent-[#d4af37]"
                    />
                    ساعت تولد را نمی‌دانم — چارت بدون طالع و خانه‌ها محاسبه می‌شود و ماه بر اساس ظهر، تقریبی خواهد بود.
                  </label>
                </fieldset>

                {/* City */}
                <div className="relative">
                  <label htmlFor="city" className="mb-2 block text-sm font-semibold text-ink-200">
                    شهر و کشور تولد <span className="text-gold-400">*</span>
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600" />
                    <input
                      id="city"
                      className="field !pr-10"
                      value={cityQuery}
                      onChange={(e) => {
                        setCityQuery(e.target.value);
                        setSelectedCity(null);
                      }}
                      placeholder="مثلاً: تهران، Dubai، London..."
                      autoComplete="off"
                      aria-invalid={!!errors.city}
                    />
                    {cityLoading && (
                      <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-mystic-300" />
                    )}
                  </div>

                  {cityResults.length > 0 && (
                    <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-mystic-600/30 bg-night-850 shadow-2xl" role="listbox" aria-label="پیشنهادهای شهر">
                      {cityResults.map((c, i) => (
                        <li key={`${c.name}-${c.latitude}-${i}`}>
                          <button
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right text-sm transition-colors hover:bg-gold-500/10"
                            onClick={() => pickCity(c)}
                            role="option"
                            aria-selected={false}
                          >
                            <span className="flex items-center gap-2 text-ink-50">
                              <MapPin className="h-4 w-4 shrink-0 text-gold-400" />
                              {c.nameFa ? `${c.nameFa} (${c.name})` : c.name}
                              <span className="text-xs text-ink-500">— {c.country}</span>
                            </span>
                            <span className="font-latin text-[10px] tracking-wider text-ink-600" dir="ltr">
                              {c.timezone}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {cityQuery.trim().length >= 2 && !cityLoading && cityResults.length === 0 && !selectedCity && (
                    <p className="mt-2 text-xs text-ink-500">نتیجه‌ای پیدا نشد — نام انگلیسی شهر را هم امتحان کنید.</p>
                  )}

                  {selectedCity && (
                    <div className="mt-3 flex items-start justify-between gap-3 rounded-lg border border-gold-500/30 bg-gold-500/5 px-4 py-3">
                      <div className="text-xs leading-6 text-ink-300">
                        <p className="font-semibold text-gold-300">
                          {selectedCity.nameFa ?? selectedCity.name} — {selectedCity.country}
                        </p>
                        <p dir="ltr" className="font-latin text-[10px] tracking-wider text-ink-500">
                          {selectedCity.latitude.toFixed(2)}°, {selectedCity.longitude.toFixed(2)}° · {selectedCity.timezone}
                        </p>
                      </div>
                      <button
                        className="flex shrink-0 items-center gap-1 text-[11px] text-ink-500 transition-colors hover:text-gold-300"
                        onClick={() => {
                          setSelectedCity(null);
                          setCityQuery("");
                        }}
                      >
                        <RotateCcw className="h-3 w-3" />
                        تغییر
                      </button>
                    </div>
                  )}
                  {errors.city && (
                    <p className="mt-2 text-xs text-[#f0a49b]" role="alert">{errors.city}</p>
                  )}
                  <p className="mt-2 text-[11px] leading-5 text-ink-600">
                    مختصات و منطقه‌ی زمانی از سرویس Open-Meteo یا دیتابیس داخلی دریافت می‌شود و برای محاسبه‌ی دقیق طالع
                    لازم است.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-mystic-600/15 pt-5">
                  <button onClick={() => setStep(1)} className="btn-ghost !px-4 !py-2.5 text-xs">
                    <ArrowRight className="h-4 w-4" />
                    مرحله قبل
                  </button>
                  <button onClick={submit} className="btn-gold">
                    محاسبه چارت تولد
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WizardPage;
