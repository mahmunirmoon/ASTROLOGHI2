import { SIGN_BY_KEY } from "../../data/zodiac";
import { PLANET_BY_KEY } from "../../data/planets";
import { PLANET_IN_SIGN } from "../../data/interpretations";
import { formatDegreeInSign, toFaDigits } from "../../lib/dates";
import type { AstrologyProfile, PlanetKey } from "../../types";

const CARD_KEYS: PlanetKey[] = ["sun", "moon", "mercury", "venus", "mars"];

const SummaryCards = ({ profile }: { profile: AstrologyProfile }) => {
  const cards = [...CARD_KEYS.map((k) => ({ kind: "planet" as const, key: k })), { kind: "asc" as const }];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((c, idx) => {
        if (c.kind === "asc") {
          const asc = profile.ascendant;
          return (
            <article
              key="asc"
              className="glass glow-lift group rounded-xl p-5 hover:-translate-y-1 hover:border-gold-500/40"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold-500/40 bg-gold-500/10 text-xl text-gold-300">
                  <span className="font-latin text-sm font-bold">ASC</span>
                </span>
                <span className="font-latin text-[9px] tracking-[0.25em] text-ink-600">RISING</span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-ink-200">طلوع (رایزینگ)</h3>
              {asc ? (
                <>
                  <p className="font-display mt-1 text-xl text-gold-300">
                    {SIGN_BY_KEY[asc.signKey].fa} {SIGN_BY_KEY[asc.signKey].glyph}
                  </p>
                  <p className="mt-1 text-xs text-ink-500">{formatDegreeInSign(asc.degreeInSign)}</p>
                  <p className="mt-2 text-xs leading-5 text-ink-400">چهره‌ای که دنیا اول می‌بیند؛ سبکِ ورود شما به تجربه‌ها.</p>
                </>
              ) : (
                <>
                  <p className="font-display mt-1 text-xl text-ink-600">نامشخص</p>
                  <p className="mt-2 text-xs leading-5 text-ink-500">
                    بدون ساعت تولد، طالع قابل محاسبه نیست.
                  </p>
                </>
              )}
            </article>
          );
        }

        const key = c.key;
        const pos = profile.planets[key];
        const meta = PLANET_BY_KEY[key];
        const sign = SIGN_BY_KEY[pos.signKey];
        return (
          <article
            key={key}
            className="glass glow-lift group rounded-xl p-5 hover:-translate-y-1"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="flex items-center justify-between">
              <span
                className="glyph flex h-11 w-11 items-center justify-center rounded-lg border text-2xl transition-transform duration-300 group-hover:scale-110"
                style={{ color: meta.color, borderColor: `${meta.color}45`, background: `${meta.color}12` }}
                aria-hidden="true"
              >
                {meta.glyph}
              </span>
              <span className="font-latin text-[9px] tracking-[0.25em] text-ink-600">{meta.en.toUpperCase()}</span>
            </div>
            <h3 className="mt-3 text-sm font-bold text-ink-200">{meta.fa}</h3>
            <p className="font-display mt-1 text-xl" style={{ color: meta.color }}>
              {sign.fa} {sign.glyph}
            </p>
            <p className="mt-1 flex items-center gap-2 text-xs text-ink-500">
              {formatDegreeInSign(pos.degreeInSign)}
              {pos.house && <span>· خانه {toFaDigits(pos.house)}</span>}
              {pos.retrograde && (
                <span className="rounded bg-mystic-500/15 px-1.5 py-0.5 text-[10px] text-mystic-300">بازگشتی ℞</span>
              )}
            </p>
            <p className="mt-2 text-xs leading-5 text-ink-400">{PLANET_IN_SIGN[key][pos.signIndex]}</p>
          </article>
        );
      })}
    </div>
  );
};

export default SummaryCards;
