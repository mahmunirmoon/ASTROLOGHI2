import { Heart, Briefcase, Sunrise } from "lucide-react";
import SectionHeading from "../SectionHeading";
import Reveal from "../Reveal";
import { relationshipText, careerText } from "../../lib/chartAnalysis";
import { SIGN_BY_KEY } from "../../data/zodiac";
import type { AstrologyProfile, DailyProfile } from "../../types";

interface LifeSectionsProps {
  profile: AstrologyProfile;
  daily: DailyProfile | null;
  dailyLoading: boolean;
}

const LifeSections = ({ profile, daily, dailyLoading }: LifeSectionsProps) => {
  const love = relationshipText(profile);
  const career = careerText(profile);

  return (
    <>
      {/* ---- Relationship profile ---- */}
      <section className="mt-24">
        <Reveal>
          <SectionHeading kicker="LOVE PROFILE" title="پروفایل عاطفی" subtitle="نگاهی نمادین به زبانِ عشق شما — از جایگیری‌های زهره، مریخ، ماه و خانه‌ی هفتم." />
        </Reveal>
        <Reveal>
          <article className="glass relative overflow-hidden rounded-xl p-7 sm:p-9">
            <span className="glyph absolute -left-6 top-0 text-[150px] leading-none text-[#9987db] opacity-[0.05]">♀</span>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#9987db]/40 bg-[#9987db]/10 text-[#b3a7e8]">
                <Heart className="h-5 w-5" />
              </span>
              <h3 className="font-display text-xl text-ink-50">زبانِ عشقِ شما در چارت</h3>
            </div>
            <div className="mt-5 space-y-4">
              {love.map((p, i) => (
                <p key={i} className="border-r-2 border-mystic-500/40 pr-4 text-sm leading-8 text-ink-300">
                  {p}
                </p>
              ))}
            </div>
            <p className="mt-6 text-[11px] leading-6 text-ink-600">
              این تحلیل برای خودشناسی و گفتگوی سرگرم‌کننده است؛ هیچ چارتی سرنوشتِ عاطفی کسی را تعیین نمی‌کند.
            </p>
          </article>
        </Reveal>
      </section>

      {/* ---- Career ---- */}
      <section className="mt-24">
        <Reveal>
          <SectionHeading kicker="CAREER & TALENTS" title="مسیر شغلی و استعدادها" subtitle="خورشید، عطارد، مریخ، مشتری و نقطه‌ی میلاد — قطب‌نمای نمادینِ استعداد حرفه‌ای." />
        </Reveal>
        <Reveal>
          <article className="glass relative overflow-hidden rounded-xl p-7 sm:p-9">
            <span className="glyph absolute -left-6 top-0 text-[150px] leading-none text-gold-400 opacity-[0.05]">♃</span>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold-500/40 bg-gold-500/10 text-gold-300">
                <Briefcase className="h-5 w-5" />
              </span>
              <h3 className="font-display text-xl text-ink-50">استعدادها و جهتِ دیده‌شدن</h3>
            </div>
            <div className="mt-5 space-y-4">
              {career.map((p, i) => (
                <p key={i} className="border-r-2 border-gold-500/40 pr-4 text-sm leading-8 text-ink-300">
                  {p}
                </p>
              ))}
            </div>
            <p className="mt-6 text-[11px] leading-6 text-ink-600">
              این بخش پیشنهاد مالی یا شغلی نیست — فقط بازتابی نمادین از استعدادهای چارت شماست.
            </p>
          </article>
        </Reveal>
      </section>

      {/* ---- Daily energy ---- */}
      <section className="mt-24">
        <Reveal>
          <SectionHeading kicker="TODAY'S SKY" title="انرژی امروز" subtitle="مقایسه‌ی سبکِ آسمانِ امروز با چارت تولد شما — محاسبه‌شده برای همین لحظه با همان موتور نجومی." />
        </Reveal>
        <Reveal>
          <article className="glass relative overflow-hidden rounded-xl p-7 sm:p-9">
            <span className="glyph absolute -left-6 top-0 text-[150px] leading-none text-airx-400 opacity-[0.05]">☉</span>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-airx-400/40 bg-airx-400/10 text-airx-400">
                <Sunrise className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-xl text-ink-50">آسمانِ امروز برای شما</h3>
                {daily && (
                  <p className="mt-0.5 text-xs text-ink-500">
                    {daily.dateJalaali} · <span dir="ltr" className="font-latin tracking-wider">{daily.dateGregorian}</span> · ساعت ۱۲ به وقت {profile.birth.location.timezone}
                  </p>
                )}
              </div>
            </div>

            {dailyLoading ? (
              <div className="mt-6 space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-night-800/70" />
                ))}
              </div>
            ) : daily ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gold-500/25 bg-gold-500/5 p-4 text-center">
                  <p className="text-[11px] text-ink-500">خورشید امروز</p>
                  <p className="font-display mt-1 text-2xl text-gold-300">
                    {SIGN_BY_KEY[daily.sunSign].glyph} {SIGN_BY_KEY[daily.sunSign].fa}
                  </p>
                </div>
                <div className="rounded-lg border border-mystic-500/25 bg-mystic-500/5 p-4 text-center">
                  <p className="text-[11px] text-ink-500">ماه امروز</p>
                  <p className="font-display mt-1 text-2xl text-mystic-300">
                    {SIGN_BY_KEY[daily.moonSign].glyph} {SIGN_BY_KEY[daily.moonSign].fa}
                  </p>
                </div>
                <ul className="space-y-3 md:col-span-2">
                  {daily.messages.map((m, i) => (
                    <li key={i} className="rounded-lg bg-night-900/60 p-4 text-sm leading-7 text-ink-300">
                      ✶ {m}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-6 text-sm text-ink-500">محاسبه‌ی انرژی امروز ممکن نشد؛ دوباره تلاش کنید.</p>
            )}
          </article>
        </Reveal>
      </section>
    </>
  );
};

export default LifeSections;
