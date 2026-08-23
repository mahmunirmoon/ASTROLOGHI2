import SectionHeading from "../SectionHeading";
import Reveal from "../Reveal";
import { computeNumerology } from "../../lib/numerology";
import { NUMBER_MEANINGS } from "../../data/interpretations";
import { toFaDigits } from "../../lib/dates";
import type { AstrologyProfile } from "../../types";

const ACCENTS = ["#e6c56a", "#9987db", "#7cc7d8", "#8ec97e"];

const NumerologySection = ({ profile }: { profile: AstrologyProfile }) => {
  const b = profile.birth;
  const numerology = computeNumerology(b.firstName, b.lastName, b.gYear, b.gMonth, b.gDay);

  return (
    <section className="mt-24">
      <Reveal>
        <SectionHeading
          kicker="NUMEROLOGY"
          title="عددشناسی"
          subtitle={`سیستم مستقل از آسترولوژی — ${numerology.system}. چهار عدد کلیدی از نام و تاریخ تولد شما.`}
        />
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {numerology.numbers.map((n, i) => {
          const meaning = NUMBER_MEANINGS[n.value] ?? NUMBER_MEANINGS[9];
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <Reveal key={n.key} delay={i * 110}>
              <article className="glass h-full rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1" style={{ borderColor: `${accent}30` }}>
                <span
                  className="font-display mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 text-4xl"
                  style={{ color: accent, borderColor: `${accent}55`, background: `${accent}10`, textShadow: `0 0 24px ${accent}66` }}
                >
                  {toFaDigits(n.value)}
                </span>
                <h3 className="font-display mt-4 text-lg text-ink-50">{n.labelFa}</h3>
                <p className="font-latin text-[9px] tracking-[0.3em] text-ink-600">{n.labelEn.toUpperCase()}</p>
                {n.isMaster && (
                  <span className="mt-2 inline-block rounded-full border border-gold-500/40 bg-gold-500/10 px-2.5 py-0.5 text-[10px] font-bold text-gold-300">
                    عدد استاد ✶
                  </span>
                )}
                <p className="mt-3 text-sm font-semibold" style={{ color: accent }}>«{meaning.title}»</p>
                <p className="mt-2 text-xs leading-6 text-ink-400">{meaning.text}</p>
                <p className="mt-4 rounded-lg bg-night-900/60 p-2.5 text-[10px] leading-5 text-ink-600">{n.breakdown}</p>
              </article>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <div className="glass-soft mt-6 rounded-xl p-5 text-xs leading-7 text-ink-500">
          <p className="font-bold text-ink-300">درباره‌ی روش محاسبه:</p>
          <p className="mt-2">
            • عدد مسیر زندگی از جمع ارقام تاریخ تولد <strong className="text-ink-300">میلادی</strong> به دست می‌آید (روش استاندارد غربی).
          </p>
          <p>
            • برای نام‌های فارسی از جدول مستند <strong className="text-ink-300">ابجد کبیر</strong> استفاده می‌شود که هر ارزش به تک‌رقم تقلیل
            می‌یابد (ی=۱۰→۱، ک=۲۰→۲، …) و حروف پ/چ/ژ/گ ارزش هم‌خانواده‌ی خود (ب/ج/ز/ک) را می‌گیرند؛ برای نام‌های لاتین، جدول فیتاغورثی
            (A=۱ … I=۹) به کار می‌رود. عدد شخصیت فقط حروف بی‌واک (صامت) را می‌شمارد.
          </p>
          <p>• اعداد ۱۱، ۲۲ و ۳۳ به عنوان «اعداد استاد» تقلیل نمی‌یابند. عددشناسی سیستمی جدا از آسترولوژی است و با آن ترکیب نشده است.</p>
        </div>
      </Reveal>
    </section>
  );
};

export default NumerologySection;
