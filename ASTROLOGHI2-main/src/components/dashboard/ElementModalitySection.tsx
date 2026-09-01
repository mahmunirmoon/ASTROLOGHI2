import SectionHeading from "../SectionHeading";
import Reveal from "../Reveal";
import { ELEMENT_FA, MODALITY_FA } from "../../data/zodiac";
import { ELEMENT_DESC, MODALITY_DESC } from "../../data/interpretations";
import { toFaDigits } from "../../lib/dates";
import type { AstrologyProfile, Element, Modality } from "../../types";

const Bar = ({ label, glyph, en, percent, color, delay }: { label: string; glyph?: string; en: string; percent: number; color: string; delay: number }) => (
  <div>
    <div className="mb-1.5 flex items-baseline justify-between text-xs">
      <span className="font-semibold text-ink-200">
        {glyph && <span className="ms-1">{glyph}</span>} {label}
        <span className="font-latin ms-2 text-[9px] tracking-[0.2em] text-ink-600">{en.toUpperCase()}</span>
      </span>
      <span className="text-ink-400">{toFaDigits(percent)}٪</span>
    </div>
    <div className="h-2.5 overflow-hidden rounded-full bg-night-800/90" role="img" aria-label={`${label}: ${percent} درصد`}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, transitionDelay: `${delay}ms`, boxShadow: `0 0 12px ${color}55` }}
      />
    </div>
  </div>
);

const ElementModalitySection = ({ profile }: { profile: AstrologyProfile }) => {
  const elements = Object.keys(profile.elementBalance) as Element[];
  const modalities = Object.keys(profile.modalityBalance) as Modality[];
  const dom = ELEMENT_FA[profile.dominantElement];
  const domDesc = ELEMENT_DESC[profile.dominantElement];
  const modDesc = MODALITY_DESC[profile.dominantModality];

  return (
    <section className="mt-24">
      <Reveal>
        <SectionHeading
          kicker="ELEMENTS & MODALITIES"
          title="عنصرها و حالت‌های چارت شما"
          subtitle="توزیع عنصرها (آتش، خاک، باد، آب) و حالت‌ها (آغازگر، ثابت، تغییرپذیر) بر اساس ده سیاره و طالع — به تعبیر آسترولوژی، جنسِ انرژیِ شخصیت شما."
        />
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="glass h-full rounded-xl p-7">
            <h3 className="font-display text-xl text-ink-50">توزیع عنصرها</h3>
            <div className="mt-6 space-y-5">
              {elements.map((el, i) => (
                <Bar
                  key={el}
                  label={ELEMENT_FA[el].label}
                  glyph={ELEMENT_FA[el].glyph}
                  en={ELEMENT_FA[el].en}
                  percent={profile.elementBalance[el].percent}
                  color={ELEMENT_FA[el].color}
                  delay={i * 150}
                />
              ))}
            </div>
            <div className="mt-7 rounded-lg border border-gold-500/25 bg-gold-500/5 p-4">
              <p className="text-xs font-bold text-gold-300">
                ✶ عنصر غالب شما: {dom.label} {dom.glyph} ({dom.en})
              </p>
              <p className="mt-2 text-xs leading-6 text-ink-300">{domDesc.traits}</p>
              <p className="mt-2 text-xs leading-6 text-gold-200/80">{domDesc.advice}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="glass h-full rounded-xl p-7">
            <h3 className="font-display text-xl text-ink-50">توزیع حالت‌ها</h3>
            <div className="mt-6 space-y-5">
              {modalities.map((m, i) => (
                <Bar
                  key={m}
                  label={MODALITY_FA[m].label}
                  en={MODALITY_FA[m].en}
                  percent={profile.modalityBalance[m].percent}
                  color={MODALITY_FA[m].color}
                  delay={i * 150}
                />
              ))}
            </div>
            <div className="mt-7 rounded-lg border border-mystic-500/25 bg-mystic-500/5 p-4">
              <p className="text-xs font-bold text-mystic-300">✶ حالت غالب: {MODALITY_FA[profile.dominantModality].label}</p>
              <p className="mt-2 text-xs leading-6 text-ink-300">{modDesc.traits}</p>
            </div>
            <p className="mt-5 text-[11px] leading-6 text-ink-600">
              در آسترولوژی عنصر نشان می‌دهد «انرژی شما از چه جنسی است» و حالت نشان می‌دهد «آن انرژی چگونه عمل می‌کند» —
              آغازگر شروع می‌کند، ثابت نگه می‌دارد، تغییرپذیر تطبیق می‌دهد.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ElementModalitySection;
