import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Trash2, RefreshCw, HeartHandshake, Loader2 } from "lucide-react";
import { useProfile } from "../context/ProfileContext";
import { computeProfile, computeDaily } from "../lib/astroEngine";
import { formatJalaali, formatGregorianFa, toFaDigits } from "../lib/dates";
import { APP_CONFIG } from "../lib/config";
import SummaryCards from "../components/dashboard/SummaryCards";
import ChartSection from "../components/dashboard/ChartSection";
import BigThreeSection from "../components/dashboard/BigThreeSection";
import ElementModalitySection from "../components/dashboard/ElementModalitySection";
import PersonalitySection from "../components/dashboard/PersonalitySection";
import LifeSections from "../components/dashboard/LifeSections";
import NumerologySection from "../components/dashboard/NumerologySection";
import Reveal from "../components/Reveal";
import type { AstrologyProfile, DailyProfile } from "../types";
import { AstroError } from "../types";

const DashboardPage = () => {
  const { birthData, clearBirthData, showToast } = useProfile();
  const [profile, setProfile] = useState<AstrologyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [daily, setDaily] = useState<DailyProfile | null>(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!birthData) return;
    let alive = true;
    setError(null);
    setProfile(null);
    (async () => {
      try {
        const p = await computeProfile(birthData);
        if (alive) setProfile(p);
      } catch (e) {
        if (alive)
          setError(
            e instanceof AstroError ? e.faMessage : "خطای غیرمنتظره‌ای در محاسبه رخ داد. لطفاً دوباره تلاش کنید.",
          );
      }
    })();
    return () => {
      alive = false;
    };
  }, [birthData, attempt]);

  useEffect(() => {
    if (!profile) return;
    let alive = true;
    setDailyLoading(true);
    computeDaily(profile)
      .then((d) => alive && setDaily(d))
      .catch(() => alive && setDaily(null))
      .finally(() => alive && setDailyLoading(false));
    return () => {
      alive = false;
    };
  }, [profile]);

  /* ---------- Empty state ---------- */
  if (!birthData) {
    return (
      <div className="mx-auto max-w-xl px-4 pb-24 pt-40 text-center sm:px-6">
        <span className="glyph text-6xl text-gold-300 text-glow-gold">✶</span>
        <h1 className="font-display mt-6 text-4xl text-ink-50">هنوز چارتی نساخته‌اید</h1>
        <p className="mt-4 text-sm leading-8 text-ink-400">
          برای دیدن پروفایل آسمانی خود، ابتدا اطلاعات تولدتان را وارد کنید تا نقشه‌ی آسمان لحظه‌ی تولد شما ترسیم شود.
        </p>
        <Link to="/wizard" className="btn-gold mt-8">شروع تحلیل</Link>
      </div>
    );
  }

  /* ---------- Error state ---------- */
  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 pb-24 pt-40 text-center sm:px-6">
        <span className="text-5xl">☄️</span>
        <h1 className="font-display mt-6 text-3xl text-ink-50">محاسبه ناموفق بود</h1>
        <p className="mt-4 text-sm leading-8 text-[#f0a49b]">{error}</p>
        <div className="mt-8 flex justify-center gap-3">
          <button className="btn-gold" onClick={() => setAttempt((a) => a + 1)}>
            <RefreshCw className="h-4 w-4" />
            تلاش دوباره
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              clearBirthData();
              showToast("اطلاعات حذف شد؛ می‌توانید دوباره شروع کنید.", "info");
            }}
          >
            <Trash2 className="h-4 w-4" />
            حذف و شروع مجدد
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Loading ---------- */
  if (!profile) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-gold-400" />
        <p className="text-sm text-ink-500">در حال محاسبه‌ی موقعیت سیارات...</p>
      </div>
    );
  }

  const b = profile.birth;
  const fullName = `${b.firstName} ${b.lastName}`.trim();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-28 sm:px-6">
      {/* ---------- Header ---------- */}
      <Reveal>
        <header className="relative overflow-hidden rounded-xl glass p-7 sm:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold-500/70 to-transparent" />
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="font-latin text-xs font-semibold tracking-[0.42em] text-gold-500/80">YOUR CELESTIAL PROFILE</p>
              <h1 className="font-display mt-3 text-4xl text-ink-50 sm:text-5xl">پروفایل آسمانی شما</h1>
              <p className="font-display mt-2 text-2xl text-gold-300">{fullName} ✶</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[APP_CONFIG.zodiacLabel, `خانه: ${APP_CONFIG.houseSystemLabel}`, profile.ephemeris].map((badge) => (
                <span key={badge} className="rounded-full border border-mystic-500/30 bg-night-850/70 px-3 py-1.5 text-[11px] text-ink-400">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-mystic-600/20 bg-night-900/50 px-4 py-3">
              <CalendarDays className="h-5 w-5 shrink-0 text-gold-400" />
              <div className="text-xs leading-5">
                <p className="text-ink-500">تاریخ تولد</p>
                <p className="font-semibold text-ink-100">{formatJalaali(b.jYear, b.jMonth, b.jDay)}</p>
                <p className="text-[10px] text-ink-600">{formatGregorianFa(b.gYear, b.gMonth, b.gDay)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-mystic-600/20 bg-night-900/50 px-4 py-3">
              <RefreshCw className="h-5 w-5 shrink-0 text-mystic-300" />
              <div className="text-xs leading-5">
                <p className="text-ink-500">ساعت تولد</p>
                <p className="font-semibold text-ink-100">{b.timeUnknown ? "نامشخص (تقریبی: ظهر)" : profile.localTimeLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-mystic-600/20 bg-night-900/50 px-4 py-3">
              <MapPin className="h-5 w-5 shrink-0 text-airx-400" />
              <div className="text-xs leading-5">
                <p className="text-ink-500">محل تولد</p>
                <p className="font-semibold text-ink-100">
                  {b.location.nameFa ?? b.location.name} — {b.location.country}
                </p>
                <p dir="ltr" className="font-latin text-left text-[10px] text-ink-600">
                  {b.location.latitude.toFixed(2)}°, {b.location.longitude.toFixed(2)}°
                </p>
              </div>
            </div>
          </div>

          {b.timeUnknown && (
            <p className="mt-5 rounded-lg border border-gold-500/25 bg-gold-500/5 px-4 py-3 text-xs leading-6 text-gold-200/90">
              ⏳ چون ساعت تولد ثبت نشده، طالع و خانه‌ها محاسبه نمی‌شوند و نشان ماه بر اساس ظهرِ روز تولد، تقریبی است
              (ماه می‌تواند در یک روز تا ~۱۳ درجه حرکت کند). با افزودن ساعت تولد، پروفایل کامل می‌شود.
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-mystic-600/15 pt-5">
            <p className="text-[11px] text-ink-600">
              این پروفایل فقط در مرورگر شما ذخیره شده است · محاسبه در {toFaDigits(new Date(profile.utcMs).getFullYear())}/{toFaDigits(
                String(new Date(profile.utcMs).getMonth() + 1).padStart(2, "0"),
              )}/{toFaDigits(String(new Date(profile.utcMs).getDate()).padStart(2, "0"))} UTC انجام شد
            </p>
            <div className="flex gap-2">
              <Link to="/wizard" className="btn-ghost !px-4 !py-2 text-xs">ویرایش اطلاعات</Link>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-[#e07a6f]/40 px-4 py-2 text-xs font-semibold text-[#f0a49b] transition-colors hover:bg-[#e07a6f]/10"
                onClick={() => {
                  clearBirthData();
                  showToast("اطلاعات تولد حذف شد.", "success");
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                حذف اطلاعات
              </button>
            </div>
          </div>
        </header>
      </Reveal>

      {/* ---------- Summary ---------- */}
      <div className="mt-10">
        <Reveal>
          <SummaryCards profile={profile} />
        </Reveal>
      </div>

      <ChartSection profile={profile} />
      <BigThreeSection profile={profile} />
      <ElementModalitySection profile={profile} />
      <PersonalitySection profile={profile} />
      <LifeSections profile={profile} daily={daily} dailyLoading={dailyLoading} />
      <NumerologySection profile={profile} />

      {/* ---------- Compatibility CTA ---------- */}
      <Reveal>
        <section className="mt-24">
          <div className="glass relative overflow-hidden rounded-xl p-8 text-center sm:p-10">
            <span className="glyph absolute right-6 top-4 text-6xl text-mystic-400 opacity-10">♀ ♂</span>
            <h2 className="font-display text-3xl text-ink-50">سازگاری دو نفر</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink-400">
              چارت تولد خود را با شخص دیگری مقایسه کنید — سازگاری عاطفی، ارتباط و جاذبه بر اساس خورشید، ماه، زهره،
              مریخ و زوایای متقابل.
            </p>
            <Link to="/compatibility" className="btn-gold mt-6">
              <HeartHandshake className="h-4 w-4" />
              تحلیل سازگاری
            </Link>
            <p className="mt-5 text-[11px] text-ink-600">آسترولوژی موفقیت هیچ رابطه‌ای را پیش‌بینی نمی‌کند — این فقط یک آینه‌ی نمادین است.</p>
          </div>
        </section>
      </Reveal>
    </div>
  );
};

export default DashboardPage;
