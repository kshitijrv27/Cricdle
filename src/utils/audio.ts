/**
 * Synthesized Web Audio API sound effects for cricket game
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

/**
 * Bat hitting leather ball sound
 */
export function playBatHit(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.09);
}

/**
 * Tile reveal pop
 */
export function playTilePop(index = 0): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const baseFreq = 440 + index * 55;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, now);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * Victory fanfare chime
 */
export function playVictoryChime(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + idx * 0.12;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.2, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 0.45);
  });
}

/**
 * Game over / out chime
 */
export function playGameOverChime(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [392.0, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + idx * 0.14;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.15, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 0.4);
  });
}
