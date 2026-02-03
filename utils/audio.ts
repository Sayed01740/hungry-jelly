class AudioManager {
  private ctx: AudioContext | null = null;
  private wobbleOsc: OscillatorNode | null = null;
  private wobbleGain: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  // Must be called after user interaction
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(e => console.error("Audio resume failed", e));
    }
    this.startWobble();
  }

  private startWobble() {
    if (!this.ctx) return;
    
    // If already exists, don't recreate
    if (this.wobbleOsc) return;

    this.wobbleOsc = this.ctx.createOscillator();
    this.wobbleGain = this.ctx.createGain();

    this.wobbleOsc.type = 'sine';
    this.wobbleOsc.frequency.value = 60; 

    // Start silent
    this.wobbleGain.gain.value = 0;

    this.wobbleOsc.connect(this.wobbleGain);
    this.wobbleGain.connect(this.ctx.destination);
    
    this.wobbleOsc.start();
  }

  updateWobble(speed: number) {
    if (!this.ctx || !this.wobbleOsc || !this.wobbleGain) return;
    
    const now = this.ctx.currentTime;
    // Speed is roughly 0 to 20
    const normalizedSpeed = Math.min(speed / 15, 1);
    
    // Pitch modulation: 60Hz to 120Hz
    this.wobbleOsc.frequency.setTargetAtTime(60 + (normalizedSpeed * 60), now, 0.1);
    
    // Volume modulation: 0 to 0.15 (keep it subtle)
    const targetGain = normalizedSpeed > 0.1 ? normalizedSpeed * 0.15 : 0;
    this.wobbleGain.gain.setTargetAtTime(targetGain, now, 0.1);
  }

  stopWobble() {
    if (this.ctx && this.wobbleGain) {
      this.wobbleGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    }
  }

  playEat() {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Rising pitch "Bloop"
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playHit() {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Falling pitch "Zap"
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    // Use a small positive value (0.001) because exponential ramp cannot reach 0
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playMissionComplete() {
    if (!this.ctx) return;
    
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major Arpeggio
    
    notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t + i * 0.1);
        
        gain.gain.setValueAtTime(0.05, t + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 0.3);
    });
  }
}

export const audioManager = new AudioManager();