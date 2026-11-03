/**
 * Web Audio API synthesizer for university study session alerts
 * Fully self-contained, works offline, zero external asset dependencies.
 */

class AudioAlertService {
  private ctx: AudioContext | null = null;
  private ambientNoiseNode: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1. Zen University Chime (Campanita zen al terminar sesión de estudio)
  playZenChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Base crystal tone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 1.2); // C6

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now); // E5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.4);
      osc2.stop(now + 2.4);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // 2. Playful Capy Boing / Cheer (¡Sonido chistoso de la Capi!)
  playCapyBoing() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Pitch slide upwards like a cartoon boing!
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.32);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.48);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch (e) {
      console.warn('Audio boing error:', e);
    }
  }

  // 3. Energetic Break End Alarm (¡Terminó el descanso, hora de concentrarse!)
  playBreakEndAlert() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      [0, 0.15, 0.3].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440 * Math.pow(1.2, i), now + delay);

        gain.gain.setValueAtTime(0.18, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.12);
      });
    } catch (e) {
      console.warn('Audio alert error:', e);
    }
  }

  // 4. Soft Ambient Rain / White Noise for studying
  toggleAmbientRain(enable?: boolean): boolean {
    try {
      const ctx = this.getContext();

      if (this.isAmbientPlaying || enable === false) {
        if (this.ambientGain) {
          this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, ctx.currentTime);
          this.ambientGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          setTimeout(() => {
            (this.ambientNoiseNode as any)?.stop?.();
            this.ambientNoiseNode?.disconnect();
            this.ambientNoiseNode = null;
            this.ambientGain = null;
            this.isAmbientPlaying = false;
          }, 500);
        }
        this.isAmbientPlaying = false;
        return false;
      }

      // Generate brown noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.8; // gain adjustment
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter for rainfall acoustic profile
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.8);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();

      this.ambientNoiseNode = whiteNoise;
      this.ambientGain = gain;
      this.isAmbientPlaying = true;
      return true;
    } catch (e) {
      console.warn('Ambient noise error:', e);
      return false;
    }
  }

  isRainPlaying(): boolean {
    return this.isAmbientPlaying;
  }
}

export const audioAlerts = new AudioAlertService();
