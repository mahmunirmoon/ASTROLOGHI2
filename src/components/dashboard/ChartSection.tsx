import { useState } from "react";
import ZodiacWheel from "../ZodiacWheel";
import SectionHeading from "../SectionHeading";
import Reveal from "../Reveal";
import { SIGN_BY_KEY, ELEMENT_FA } from "../../data/zodiac";
import { PLANETS, PLANET_BY_KEY, ASPECT_FA } from "../../data/planets";
import { PLANET_IN_SIGN } from "../../data/interpretations";
import { formatDegreeInSign, toFaDigits } from "../../lib/dates";
import type { AstrologyProfile, PlanetKey } from "../../types";

const ChartSection = ({ profile }: { profile: AstrologyProfile }) => {
  const [selected, setSelected] = useState<PlanetKey | null>("sun");
  const sel = selected ? profile.planets[selected] : null;
  const selMeta = selected ? PLANET_BY_KEY[selected] : null;

  const fullName = `${profile.birth.firstName} ${profile.birth.lastName}`.trim();

  return (
    <section className="mt-24">
      <Reveal>
        <SectionHeading
          kicker="NATAL CHART"
          title="چارت تولد شما"
          subtitle="نقشه‌ی دایره‌ای آسمان لحظه‌ی تولد — دوازده برج، موقعیت سیارات، خانه‌ها و زوایای اصلی. روی هر سیاره کلیک کنید تا جزئیاتش در مرکز چارت نمایش داده شود."
        />
      </Reveal>

      <Reveal>
        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <div className="glass rounded-xl p-5 sm:p-8">
            <ZodiacWheel profile={profile} selected={selected} onSelect={setSelected} centerTitle={fullName} />
          </div>

          <div className="space-y-5">
            {/* Planet chips */}
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-bold text-ink-200">سیارات</h3>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {PLANETS.map((p) => {
                  const pos = profile.planets[p.key];
                  const active = selected === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setSelected(active ? null : p.key)}
                      aria-pressed={active}
                      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-right text-xs transition-all ${
                        active
                          ? "border-gold-500/60 bg-gold-500/10 text-ink-50"
                          : "border-mystic-600/20 text-ink-400 hover:border-mystic-500/50 hover:text-ink-200"
                      }`}
                    >
                      <span className="glyph text-lg" style={{ color: p.color }}>{p.glyph}</span>
                      <span className="leading-tight">
                        <span className="block font-semibold">{p.fa}</span>
                        <span className="block text-[10px] text-ink-500">
                          {SIGN_BY_KEY[pos.signKey].glyph} {SIGN_BY_KEY[pos.signKey].fa}
                        </span>
                      </span>
                      {pos.retrograde && <span className="ms-auto text-[10px] text-mystic-300">℞</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected detail */}
            {sel && selMeta && (
              <div className="glass rounded-xl border-gold-500/25 p-5 animate-fade-up" key={selMeta.key}>
                <div className="flex items-center gap-3">
                  <span
                    className="glyph flex h-12 w-12 items-center justify-center rounded-lg border text-2xl"
                    style={{ color: selMeta.color, borderColor: `${selMeta.color}50`, background: `${selMeta.color}14` }}
                  >
                    {selMeta.glyph}
                  </span>
                  <div>
                    <h3 className="font-display text-xl text-ink-50">{selMeta.fa}</h3>
                    <p className="font-latin text-[10px] tracking-[0.25em] text-ink-600">{selMeta.en.toUpperCase()} · {selMeta.domainFa}</p>
                  </div>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4 border-b border-mystic-600/15 pb-2">
                    <dt className="text-ink-500">برج</dt>
                    <dd className="font-semibold text-ink-50">
                      {SIGN_BY_KEY[sel.signKey].fa} {SIGN_BY_KEY[sel.signKey].glyph}
                      <span className="font-latin ms-2 text-[10px] text-ink-600">{SIGN_BY_KEY[sel.signKey].en}</span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-mystic-600/15 pb-2">
                    <dt className="text-ink-500">درجه</dt>
                    <dd className="text-ink-50">{formatDegreeInSign(sel.degreeInSign)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-mystic-600/15 pb-2">
                    <dt className="text-ink-500">خانه</dt>
                    <dd className="text-ink-50">{sel.house ? toFaDigits(sel.house) : "بدون ساعت تولد"}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-mystic-600/15 pb-2">
                    <dt className="text-ink-500">عنصر</dt>
                    <dd style={{ color: ELEMENT_FA[SIGN_BY_KEY[sel.signKey].element].color }}>
                      {ELEMENT_FA[SIGN_BY_KEY[sel.signKey].element].label} {ELEMENT_FA[SIGN_BY_KEY[sel.signKey].element].glyph}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-500">حرکت</dt>
                    <dd className={sel.retrograde ? "text-mystic-300" : "text-ink-50"}>
                      {sel.retrograde ? "بازگشتی (رتروگرید) ℞" : "مستقیم"}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 rounded-lg bg-night-900/60 p-3 text-xs leading-6 text-ink-300">
                  در آسترولوژی، {selMeta.fa} در {SIGN_BY_KEY[sel.signKey].fa} معمولاً به عنوان{" "}
                  «{PLANET_IN_SIGN[sel.planet][sel.signIndex]}» تفسیر می‌شود.
                </p>
              </div>
            )}

            {/* Aspect summary */}
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-bold text-ink-200">
                زوایای اصلی <span className="font-latin text-[10px] tracking-widest text-ink-600">ASPECTS</span>
              </h3>
              <p className="mt-2 text-xs leading-6 text-ink-500">
                {toFaDigits(profile.aspects.length)} زاویه‌ی اصلی میان سیارات شما شناسایی شد —
                {" "}{toFaDigits(profile.aspects.filter((a) => ASPECT_FA[a.type].nature === "harmonious").length)} هم‌ساز و{" "}
                {toFaDigits(profile.aspects.filter((a) => ASPECT_FA[a.type].nature === "challenging").length)} پویا.
              </p>
              <ul className="mt-3 space-y-1.5">
                {profile.aspects.slice(0, 5).map((a, i) => {
                  const meta = ASPECT_FA[a.type];
                  return (
                    <li key={i} className="flex items-center gap-2 text-xs text-ink-400">
                      <span className="h-0.5 w-4 rounded" style={{ background: meta.color }} />
                      {PLANET_BY_KEY[a.p1].fa} {meta.label} {PLANET_BY_KEY[a.p2].fa}
                      <span className="ms-auto text-[10px] text-ink-600">مدار {formatDegreeInSign(a.orb)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Planetary table */}
      <Reveal>
        <div className="glass mt-10 overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-right text-sm">
              <caption className="sr-only">جدول موقعیت سیارات در چارت تولد</caption>
              <thead>
                <tr className="border-b border-gold-500/20 bg-night-900/60 text-xs text-ink-500">
                  <th scope="col" className="px-5 py-4 font-semibold">سیاره</th>
                  <th scope="col" className="px-5 py-4 font-semibold">برج</th>
                  <th scope="col" className="px-5 py-4 font-semibold">درجه</th>
                  <th scope="col" className="px-5 py-4 font-semibold">خانه</th>
                  <th scope="col" className="px-5 py-4 font-semibold">عنصر</th>
                  <th scope="col" className="px-5 py-4 font-semibold">تفسیر کوتاه</th>
                </tr>
              </thead>
              <tbody>
                {PLANETS.map((p) => {
                  const pos = profile.planets[p.key];
                  const sign = SIGN_BY_KEY[pos.signKey];
                  return (
                    <tr key={p.key} className="border-b border-mystic-600/10 transition-colors hover:bg-gold-500/5">
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-2.5 font-semibold text-ink-50">
                          <span className="glyph text-lg" style={{ color: p.color }}>{p.glyph}</span>
                          {p.fa}
                          {pos.retrograde && <span className="text-[10px] text-mystic-300">℞</span>}
                          <span className="font-latin text-[10px] font-normal tracking-wider text-ink-600">{p.en}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-ink-200">
                        {sign.glyph} {sign.fa}
                      </td>
                      <td className="px-5 py-3.5 text-ink-300">{formatDegreeInSign(pos.degreeInSign)}</td>
                      <td className="px-5 py-3.5 text-ink-300">{pos.house ? toFaDigits(pos.house) : "—"}</td>
                      <td className="px-5 py-3.5" style={{ color: ELEMENT_FA[sign.element].color }}>
                        {ELEMENT_FA[sign.element].label} {ELEMENT_FA[sign.element].glyph}
                      </td>
                      <td className="max-w-[280px] px-5 py-3.5 text-xs leading-6 text-ink-400">
                        {PLANET_IN_SIGN[p.key][pos.signIndex]}
                      </td>
                    </tr>
                  );
                })}
                {profile.ascendant && (
                  <tr className="bg-gold-500/5">
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2.5 font-semibold text-gold-300">
                        <span className="font-latin text-xs font-bold">ASC</span>
                        طلوع
                        <span className="font-latin text-[10px] font-normal tracking-wider text-ink-600">Ascendant</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-ink-200">
                      {SIGN_BY_KEY[profile.ascendant.signKey].glyph} {SIGN_BY_KEY[profile.ascendant.signKey].fa}
                    </td>
                    <td className="px-5 py-3.5 text-ink-300">{formatDegreeInSign(profile.ascendant.degreeInSign)}</td>
                    <td className="px-5 py-3.5 text-ink-300">۱</td>
                    <td className="px-5 py-3.5" style={{ color: ELEMENT_FA[SIGN_BY_KEY[profile.ascendant.signKey].element].color }}>
                      {ELEMENT_FA[SIGN_BY_KEY[profile.ascendant.signKey].element].label}
                    </td>
                    <td className="px-5 py-3.5 text-xs leading-6 text-ink-400">نقطه‌ی آغاز چارت — نقاب اجتماعی و اولین برداشت دیگران.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default ChartSection;
