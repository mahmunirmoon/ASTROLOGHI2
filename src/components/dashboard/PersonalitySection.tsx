import SectionHeading from "../SectionHeading";
import Reveal from "../Reveal";
import { personalitySections } from "../../lib/chartAnalysis";
import type { AstrologyProfile } from "../../types";

const PersonalitySection = ({ profile }: { profile: AstrologyProfile }) => {
  const sections = personalitySections(profile);

  return (
    <section className="mt-24">
      <Reveal>
        <SectionHeading
          kicker="PERSONALITY READING"
          title="تحلیل شخصیت شما"
          subtitle="نه قاب برای نگاه‌کردن به چارت شما — از شخصیت کلی تا سبک تصمیم‌گیری. این تفسیرها زبانِ نمادین آسترولوژی‌اند؛ نه قضاوت قطعی درباره‌ی شما."
        />
      </Reveal>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((s, i) => (
          <Reveal key={s.id} delay={(i % 3) * 110}>
            <article className="glass group h-full rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/35">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-lg text-gold-300">{s.titleFa}</h3>
                <span className="font-latin shrink-0 text-[9px] tracking-[0.22em] text-ink-600">{s.en.toUpperCase()}</span>
              </div>
              <div className="gold-line my-3.5 w-10 transition-all duration-500 group-hover:w-20" />
              <p className="text-sm leading-7 text-ink-300">{s.text}</p>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <p className="mt-6 text-center text-xs leading-6 text-ink-600">
          «در آسترولوژی، این ترکیب‌ها معمولاً به عنوان الگوهای نمادین تعبیر می‌شوند — شما چیزی فراتر از هر چارتی هستید.»
        </p>
      </Reveal>
    </section>
  );
};

export default PersonalitySection;
