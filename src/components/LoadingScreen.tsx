import { useEffect, useState } from "react";
import { Check } from "lucide-react";

const STEPS = [
  "در حال ترسیم نقشه آسمان لحظه تولد شما...",
  "در حال محاسبه موقعیت سیارات...",
  "در حال آماده‌سازی پروفایل شما...",
];

/**
 * Celestial loading sequence shown while the chart is computed.
 * The Swiss Ephemeris finishes in milliseconds; the sequence keeps a
 * minimum ~2.6s dwell so the transition feels ceremonial, not jarring.
 */
const LoadingScreen = ({ onDone }: { onDone: () => void }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 950),
      setTimeout(() => setStep(2), 1900),
      setTimeout(onDone, 2750),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night-950/95 px-6 backdrop-blur-sm">
      {/* Orbiting loader */}
      <div className="relative h-44 w-44" aria-hidden="true">
        <div className="absolute inset-0 rounded-full border border-gold-500/25" />
        <div className="absolute inset-6 rounded-full border border-mystic-500/25" />
        <div className="absolute inset-12 rounded-full border border-gold-500/15" />
        <div className="absolute inset-0 animate-spin-slow">
          <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400 shadow-[0_0_18px_rgba(230,197,106,0.9)]" />
        </div>
        <div className="absolute inset-0 animate-spin-rev">
          <span className="absolute left-1/2 top-6 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mystic-300 shadow-[0_0_14px_rgba(179,167,232,0.9)]" />
        </div>
        <div className="absolute inset-0 animate-spin-slow [animation-duration:12s]">
          <span className="absolute left-1/2 top-12 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-airx-400 shadow-[0_0_12px_rgba(124,199,216,0.9)]" />
        </div>
        <span className="glyph absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-soft text-3xl text-gold-300">
          ☉
        </span>
      </div>

      <div className="mt-10 w-full max-w-sm space-y-3" role="status" aria-live="polite">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-all duration-500 ${
              i < step
                ? "border-gold-500/25 bg-gold-500/5 text-gold-300"
                : i === step
                  ? "border-mystic-500/40 bg-night-850 text-ink-50"
                  : "border-mystic-600/15 text-ink-600 opacity-50"
            }`}
          >
            {i < step ? (
              <Check className="h-4 w-4 shrink-0 text-gold-400" />
            ) : i === step ? (
              <span className="h-4 w-4 shrink-0 animate-pulse rounded-full border-2 border-mystic-400 border-t-transparent" />
            ) : (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink-600" />
            )}
            {s}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
