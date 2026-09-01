/**
 * AmbientMusicEngine — generative ambient soundtrack for AstroProfile AI.
 *
 * Composes calm, cosmic soundscapes in real time with the Web Audio API:
 * layered detuned pads + slow filter breathing + airy noise + a look-ahead
 * scheduled pentatonic arpeggio + shimmer pings through a feedback delay.
 *
 * If a track config provides a `file` URL, an <audio>-style bufferless
 * HTMLAudioElement source is used instead of synthesis — making it trivial
 * to swap in recorded music later without touching any UI code.
 */
import type { AmbientTrackConfig } from "../data/music";

export type EngineStatus = "off" | "blocked" | "playing";

interface TrackInstance {
  id: string;
  gain: GainNode;
  stop: (fadeMs: number) => void;
  media?: HTMLAudioElement;
}

const FADE_MS = 1700;

class AmbientMusicEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private active: TrackInstance | null = null;
  private currentConfig: AmbientTrackConfig | null = null;
  private suspendTimer: number | null = null;

  volume = 0.55;
  muted = false;
  enabled = true;
  status: EngineStatus = "off";

  private listeners = new Set<() => void>();

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  private emit = () => this.listeners.forEach((fn) => fn());

  /* ---------------- context lifecycle ---------------- */

  private ensureContext(): AudioContext {
    if (this.ctx) return this.ctx;
    const Ctor: typeof AudioContext =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = this.effectiveVolume();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 18;
    comp.ratio.value = 5;
    comp.attack.value = 0.01;
    comp.release.value = 0.32;
    master.connect(comp);
    comp.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    return ctx;
  }

  private effectiveVolume = () => (this.muted ? 0 : this.volume * this.volume);

  /** Try to start audio; resolves true when actually running. */
  async resume(): Promise<boolean> {
    const ctx = this.ensureContext();
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        /* gesture may still be required */
      }
    }
    return ctx.state === "running";
  }

  private setStatus(s: EngineStatus) {
    if (this.status === s) return;
    this.status = s;
    this.emit();
  }

  /* ---------------- transport ---------------- */

  /** Play a track (crossfading from whatever is active). */
  async playTrack(config: AmbientTrackConfig) {
    this.currentConfig = config;
    if (!this.enabled) {
      this.setStatus("off");
      return;
    }
    const running = await this.resume();
    if (!running || !this.ctx || !this.master) {
      this.setStatus("blocked");
      return;
    }
    if (this.suspendTimer) {
      window.clearTimeout(this.suspendTimer);
      this.suspendTimer = null;
    }
    if (this.active?.id === config.id) {
      this.setStatus("playing");
      return;
    }
    const old = this.active;
    this.active = config.file
      ? this.buildFileInstance(config)
      : this.buildSynthInstance(config);
    if (old) old.stop(FADE_MS);
    this.setStatus("playing");
  }

  /** Fade everything out; used when the user disables music. */
  stopAll(fadeMs = 900) {
    this.active?.stop(fadeMs);
    this.active = null;
    this.setStatus("off");
    if (this.ctx && this.ctx.state === "running") {
      this.suspendTimer = window.setTimeout(() => {
        this.ctx?.suspend().catch(() => undefined);
        this.suspendTimer = null;
      }, fadeMs + 200);
    }
  }

  replayCurrent() {
    if (this.currentConfig) void this.playTrack(this.currentConfig);
  }

  setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v));
    this.applyMaster();
  }

  setMuted(m: boolean) {
    this.muted = m;
    this.applyMaster();
  }

  private applyMaster() {
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(this.effectiveVolume(), this.ctx.currentTime, 0.06);
    }
  }

  /* ---------------- file-based track ---------------- */

  private buildFileInstance(config: AmbientTrackConfig): TrackInstance {
    const ctx = this.ctx!;
    const media = new Audio(config.file);
    media.loop = true;
    media.volume = 0;
    const src = ctx.createMediaElementSource(media);
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(gain);
    gain.connect(this.master!);
    void media.play().catch(() => undefined);
    gain.gain.setTargetAtTime(0.9, ctx.currentTime, FADE_MS / 3000);
    media.volume = 1;
    return {
      id: config.id,
      gain,
      media,
      stop: (fadeMs) => {
        gain.gain.setTargetAtTime(0, ctx.currentTime, fadeMs / 3000);
        window.setTimeout(() => {
          media.pause();
          try {
            src.disconnect();
            gain.disconnect();
          } catch {
            /* already gone */
          }
        }, fadeMs + 250);
      },
    };
  }

  /* ---------------- generative synthesis ---------------- */

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer) return this.noiseBuffer;
    const len = Math.floor(ctx.sampleRate * 2.5);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02; // pinkish
      data[i] = last * 3.2;
    }
    this.noiseBuffer = buf;
    return buf;
  }

  private buildSynthInstance(config: AmbientTrackConfig): TrackInstance {
    const ctx = this.ctx!;
    const t0 = ctx.currentTime;
    const sources: Array<OscillatorNode | AudioBufferSourceNode> = [];
    const timers: number[] = [];

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(this.master!);
    gain.gain.setTargetAtTime(1, t0, FADE_MS / 3000);

    /* --- breathing low-pass bus --- */
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = config.filter;
    lp.Q.value = 0.7;
    lp.connect(gain);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = config.drift;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = config.filter * 0.22;
    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);
    lfo.start();
    sources.push(lfo);

    /* --- pad voices --- */
    const padBus = ctx.createGain();
    padBus.gain.value = config.pad.level;
    padBus.connect(lp);
    const voiceCount = config.pad.voices * config.chord.length;
    for (const semi of config.chord) {
      for (let v = 0; v < config.pad.voices; v++) {
        const osc = ctx.createOscillator();
        osc.type = config.pad.wave;
        osc.frequency.value = config.root * Math.pow(2, semi / 12);
        osc.detune.value = (v - (config.pad.voices - 1) / 2) * config.pad.detune;
        const vg = ctx.createGain();
        vg.gain.value = 1 / voiceCount;
        osc.connect(vg);
        vg.connect(padBus);
        osc.start();
        sources.push(osc);
      }
    }
    /* deep sub */
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = config.root / 2;
    const subGain = ctx.createGain();
    subGain.gain.value = 0.1;
    sub.connect(subGain);
    subGain.connect(gain);
    sub.start();
    sources.push(sub);

    /* --- airy noise --- */
    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1100;
    bp.Q.value = 0.5;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = config.noise;
    noise.connect(bp);
    bp.connect(noiseGain);
    noiseGain.connect(gain);
    noise.start();
    sources.push(noise);

    /* --- feedback delay for space --- */
    const delay = ctx.createDelay(2);
    delay.delayTime.value = config.delay.time;
    const fb = ctx.createGain();
    fb.gain.value = config.delay.feedback;
    const wet = ctx.createGain();
    wet.gain.value = config.delay.wet;
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    wet.connect(gain);
    const send = ctx.createGain();
    send.gain.value = 1;
    send.connect(delay);

    /* --- look-ahead arpeggio scheduler --- */
    const scaleLen = config.scale.length;
    let walk = Math.floor(Math.random() * scaleLen);
    let nextTime = t0 + 0.25;

    const pluck = (when: number, freq: number, level: number, wave: OscillatorType, decay: number) => {
      const osc = ctx.createOscillator();
      osc.type = wave;
      osc.frequency.value = freq;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, when);
      env.gain.linearRampToValueAtTime(level, when + 0.025);
      env.gain.exponentialRampToValueAtTime(0.0004, when + decay);
      osc.connect(env);
      env.connect(gain);
      env.connect(send);
      osc.start(when);
      osc.stop(when + decay + 0.1);
    };

    const tick = () => {
      const horizon = ctx.currentTime + 0.4;
      while (nextTime < horizon) {
        if (Math.random() < config.arpProb) {
          const step = Math.random() < 0.6 ? (Math.random() < 0.5 ? 1 : -1) : Math.floor(Math.random() * 3) - 1;
          walk = (walk + step + scaleLen) % scaleLen;
          const oct = Math.random() < 0.72 ? 2 : 3;
          const freq = config.root * oct * Math.pow(2, config.scale[walk] / 12);
          pluck(nextTime, freq, config.arp.level, config.arp.wave, 2.1 + Math.random() * 0.9);
        }
        if (Math.random() < config.shimmerProb) {
          const idx = Math.floor(Math.random() * scaleLen);
          const freq = config.root * 6 * Math.pow(2, config.scale[idx] / 12);
          pluck(nextTime + 0.05, freq, 0.035, "sine", 3.2);
        }
        nextTime += config.tempo * (0.85 + Math.random() * 0.4);
      }
    };
    tick();
    timers.push(window.setInterval(tick, 120));

    return {
      id: config.id,
      gain,
      stop: (fadeMs) => {
        timers.forEach((t) => window.clearInterval(t));
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.setTargetAtTime(0, now, fadeMs / 3200);
        window.setTimeout(() => {
          sources.forEach((s) => {
            try {
              s.stop();
            } catch {
              /* already stopped */
            }
          });
          try {
            gain.disconnect();
          } catch {
            /* noop */
          }
        }, fadeMs + 300);
      },
    };
  }
}

/** Singleton engine for the whole app */
export const musicEngine = new AmbientMusicEngine();
