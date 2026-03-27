export const SoundManager = {
  audioCtx: null as AudioContext | null,
  bgmSource: null as AudioBufferSourceNode | null,
  isMuted: false,

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.bgmSource) {
        this.bgmSource.stop();
        this.bgmSource = null;
      }
    } else {
      this.playBGM();
    }
  },

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  },

  playSynth(freq: number, type: OscillatorType = 'sine', duration: number = 0.1, volume: number = 0.1) {
    if (this.isMuted) return;
    this.init();
    if (this.audioCtx!.state === 'suspended') {
      this.audioCtx!.resume();
    }
    const osc = this.audioCtx!.createOscillator();
    const gain = this.audioCtx!.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.1, this.audioCtx!.currentTime + duration);
    
    gain.gain.setValueAtTime(volume, this.audioCtx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx!.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.audioCtx!.destination);
    
    osc.start();
    osc.stop(this.audioCtx!.currentTime + duration);
  },

  playBGM() {
    if (this.isMuted) return;
    this.init();
    if (this.bgmSource) return;
    if (this.audioCtx!.state === 'suspended') {
      this.audioCtx!.resume();
    }

    const duration = 2; // 2 seconds loop
    const sampleRate = this.audioCtx!.sampleRate;
    const buffer = this.audioCtx!.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Simple rhythmic pulse
      const pulse = Math.sin(2 * Math.PI * 40 * t) * 0.1;
      const beat = (i % (sampleRate / 2) < 1000) ? 0.05 : 0;
      data[i] = pulse + beat;
    }

    this.bgmSource = this.audioCtx!.createBufferSource();
    this.bgmSource.buffer = buffer;
    this.bgmSource.loop = true;
    const gain = this.audioCtx!.createGain();
    gain.gain.value = 0.05;
    this.bgmSource.connect(gain);
    gain.connect(this.audioCtx!.destination);
    this.bgmSource.start();
  },

  playZap() { this.playSynth(800, 'square', 0.05, 0.03); },
  playThud() { this.playSynth(150, 'sine', 0.3, 0.1); },
  playBuy() { this.playSynth(1200, 'triangle', 0.2, 0.1); },
  playPlace() { this.playSynth(400, 'sine', 0.1, 0.1); },
  playDelete() { this.playSynth(200, 'sawtooth', 0.2, 0.1); },
  playDeath() { this.playSynth(100, 'square', 0.4, 0.05); },
  playWaveStart() { this.playSynth(600, 'sine', 0.8, 0.1); },
  playVictory() { 
    this.playSynth(800, 'sine', 0.2, 0.1);
    setTimeout(() => this.playSynth(1000, 'sine', 0.2, 0.1), 100);
    setTimeout(() => this.playSynth(1200, 'sine', 0.4, 0.1), 200);
  },
  playBaseHit() { this.playThud(); },
  playShoot(type?: any) { this.playZap(); },
  playEnemyDeath() { this.playDeath(); },
  playHit() { this.playSynth(400, 'sine', 0.05, 0.02); }
};
