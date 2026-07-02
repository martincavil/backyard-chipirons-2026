// Web Audio API sound generators

export type SoundType = 'boss';

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  return new (window.AudioContext || (window as any).webkitAudioContext)();
};

// ⚔️ Boss fight sound - Dramatic tension
export function playBossFight() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 3.0;

  // Deep dramatic tone
  const osc1 = ctx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(55, now); // Low A
  osc1.frequency.linearRampToValueAtTime(65, now + duration);

  const osc2 = ctx.createOscillator();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(82.5, now); // E
  osc2.frequency.linearRampToValueAtTime(97.5, now + duration);

  // Envelope with tension build
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
  gain.gain.linearRampToValueAtTime(0.25, now + duration - 0.5);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  const merger = ctx.createChannelMerger(2);
  osc1.connect(merger, 0, 0);
  osc2.connect(merger, 0, 1);
  merger.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + duration);
  osc2.stop(now + duration);

  // Add dramatic hits
  for (let i = 0; i < 3; i++) {
    const hitTime = now + 0.5 + i * 0.8;
    const hit = ctx.createOscillator();
    hit.type = 'triangle';
    hit.frequency.setValueAtTime(110, hitTime);
    hit.frequency.exponentialRampToValueAtTime(55, hitTime + 0.3);

    const hitGain = ctx.createGain();
    hitGain.gain.setValueAtTime(0.2, hitTime);
    hitGain.gain.exponentialRampToValueAtTime(0.01, hitTime + 0.3);

    hit.connect(hitGain);
    hitGain.connect(ctx.destination);
    hit.start(hitTime);
    hit.stop(hitTime + 0.3);
  }
}

export function playSound(sound: SoundType) {
  switch (sound) {
    case 'boss':
      playBossFight();
      break;
  }
}
