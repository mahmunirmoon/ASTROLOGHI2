import Reveal from "./Reveal";

/** Icon: code brackets with a small star — programming meets astronomy */
const CodeStarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path
      d="M12 1.4l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9Z"
      fill="currentColor"
      stroke="none"
    />
    <path d="m7.5 10.5-4 3.75 4 3.75" />
    <path d="m16.5 10.5 4 3.75-4 3.75" />
    <path d="m13.3 10-2.6 9" />
  </svg>
);

/** Faint decorative constellation on the far (left) side of the panel */
const Constellation = () => (
  <svg
    viewBox="0 0 220 140"
    className="absolute left-6 top-1/2 hidden h-32 w-52 -translate-y-1/2 lg:block"
    aria-hidden="true"
  >
    <g stroke="rgba(230,197,106,0.22)" strokeWidth="1">
      <line x1="18" y1="106" x2="58" y2="52" />
      <line x1="58" y1="52" x2="98" y2="90" />
      <line x1="98" y1="90" x2="136" y2="30" />
      <line x1="136" y1="30" x2="178" y2="66" />
      <line x1="178" y1="66" x2="204" y2="112" />
    </g>
    {[
      [18, 106, 2.4, false],
      [58, 52, 3.4, true],
      [98, 90, 2.6, false],
      [136, 30, 3.8, true],
      [178, 66, 2.8, false],
      [204, 112, 2.2, true],
    ].map(([x, y, r, twinkle], i) => (
      <circle
        key={i}
        cx={x as number}
        cy={y as number}
        r={r as number}
        fill="#e6c56a"
        opacity="0.85"
        className={twinkle ? "animate-pulse-soft" : undefined}
      />
    ))}
  </svg>
);

/**
 * «درباره سازنده» — closing signature panel of the landing page.
 * Reachable from the main menu via smooth scroll (#about-creator).
 */
const AboutCreator = () => (
  <section
    id="about-creator"
    className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-4 pt-16 sm:px-6"
    aria-labelledby="about-creator-title"
  >
    <Reveal>
      <div className="glass group relative overflow-hidden rounded-xl p-8 transition-colors duration-300 hover:border-gold-500/35 sm:p-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold-500/60 to-transparent" />
        <span
          className="glyph pointer-events-none absolute -bottom-10 -left-4 select-none text-[160px] leading-none text-gold-500/[0.05]"
          aria-hidden="true"
        >
          ☽
        </span>
        <Constellation />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14">
          {/* Title block */}
          <div className="shrink-0 lg:w-64">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-gold-500/45 bg-gold-500/10 text-gold-300 transition-transform duration-300 group-hover:scale-110">
              <CodeStarIcon />
            </span>
            <p className="font-latin mt-5 text-[10px] font-semibold tracking-[0.42em] text-gold-500/80">
              ABOUT THE CREATOR
            </p>
            <h2 id="about-creator-title" className="font-display mt-2 text-2xl text-ink-50 sm:text-3xl">
              درباره سازنده
            </h2>
            <div className="gold-line mt-4 w-16 transition-all duration-500 group-hover:w-28" />
          </div>

          {/* Exact signature text */}
          <p className="font-display text-2xl leading-[1.95] text-ink-100 sm:text-[27px] sm:leading-[1.9]">
            این برنامه توسط <span className="text-gold-300 text-glow-gold">فاطمه</span> برنامه‌نویسی شده، از
            دانش‌آموزان <span className="text-mystic-300">دکتر ماه منیر آقایی</span>، در{" "}
            <span className="text-airx-400">آگوست ۲۰۲۶</span>.
          </p>
        </div>
      </div>
    </Reveal>
  </section>
);

export default AboutCreator;
