// Web Audio API sound generators

export type SoundType = 'horn' | 'applause' | 'boss' | 'victory';

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  return new (window.AudioContext || (window as any).webkitAudioContext)();
};

// 🏁 Horn sound - Deep foghorn for race start
export function playHorn() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 2.0;

  // Deep sawtooth wave
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, now); // Deep A note
  osc.frequency.exponentialRampToValueAtTime(90, now + duration);

  // Envelope
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
  gain.gain.linearRampToValueAtTime(0.25, now + duration - 0.5);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

// 👏 Applause sound - Filtered white noise
export function playApplause() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 1.5;

  // White noise
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Band-pass filter to simulate clapping
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1000;
  filter.Q.value = 2;

  // Envelope
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.8);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
}

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

// 🎉 Victory fanfare - Ascending happy notes
export function playVictory() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Victory melody: C - E - G - C (major triad ascending)
  const notes = [
    { freq: 523.25, time: 0 },     // C5
    { freq: 659.25, time: 0.2 },   // E5
    { freq: 783.99, time: 0.4 },   // G5
    { freq: 1046.5, time: 0.6 },   // C6
  ];

  notes.forEach(({ freq, time }) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.2, now + time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + time + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + time);
    osc.stop(now + time + 0.5);
  });

  // Add a final chord
  const chordTime = now + 0.8;
  [523.25, 659.25, 783.99].forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, chordTime);
    gain.gain.linearRampToValueAtTime(0.15, chordTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, chordTime + 1.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(chordTime);
    osc.stop(chordTime + 1.5);
  });
}

export function playSound(sound: SoundType) {
  switch (sound) {
    case 'horn':
      playHorn();
      break;
    case 'applause':
      playApplause();
      break;
    case 'boss':
      playBossFight();
      break;
    case 'victory':
      playVictory();
      break;
  }
}
