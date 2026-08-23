import { useMemo, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { ZODIAC_SIGNS, ELEMENT_FA } from "../data/zodiac";
import { PLANETS, PLANET_BY_KEY, ASPECT_FA } from "../data/planets";
import { PLANET_IN_SIGN } from "../data/interpretations";
import { SIGN_BY_KEY } from "../data/zodiac";
import { formatDegreeInSign, toFaDigits } from "../lib/dates";
import type { AspectType, AstrologyProfile, PlanetKey } from "../types";

const C = 500;
const R_OUT = 470; // zodiac band outer
const R_SIGN_IN = 372; // zodiac band inner
const R_TICK_OUT = 368;
const R_TICK_IN = 354;
const R_HOUSE_OUT = 350;
const R_HOUSE_IN = 240;
const R_ASPECT = 226;
const R_CENTER = 148;
const PLANET_BANDS = [262, 300, 338];

interface WheelProps {
  profile: AstrologyProfile;
  selected: PlanetKey | null;
  onSelect: (key: PlanetKey | null) => void;
  centerTitle?: string;
}

const norm = (d: number) => ((d % 360) + 360) % 360;

const ZodiacWheel = ({ profile, selected, onSelect, centerTitle }: WheelProps) => {
  const [zoom, setZoom] = useState(1);
  const [aspectFilter, setAspectFilter] = useState<Record<AspectType, boolean>>({
    conjunction: true,
    sextile: true,
    square: true,
    trine: true,
    opposition: true,
  });

  const hasAngles = !!profile.ascendant && !!profile.houses;
  const baseLon = profile.ascendant?.longitude ?? 0;

  // Screen angle: ascendant at 9 o'clock, zodiac increases counter-clockwise
  const angle = (lon: number) => norm(180 - (lon - baseLon));
  const pt = (r: number, lon: number) => {
    const rad = (angle(lon) * Math.PI) / 180;
    return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) };
  };
  const band = (rIn: number, rOut: number, lonA: number, lonB: number) => {
    const p1 = pt(rOut, lonA);
    const p2 = pt(rOut, lonB);
    const p3 = pt(rIn, lonB);
    const p4 = pt(rIn, lonA);
    const large = norm(lonB - lonA) > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${rOut} ${rOut} 0 ${large} 0 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rIn} ${rIn} 0 ${large} 1 ${p4.x} ${p4.y} Z`;
  };

  /* ---- planet label collision avoidance ---- */
  const planetLayout = useMemo(() => {
    const sorted = [...PLANETS].sort(
      (a, b) => profile.planets[a.key].longitude - profile.planets[b.key].longitude,
    );
    const placed: Array<{ key: PlanetKey; band: number; lon: number }> = [];
    for (const p of sorted) {
      const lon = profile.planets[p.key].longitude;
      let best = PLANET_BANDS[0];
      let bestGap = -1;
      for (const b of PLANET_BANDS) {
        const inBand = placed.filter((q) => q.band === b);
        const minGap = inBand.length
          ? Math.min(
              ...inBand.map((q) => {
                const d = Math.abs(lon - q.lon) % 360;
                return d > 180 ? 360 - d : d;
              }),
            )
          : 360;
        if (minGap > bestGap) {
          bestGap = minGap;
          best = b;
        }
        if (minGap >= 16) {
          best = b;
          bestGap = minGap;
          break;
        }
      }
      placed.push({ key: p.key, band: best, lon });
    }
    return placed;
  }, [profile]);

  const visibleAspects = profile.aspects.filter((a) => aspectFilter[a.type]);
  const sel = selected ? profile.planets[selected] : null;
  const selMeta = selected ? PLANET_BY_KEY[selected] : null;

  const HOUSE_NUM = ["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۱۰", "۱۱", "۱۲"];

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Zoom controls */}
      <div className="flex items-center gap-2 self-end" role="group" aria-label="بزرگ‌نمایی چارت">
        <button
          className="btn-ghost !p-2.5"
          onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.3).toFixed(2)))}
          aria-label="بزرگ‌نمایی"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          className="btn-ghost !p-2.5"
          onClick={() => setZoom((z) => Math.max(1, +(z - 0.3).toFixed(2)))}
          aria-label="کوچک‌نمایی"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button className="btn-ghost !p-2.5" onClick={() => setZoom(1)} aria-label="اندازه اصلی">
          <Maximize2 className="h-4 w-4" />
        </button>
        <span className="ms-2 text-xs text-ink-500">{toFaDigits(Math.round(zoom * 100))}٪</span>
      </div>

      <div className="relative w-full max-w-[640px] overflow-hidden rounded-full">
        <div style={{ transform: `scale(${zoom})`, transition: "transform .35s ease" }}>
          <svg
            viewBox="0 0 1000 1000"
            className="w-full"
            role="img"
            aria-label={`چارت تولد دایره‌ای${centerTitle ? ` برای ${centerTitle}` : ""}`}
          >
            <defs>
              <radialGradient id="centerGrad" cx="50%" cy="42%" r="65%">
                <stop offset="0%" stopColor="#141b44" />
                <stop offset="100%" stopColor="#0a102c" />
              </radialGradient>
              <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="#0a102c" stopOpacity="0" />
                <stop offset="100%" stopColor="#1a2354" stopOpacity="0.5" />
              </radialGradient>
            </defs>

            <circle cx={C} cy={C} r={R_OUT + 22} fill="url(#bgGlow)" />

            {/* Rotating dashed halo */}
            <g className="animate-spin-slower" style={{ transformOrigin: "500px 500px" }}>
              <circle cx={C} cy={C} r={R_OUT + 16} fill="none" stroke="rgba(212,175,55,0.22)" strokeWidth="1" strokeDasharray="3 14" />
            </g>
            <circle cx={C} cy={C} r={R_OUT + 4} fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="1.4" />
            <circle cx={C} cy={C} r={R_SIGN_IN - 2} fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />

            {/* Zodiac sign sectors */}
            {ZODIAC_SIGNS.map((s, i) => {
              const lonA = i * 30;
              const el = ELEMENT_FA[s.element];
              const mid = pt(421, lonA + 15);
              return (
                <g key={s.key}>
                  <path d={band(R_SIGN_IN, R_OUT, lonA, lonA + 30)} fill={el.color} opacity={0.085} />
                  <line
                    x1={pt(R_SIGN_IN, lonA).x}
                    y1={pt(R_SIGN_IN, lonA).y}
                    x2={pt(R_OUT, lonA).x}
                    y2={pt(R_OUT, lonA).y}
                    stroke="rgba(214,217,238,0.18)"
                    strokeWidth="1"
                  />
                  <text
                    x={mid.x}
                    y={mid.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="36"
                    fill={el.color}
                    className="glyph"
                  >
                    {s.glyph}
                  </text>
                </g>
              );
            })}

            {/* Degree ticks */}
            {Array.from({ length: 72 }, (_, i) => i * 5).map((deg) => {
              const major = deg % 30 === 0;
              const mid = deg % 10 === 0;
              const r1 = major ? R_TICK_IN - 4 : mid ? R_TICK_IN : R_TICK_IN + 5;
              const a = pt(r1, deg);
              const b = pt(R_TICK_OUT, deg);
              return (
                <line
                  key={deg}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={major ? "rgba(230,197,106,0.75)" : "rgba(214,217,238,0.28)"}
                  strokeWidth={major ? 2 : 1}
                />
              );
            })}

            {/* Houses */}
            {profile.houses?.map((h) => {
              const isAngle = [1, 4, 7, 10].includes(h.house);
              const a = pt(R_HOUSE_IN, h.longitude);
              const b = pt(R_HOUSE_OUT, h.longitude);
              const next = profile.houses![h.house % 12];
              const midLon = h.longitude + norm(next.longitude - h.longitude) / 2;
              const numPos = pt(295, midLon);
              return (
                <g key={h.house}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={isAngle ? "rgba(230,197,106,0.7)" : "rgba(179,167,232,0.3)"}
                    strokeWidth={isAngle ? 2 : 1.2}
                  />
                  <text
                    x={numPos.x}
                    y={numPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="21"
                    fill={isAngle ? "rgba(230,197,106,0.85)" : "rgba(166,171,208,0.7)"}
                  >
                    {HOUSE_NUM[h.house - 1]}
                  </text>
                </g>
              );
            })}

            {/* Angle axis lines + labels */}
            {hasAngles && profile.ascendant && (
              <g>
                {([profile.ascendant.longitude, profile.ascendant.longitude + 180] as const).map((lon, i) => {
                  const p = pt(R_HOUSE_OUT, lon);
                  return <line key={i} x1={C} y1={C} x2={p.x} y2={p.y} stroke="rgba(230,197,106,0.35)" strokeWidth="1.2" strokeDasharray="6 6" />;
                })}
                {profile.mc &&
                  ([profile.mc.longitude, profile.mc.longitude + 180] as const).map((lon, i) => {
                    const p = pt(R_HOUSE_OUT, lon);
                    return <line key={`mc${i}`} x1={C} y1={C} x2={p.x} y2={p.y} stroke="rgba(153,135,219,0.35)" strokeWidth="1.2" strokeDasharray="6 6" />;
                  })}
                {[
                  { lon: profile.ascendant.longitude, label: "ASC" },
                  { lon: profile.ascendant.longitude + 180, label: "DSC" },
                  { lon: profile.mc!.longitude, label: "MC" },
                  { lon: profile.mc!.longitude + 180, label: "IC" },
                ].map((l) => {
                  const p = pt(R_SIGN_IN - 14, l.lon);
                  return (
                    <text
                      key={l.label}
                      x={p.x}
                      y={p.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="17"
                      fontWeight="700"
                      fill="rgba(230,197,106,0.9)"
                      className="font-latin"
                    >
                      {l.label}
                    </text>
                  );
                })}
              </g>
            )}

            {/* Aspect chords */}
            {visibleAspects.map((a) => {
              const p1 = pt(R_ASPECT, profile.planets[a.p1].longitude);
              const p2 = pt(R_ASPECT, profile.planets[a.p2].longitude);
              const meta = ASPECT_FA[a.type];
              const strength = 0.18 + (1 - a.orb / meta.orb) * 0.5;
              return (
                <line
                  key={`${a.p1}-${a.p2}-${a.type}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={meta.color}
                  strokeWidth={a.orb < 2 ? 2.6 : 1.7}
                  opacity={strength}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Center disc */}
            <circle cx={C} cy={C} r={R_CENTER} fill="url(#centerGrad)" stroke="rgba(212,175,55,0.35)" strokeWidth="1.4" />
            {sel && selMeta ? (
              <g textAnchor="middle">
                <text x={C} y={C - 62} fontSize="44" fill={selMeta.color} className="glyph">
                  {selMeta.glyph}
                </text>
                <text x={C} y={C - 16} fontSize="26" fontWeight="700" fill="#f4f3fc" fontFamily="Vazirmatn">
                  {selMeta.fa}
                </text>
                <text x={C} y={C + 16} fontSize="20" fill="#e6c56a" fontFamily="Vazirmatn">
                  {SIGN_BY_KEY[sel.signKey].fa} {SIGN_BY_KEY[sel.signKey].glyph}
                </text>
                <text x={C} y={C + 46} fontSize="18" fill="#a6abd0" fontFamily="Vazirmatn">
                  {formatDegreeInSign(sel.degreeInSign)}
                  {sel.house ? ` · خانه ${toFaDigits(sel.house)}` : ""}
                  {sel.retrograde ? " · ℞" : ""}
                </text>
                <text x={C} y={C + 78} fontSize="14" fill="#8a90ba" fontFamily="Vazirmatn">
                  {PLANET_IN_SIGN[sel.planet][sel.signIndex].slice(0, 42)}…
                </text>
              </g>
            ) : (
              <g textAnchor="middle">
                {centerTitle && (
                  <text x={C} y={C - 58} fontSize="26" fontWeight="700" fill="#f0d98f" fontFamily="Vazirmatn">
                    {centerTitle}
                  </text>
                )}
                <text x={C} y={C - 6} fontSize="34" fill="#cfd6f0" className="glyph">
                  {PLANET_BY_KEY.sun.glyph} {SIGN_BY_KEY[profile.planets.sun.signKey].glyph}
                  {"  "}
                  {PLANET_BY_KEY.moon.glyph} {SIGN_BY_KEY[profile.planets.moon.signKey].glyph}
                  {profile.ascendant ? `  ${SIGN_BY_KEY[profile.ascendant.signKey].glyph}` : ""}
                </text>
                <text x={C} y={C + 34} fontSize="16" fill="#8a90ba" fontFamily="Vazirmatn">
                  خورشید · ماه{profile.ascendant ? " · طالع" : ""}
                </text>
                <text x={C} y={C + 64} fontSize="13" fill="#6d7399" fontFamily="Vazirmatn">
                  روی هر سیاره کلیک کنید
                </text>
              </g>
            )}

            {/* Planets */}
            {planetLayout.map(({ key, band: b, lon }) => {
              const pos = profile.planets[key];
              const meta = PLANET_BY_KEY[key];
              const P = pt(b, lon);
              const E = pt(R_TICK_IN + 2, lon);
              const isSel = selected === key;
              return (
                <g
                  key={key}
                  onClick={() => onSelect(isSel ? null : key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(isSel ? null : key);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${meta.fa} در ${SIGN_BY_KEY[pos.signKey].fa}، ${formatDegreeInSign(pos.degreeInSign)}${pos.retrograde ? "، بازگشتی" : ""}`}
                  aria-pressed={isSel}
                  className="cursor-pointer outline-none transition-transform duration-200 hover:scale-110"
                  style={{ transformOrigin: `${P.x}px ${P.y}px` }}
                >
                  <line x1={E.x} y1={E.y} x2={P.x} y2={P.y} stroke={meta.color} strokeWidth="1.3" opacity="0.5" />
                  {isSel && <circle cx={P.x} cy={P.y} r={27} fill="none" stroke="rgba(230,197,106,0.85)" strokeWidth="2" />}
                  <circle cx={P.x} cy={P.y} r={21} fill="#0a102c" stroke={meta.color} strokeWidth={isSel ? 2.4 : 1.5} />
                  <text
                    x={P.x}
                    y={P.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="22"
                    fill={meta.color}
                    className="glyph"
                  >
                    {meta.glyph}
                  </text>
                  {pos.retrograde && (
                    <g>
                      <circle cx={P.x + 16} cy={P.y - 15} r={8} fill="#1a2354" stroke={meta.color} strokeWidth="1" />
                      <text x={P.x + 16} y={P.y - 14.5} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="700" fill={meta.color}>
                        R
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Aspect legend / filters */}
      <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="فیلتر زوایا">
        {(Object.keys(ASPECT_FA) as AspectType[]).map((t) => {
          const meta = ASPECT_FA[t];
          const on = aspectFilter[t];
          return (
            <button
              key={t}
              onClick={() => setAspectFilter((f) => ({ ...f, [t]: !f[t] }))}
              aria-pressed={on}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                on ? "border-transparent text-ink-50" : "border-mystic-600/25 text-ink-600 opacity-50"
              }`}
              style={on ? { background: `${meta.color}22`, borderColor: `${meta.color}66` } : undefined}
            >
              <span className="inline-block h-0.5 w-5 rounded" style={{ background: meta.color }} />
              {meta.label} <span className="font-latin text-[10px] tracking-wider">{meta.en}</span>
            </button>
          );
        })}
      </div>

      {!hasAngles && (
        <p className="max-w-xl text-center text-xs leading-6 text-ink-500">
          ⏳ ساعت تولد ثبت نشده است؛ این نمایش با شروعِ طبیعیِ حمل تنظیم شده و خانه‌ها و طالع محاسبه نشده‌اند —
          موقعیت سیاره‌ها و برج‌ها دقیق است.
        </p>
      )}
    </div>
  );
};

export default ZodiacWheel;
