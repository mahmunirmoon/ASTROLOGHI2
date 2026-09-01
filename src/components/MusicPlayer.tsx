import { useState } from "react";
import { Play, Pause, Volume2, VolumeX, X, Music4 } from "lucide-react";
import { useMusic } from "../context/MusicContext";

const Eq = () => (
  <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="eq-bar w-[2px] rounded-full bg-gold-400"
        style={{ animationDelay: `${i * 0.18}s`, height: "100%" }}
      />
    ))}
  </span>
);

/** Compact music control designed to live inside the main header/navigation. */
const MusicPlayer = ({ mobile = false }: { mobile?: boolean }) => {
  const { enabled, muted, volume, playing, blocked, currentTrack, toggleEnabled, toggleMuted, setVolume } = useMusic();
  const [open, setOpen] = useState(false);

  const statusText = !enabled ? "خاموش" : blocked ? "برای پخش کلیک کنید" : playing ? "در حال پخش" : "آماده";

  return (
    <div className={`relative ${mobile ? "w-full" : "shrink-0"}`} dir="rtl">
      <button
        className={`group relative flex items-center justify-center rounded-lg border backdrop-blur-xl transition-all duration-200 ${
          mobile ? "h-10 w-full gap-2 px-3" : "h-8 w-8"
        } ${
          enabled && playing
            ? "border-gold-500/45 bg-gold-500/10 text-gold-300 shadow-[0_0_14px_rgba(212,175,55,0.18)]"
            : "border-mystic-600/35 bg-night-850/70 text-ink-400 hover:text-ink-100"
        }`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`کنترل موسیقی — ${statusText}`}
        title="موسیقی"
      >
        <Music4 className="h-4 w-4" />
        {mobile && <span className="text-xs font-medium">موسیقی</span>}
        {enabled && playing && (
          <span className="absolute -left-0.5 -top-0.5 h-2 w-2 rounded-full bg-gold-400 shadow-[0_0_7px_rgba(230,197,106,0.9)]" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div
          className={`glass z-50 rounded-xl p-3 shadow-2xl ${
            mobile
              ? "mt-2 w-full"
              : "absolute left-0 top-[calc(100%+10px)] w-64"
          }`}
          role="region"
          aria-label="کنترل موسیقی"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-display text-sm text-gold-300">{currentTrack.titleFa}</p>
              <p className="mt-0.5 truncate text-[10px] text-mystic-300">{currentTrack.moodFa}</p>
            </div>
            <button
              className="rounded-md p-1 text-ink-500 transition-colors hover:text-ink-50"
              onClick={() => setOpen(false)}
              aria-label="بستن کنترل موسیقی"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/10 text-gold-300 transition-all hover:bg-gold-500/20"
              onClick={toggleEnabled}
              aria-label={enabled ? "توقف موسیقی" : "پخش موسیقی"}
            >
              {enabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 -mr-0.5" />}
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full border border-mystic-600/35 text-ink-300 transition-all hover:text-ink-50"
              onClick={toggleMuted}
              aria-label={muted ? "فعال‌سازی صدا" : "بی‌صدا"}
              aria-pressed={muted}
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
            <div className="min-w-0 flex-1 px-1">
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

          <div className="mt-2 flex items-center justify-between border-t border-mystic-600/15 pt-2">
            <span className="text-[10px] text-ink-500">{statusText}</span>
            {enabled && playing && <Eq />}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
