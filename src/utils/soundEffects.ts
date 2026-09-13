class SoundEffects {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Curious suspenseful ticking sound during team shuffle
  playCuriousShuffle() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Curious staccato pitch variation (pentatonic scale notes)
      const freqs = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
      const note = freqs[Math.floor(Math.random() * freqs.length)];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);
      osc.frequency.exponentialRampToValueAtTime(note * 1.25, now + 0.06);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignore audio context errors if blocked by browser policy
    }
  }

  // Triumphant reveal chime when shuffling locks in
  playTeamRevealSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major chord C5-E5-G5-C6

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.07 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.7);
      });
    } catch {
      // Ignore audio context errors
    }
  }
}

export const soundEffects = new SoundEffects();
