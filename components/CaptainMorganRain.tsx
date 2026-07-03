'use client';

import { useMemo } from 'react';

interface CaptainMorganRainProps {
  /** Number of bottles falling at once */
  count?: number;
  /** Path to the bottle image in /public */
  src?: string;
}

// Rains Captain Morgan bottles that fall and spin down the screen.
// Drop the bottle image at public/captain-morgan.png (or pass a custom src).
export function CaptainMorganRain({
  count = 24,
  src = '/captain-morgan.png',
}: CaptainMorganRainProps) {
  // Randomize each bottle once so the animation is stable across re-renders
  const bottles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 100; // vw
        const size = 40 + Math.random() * 70; // px
        const duration = 4 + Math.random() * 5; // s
        const delay = -Math.random() * 8; // negative → staggered, already mid-fall
        const spin = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720);
        const opacity = 0.35 + Math.random() * 0.5;
        return { i, left, size, duration, delay, spin, opacity };
      }),
    [count],
  );

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {bottles.map((b) => (
        <img
          key={b.i}
          src={src}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: `${b.left}vw`,
            width: b.size,
            height: 'auto',
            opacity: b.opacity,
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))',
            animation: `captainFall ${b.duration}s linear ${b.delay}s infinite`,
            // custom prop consumed by the captainFall keyframe
            ['--spin' as string]: `${b.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}
