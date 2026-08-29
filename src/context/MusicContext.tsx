import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { musicEngine } from "../lib/musicEngine";
import { MUSIC_TRACKS, trackForPath, HOME_ZONES } from "../data/music";
import type { AmbientTrackConfig, TrackId } from "../data/music";

interface MusicState {
  enabled: boolean;
  muted: boolean;
  volume: number;
  playing: boolean;
  blocked: boolean;
  currentTrack: AmbientTrackConfig;
  toggleEnabled: () => void;
  toggleMuted: () => void;
  setVolume: (v: number) => void;
  /** Zone-driven override used by the Home page scroll listener */
  setZoneTrack: (zone: string | null) => void;
}

const MusicContext = createContext<MusicState | null>(null);
const STORAGE_KEY = "astroprofile:music:v1";

interface Prefs {
  enabled: boolean;
  muted: boolean;
  volume: number;
}

const loadPrefs = (): Prefs => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Prefs>;
      return {
        enabled: p.enabled !== false,
        muted: !!p.muted,
        volume: typeof p.volume === "number" ? Math.min(1, Math.max(0, p.volume)) : 0.55,
      };
    }
  } catch {
    /* ignore */
  }
  return { enabled: true, muted: false, volume: 0.55 };
};

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [zone, setZone] = useState<string | null>(null);
  const [engineTick, setEngineTick] = useState(0);
  const unlockedRef = useRef(false);

  const routeTrack = trackForPath(location.pathname);
  const zoneTrack = zone ? HOME_ZONES.find((z) => z.zone === zone)?.track ?? null : null;
  const activeTrackId: TrackId = zoneTrack ?? routeTrack;
  const activeTrack = MUSIC_TRACKS[activeTrackId];

  /* Persist preferences */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* private mode */
    }
  }, [prefs]);

  /* Sync engine knobs with prefs */
  useEffect(() => {
    musicEngine.enabled = prefs.enabled;
    musicEngine.setVolume(prefs.volume);
    musicEngine.setMuted(prefs.muted);
  }, [prefs]);

  /* Subscribe to engine status changes */
  useEffect(() => musicEngine.subscribe(() => setEngineTick((t) => t + 1)), []);

  /* Autoplay unlock: browsers require a user gesture — arm one-time listeners */
  useEffect(() => {
    if (unlockedRef.current) return;
    const tryStart = () => {
      if (!musicEngine.enabled || unlockedRef.current) return;
      void musicEngine.resume().then((ok) => {
        if (ok) {
          unlockedRef.current = true;
          musicEngine.replayCurrent();
        }
      });
    };
    const opts = { once: false, passive: true } as AddEventListenerOptions;
    window.addEventListener("pointerdown", tryStart, opts);
    window.addEventListener("keydown", tryStart, opts);
    return () => {
      window.removeEventListener("pointerdown", tryStart);
      window.removeEventListener("keydown", tryStart);
    };
  }, [engineTick]);

  /* Play the right track whenever route/zone/prefs change */
  useEffect(() => {
    if (!prefs.enabled) {
      musicEngine.stopAll(900);
      return;
    }
    void musicEngine.playTrack(MUSIC_TRACKS[activeTrackId]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrackId, prefs.enabled, engineTick]);

  /* Attempt an immediate start on mount (works if the browser allows it) */
  useEffect(() => {
    if (prefs.enabled) {
      void musicEngine.resume().then((ok) => {
        if (ok) {
          unlockedRef.current = true;
          musicEngine.replayCurrent();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleEnabled = useCallback(() => {
    setPrefs((p) => {
      const next = { ...p, enabled: !p.enabled };
      if (next.enabled) unlockedRef.current = true; // explicit user intent = gesture
      return next;
    });
  }, []);

  const toggleMuted = useCallback(() => setPrefs((p) => ({ ...p, muted: !p.muted })), []);
  const setVolume = useCallback((v: number) => setPrefs((p) => ({ ...p, volume: v })), []);
  const setZoneTrack = useCallback((z: string | null) => setZone(z), []);

  const value = useMemo<MusicState>(
    () => ({
      enabled: prefs.enabled,
      muted: prefs.muted,
      volume: prefs.volume,
      playing: musicEngine.status === "playing",
      blocked: musicEngine.status === "blocked",
      currentTrack: activeTrack,
      toggleEnabled,
      toggleMuted,
      setVolume,
      setZoneTrack,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prefs, activeTrackId, engineTick, toggleEnabled, toggleMuted, setVolume, setZoneTrack],
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
};

export const useMusic = (): MusicState => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used inside MusicProvider");
  return ctx;
};
