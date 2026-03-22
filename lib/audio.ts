// GTA Wasted-style death sound using Web Audio API
export function playDeathSound(): void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Low drone
    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = 'sawtooth';
    drone.frequency.setValueAtTime(55, ctx.currentTime);
    drone.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 2);
    droneGain.gain.setValueAtTime(0.3, ctx.currentTime);
    droneGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.5);
    drone.connect(droneGain);
    droneGain.connect(ctx.destination);
    drone.start(ctx.currentTime);
    drone.stop(ctx.currentTime + 2.5);

    // Impact hit
    const hit = ctx.createOscillator();
    const hitGain = ctx.createGain();
    hit.type = 'square';
    hit.frequency.setValueAtTime(120, ctx.currentTime);
    hit.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.5);
    hitGain.gain.setValueAtTime(0.5, ctx.currentTime);
    hitGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    hit.connect(hitGain);
    hitGain.connect(ctx.destination);
    hit.start(ctx.currentTime);
    hit.stop(ctx.currentTime + 0.6);

    // Noise burst
    const bufferSize = ctx.sampleRate * 0.3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    noise.buffer = noiseBuffer;
    noiseGain.gain.setValueAtTime(0.25, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(ctx.currentTime);

    // Slow bell toll
    const bell = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(220, ctx.currentTime + 0.3);
    bellGain.gain.setValueAtTime(0, ctx.currentTime);
    bellGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.35);
    bellGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 3);
    bell.connect(bellGain);
    bellGain.connect(ctx.destination);
    bell.start(ctx.currentTime + 0.3);
    bell.stop(ctx.currentTime + 3);
  } catch (e) {
    console.log('Audio not available');
  }
}
