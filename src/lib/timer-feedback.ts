'use client';

/**
 * Audio + haptic cues for the interval timer.
 * The tones are synthesised with the Web Audio API, so no sound files need to
 * be downloaded and the timer stays fully functional offline.
 */
let audioContext: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (audioContext) return audioContext;
  const Ctor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  audioContext = new Ctor();
  return audioContext;
}

/** Must be called from a user gesture so iOS unlocks audio playback. */
export function unlockAudio(): void {
  const ctx = context();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();
}

function tone(frequency: number, durationMs: number, volume = 0.16): void {
  const ctx = context();
  if (!ctx || ctx.state === 'suspended') return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + durationMs / 1000);
}

export type CueKind = 'countdown' | 'work' | 'rest' | 'complete';

export function playCue(kind: CueKind, muted: boolean): void {
  if (muted) return;
  if (kind === 'countdown') tone(660, 120);
  else if (kind === 'work') tone(920, 260, 0.2);
  else if (kind === 'rest') tone(440, 220);
  else {
    tone(660, 180);
    setTimeout(() => tone(880, 320, 0.2), 200);
  }
}

export function vibrate(pattern: number | number[], enabled: boolean): void {
  if (!enabled) return;
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  navigator.vibrate?.(pattern);
}

/** Keeps the screen on while the timer runs; silently ignored where unsupported. */
export async function requestWakeLock(): Promise<WakeLockSentinel | null> {
  try {
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
    };
    if (!nav.wakeLock) return null;
    return await nav.wakeLock.request('screen');
  } catch {
    return null;
  }
}
