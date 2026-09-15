/**
 * BMC LIVE Sound Effects
 * All sounds synthesized via Web Audio API — no external files, no CDN.
 * Singleton class exposed as `soundEffects`.
 *
 * Audio unlock: Call soundEffects.unlock() on the first user interaction
 * (button click). After that all subsequent sounds play normally.
 *
 * Sound toggle: Reads/writes localStorage key 'bmc_sound_enabled'.
 * Default is ON. Never crashes the app — all errors are caught silently.
 */

const STORAGE_KEY = 'bmc_sound_enabled';
const DEFAULT_VOLUME = 0.55;

class SoundEffects {
  private ctx: AudioContext | null = null;
  private _enabled: boolean;

  constructor() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      this._enabled = stored === null ? true : stored === 'true';
    } catch {
      this._enabled = true;
    }
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  get enabled() {
    return this._enabled;
  }

  setEnabled(val: boolean) {
    this._enabled = val;
    try {
      localStorage.setItem(STORAGE_KEY, String(val));
    } catch {
      // ignore
    }
  }

  /**
   * Call this on the very first user interaction (button click).
   * Browsers require a user gesture before AudioContext can play.
   */
  unlock() {
    this.initCtx();
  }

  // ─── Sounds ─────────────────────────────────────────────────────────────────

  /** Short digital click — button presses, UI feedback */
  playClick() {
    this.tone(800, 0.04, 'square', DEFAULT_VOLUME * 0.6);
  }

  /** Subtle notification ding — new participant joined */
  playJoin() {
    this.chord([1046.5, 1318.5], 0.25, 'sine', DEFAULT_VOLUME * 0.5, 0.02);
  }

  /** Rising 3-note arpeggio — session created, success */
  playSuccess() {
    this.arpeggio([523.25, 659.25, 783.99], 0.12, 'sine', DEFAULT_VOLUME * 0.7);
  }

  /** Staccato pentatonic tick — team shuffle animation */
  playCuriousShuffle() {
    const freqs = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];
    const note = freqs[Math.floor(Math.random() * freqs.length)];
    this.tone(note, 0.06, 'sine', DEFAULT_VOLUME * 0.4);
  }

  /** C-major chord sweep — teams revealed */
  playTeamReveal() {
    this.chord([523.25, 659.25, 783.99, 1046.5], 0.7, 'triangle', DEFAULT_VOLUME * 0.65, 0.07);
  }

  /** Alias for playTeamReveal */
  playTeamRevealSound() {
    this.playTeamReveal();
  }

  /** 2-tone achievement chime — captain selected */
  playCaptainSelected() {
    this.chord([880, 1108.73], 0.35, 'sine', DEFAULT_VOLUME * 0.6, 0.1);
  }

  /** Bright 3-tone chime — business idea submitted */
  playBusinessIdeaSubmitted() {
    this.chord([587.33, 739.99, 880], 0.35, 'sine', DEFAULT_VOLUME * 0.7, 0.04);
  }

  /**
   * Single countdown beep.
   * @param urgent — higher pitch for final 5 seconds
   */
  playCountdownBeep(urgent = false) {
    const freq = urgent ? 1200 : 880;
    const vol = urgent ? DEFAULT_VOLUME * 0.9 : DEFAULT_VOLUME * 0.6;
    this.tone(freq, 0.12, 'sine', vol);
  }

  /** Alias for playCountdownBeep */
  playCountdown(urgent = false) {
    this.playCountdownBeep(urgent);
  }

  /** Energetic rising sting — GO! */
  playGo() {
    this.arpeggio([523.25, 659.25, 783.99, 1046.5, 1318.5], 0.08, 'sine', DEFAULT_VOLUME * 0.85);
  }

  /** Double beep — 60s / 30s warning */
  playWarning() {
    this.doubleTone(660, 0.1, 0.06, DEFAULT_VOLUME * 0.65);
  }

  /** 3-note descending buzzer — TIME'S UP */
  playTimeUp() {
    this.arpeggio([523.25, 392, 261.63], 0.25, 'sawtooth', DEFAULT_VOLUME * 0.8);
  }

  /** Sharp upward sting — presentation starts */
  playPresentationStart() {
    this.arpeggio([440, 659.25, 880, 1108.73], 0.1, 'sine', DEFAULT_VOLUME * 0.8);
  }

  /** Soft confirmation — score submitted */
  playScoreSubmitted() {
    this.chord([523.25, 783.99], 0.3, 'sine', DEFAULT_VOLUME * 0.5, 0.05);
  }

  /** Ascending success chord — all captains submitted */
  playAllScoresIn() {
    this.arpeggio([392, 523.25, 659.25, 783.99, 1046.5], 0.1, 'sine', DEFAULT_VOLUME * 0.75);
  }

  /** Short upward sweep — next team */
  playNextTeam() {
    this.arpeggio([440, 587.33, 698.46], 0.1, 'sine', DEFAULT_VOLUME * 0.6);
  }

  /** Dramatic 5-note fanfare — leaderboard reveal */
  playLeaderboardReveal() {
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    this.arpeggio(freqs, 0.14, 'triangle', DEFAULT_VOLUME * 0.85);
  }

  /** Full victory sting — winner */
  playWinner() {
    // Two-part: quick arpeggio followed by sustained chord
    const up = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    this.arpeggio(up, 0.1, 'sine', DEFAULT_VOLUME * 0.9);
    // Sustained chord starts after arpeggio (~0.5s)
    setTimeout(() => {
      this.chord([523.25, 659.25, 783.99, 1046.5], 1.2, 'triangle', DEFAULT_VOLUME * 0.75, 0.06);
    }, 550);
  }

  // ─── Internal primitives ────────────────────────────────────────────────────

  private initCtx() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /** Play a single tone */
  private tone(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    startDelay = 0
  ) {
    if (!this._enabled) return;
    try {
      this.initCtx();
      const ctx = this.ctx;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime + startDelay;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // silent fail
    }
  }

  /** Play two tones in quick succession */
  private doubleTone(freq: number, duration: number, gap: number, volume: number) {
    this.tone(freq, duration, 'sine', volume);
    setTimeout(() => this.tone(freq * 1.25, duration, 'sine', volume), (gap + duration) * 1000);
  }

  /**
   * Play multiple tones as a chord (simultaneously with staggered start).
   */
  private chord(
    freqs: number[],
    duration: number,
    type: OscillatorType,
    volume: number,
    stagger = 0
  ) {
    if (!this._enabled) return;
    try {
      this.initCtx();
      const ctx = this.ctx;
      if (!ctx) return;

      const now = ctx.currentTime;
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * stagger;

        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume / freqs.length, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + duration + 0.02);
      });
    } catch {
      // silent fail
    }
  }

  /** Play tones sequentially (arpeggio) */
  private arpeggio(
    freqs: number[],
    noteDuration: number,
    type: OscillatorType,
    volume: number
  ) {
    if (!this._enabled) return;
    try {
      this.initCtx();
      const ctx = this.ctx;
      if (!ctx) return;

      const now = ctx.currentTime;
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * noteDuration;

        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + noteDuration * 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + noteDuration + 0.02);
      });
    } catch {
      // silent fail
    }
  }
}

export const soundEffects = new SoundEffects();
