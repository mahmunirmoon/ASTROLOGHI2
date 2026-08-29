import { useState } from "react";
import { Play, Pause, Volume2, VolumeX, X, Music4 } from "lucide-react";
import { useMusic } from "../context/MusicContext";

/** Equalizer bars shown while a track is playing */
const Eq = () => (
  <span className="flex h-3.5 items-end gap-[3px]" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="eq-bar w-[3px] rounded-full bg-gold-400"
        style={{ animationDelay: `${i * 0.18}s`, height: "100%" }}
      />
    ))}
  </span>
);

/**
 * Floating ambient-music control.
 * Compact by default; expands into a panel with full controls.
 */
const MusicPlayer = () => {
  const { enabled, muted, volume, playing, blocked, currentTrack, toggleEnabled, toggleMuted, setVolume } =
    useMusic();
  const [open, setOpen] = useState(false);

  const statusText = !enabled ? "موسیقی خاموش" : blocked ? "برای پخش، کلیک کنید" : playing ? "در حال پخش" : "آماده";

  return (
    <div className="fixed bottom-5 left-5 z-40" dir="rtl">
      {/* Expanded panel */}
      {open && (
        <div className="animate-fade-up glass mb-3 w-72 rounded-xl p-4 shadow-2xl" role="region" aria-label="کنترل موسیقی">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg leading-tight text-gold-300">{currentTrack.titleFa}</p>
              <p className="font-latin mt-0.5 text-[9px] tracking-[0.28em] text-ink-600">
                {currentTrack.titleEn.toUpperCase()}
              </p>
            </div>
            <button
              className="rounded-md p-1 text-ink-500 transition-colors hover:text-ink-50"
              onClick={() => setOpen(false)}
              aria-label="بستن کنترل موسیقی"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-mystic-300">{currentTrack.moodFa}</p>

          <div className="mt-4 flex items-center gap-2">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/45 bg-gold-500/10 text-gold-300 transition-all hover:scale-105 hover:bg-gold-500/20 active:scale-95"
              onClick={toggleEnabled}
              aria-label={enabled ? "توقف موسیقی" : "پخش موسیقی"}
            >
              {enabled ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5 -mr-0.5" />}
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-mystic-600/40 text-ink-300 transition-all hover:scale-105 hover:text-ink-50 active:scale-95"
              onClick={toggleMuted}
              aria-label={muted ? "فعال‌سازی صدا" : "بی‌صدا"}
              aria-pressed={muted}
            >
              {muted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
            </button>
            <div className="flex-1 px-1">
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                className="music-range w-full"
                aria-label="بلندی صدا"
                disabled={muted}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-mystic-600/15 pt-2.5">
            <span className="text-[11px] text-ink-500">{statusText}</span>
            {enabled && playing && <Eq />}
          </div>
          <p className="mt-2 text-[9px] leading-4 text-ink-600">
            موسیقی محیطیِ مولد — ویژه‌ی هر بخش؛ با ورود به هر صفحه، فضا عوض می‌شود.
          </p>
        </div>
      )}

      {/* Compact floating button */}
      <button
        className={`group relative flex h-13 w-13 items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-300 ${
          enabled && playing
            ? "border-gold-500/50 bg-night-850/90 text-gold-300 shadow-[0_0_28px_rgba(212,175,55,0.28)] hover:shadow-[0_0_40px_rgba(212,175,55,0.4)]"
            : "border-mystic-600/40 bg-night-850/90 text-ink-400 hover:text-ink-100"
        } h-[52px] w-[52px]`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`کنترل موسیقی — ${statusText}`}
        title="موسیقی"
      >
        {/* spinning orbit ring while playing */}
        {enabled && playing && (
          <span className="animate-spin-slow absolute inset-[-5px] rounded-full border border-dashed border-gold-500/40" aria-hidden="true" />
        )}
        {blocked && (
          <span className="animate-pulse-soft absolute inset-0 rounded-full border border-airx-400/50" aria-hidden="true" />
        )}
        <Music4 className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
        {enabled && playing && (
          <span className="absolute -top-0.5 -left-0.5 h-2.5 w-2.5 rounded-full bg-gold-400 shadow-[0_0_10px_rgba(230,197,106,0.9)]" aria-hidden="true" />
        )}
      </button>
    </div>
  );
};

export default MusicPlayer;
