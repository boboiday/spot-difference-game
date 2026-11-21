// Lantern Lane — all sound is synthesised with WebAudio. No audio files,
// no network. A tiny helper builds short tones; each effect layers a few.

let ctx = null;
let muted = false;

export function ensureAudio() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

function tone(freq, startAt, dur, type, vol, slideTo) {
  if (muted || !ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + startAt + dur);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + dur + 0.05);
}

// A warm two-note chime when a difference is found; the second note rises
// with the combo so a streak sounds like it is climbing.
export function playFound(combo) {
  ensureAudio();
  const base = 523.25 * Math.pow(1.0595, Math.min(combo, 8));
  tone(base, 0, 0.22, 'sine', 0.22);
  tone(base * 1.5, 0.07, 0.3, 'sine', 0.2);
  tone(base * 2, 0.14, 0.35, 'triangle', 0.1);
}

// A soft low thud for a wrong click.
export function playMiss() {
  ensureAudio();
  tone(160, 0, 0.18, 'sine', 0.18, 90);
  tone(110, 0.05, 0.15, 'triangle', 0.1);
}

// A single sparkle for a hint.
export function playHint() {
  ensureAudio();
  tone(880, 0, 0.15, 'sine', 0.14);
  tone(1318, 0.08, 0.22, 'sine', 0.12);
}

// A short click for buttons and the crosshair.
export function playClick() {
  ensureAudio();
  tone(660, 0, 0.06, 'square', 0.06);
}

// A rising arpeggio when a level is cleared.
export function playLevelDone() {
  ensureAudio();
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.3, 'triangle', 0.16));
}

// A longer fanfare for the win screen.
export function playWin() {
  ensureAudio();
  [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, i * 0.11, 0.4, 'triangle', 0.16));
  tone(261.63, 0, 0.9, 'sine', 0.1);
}

// Two low notes for running out of time.
export function playTimeout() {
  ensureAudio();
  tone(392, 0, 0.35, 'sine', 0.16, 311);
  tone(311, 0.3, 0.5, 'sine', 0.16, 233);
}
