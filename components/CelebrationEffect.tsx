'use client';

import { useEffect, useState } from 'react';

interface CelebrationEffectProps {
  runnerId: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export function CelebrationEffect({ runnerId }: CelebrationEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    // Generate confetti particles
    const newParticles: Particle[] = [];
    const colors = ['#00ff88', '#00cc66', '#4488ff', '#ffdd00'];

    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: i,
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 200,
        vy: -50 - Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setParticles(newParticles);

    // Remove flash after 300ms
    const flashTimer = setTimeout(() => setFlash(false), 300);

    return () => clearTimeout(flashTimer);
  }, [runnerId]);

  return (
    <>
      {/* Green flash overlay */}
      {flash && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 255, 136, 0.3)',
            pointerEvents: 'none',
            animation: 'flashFade 0.3s ease-out',
            zIndex: 10,
          }}
        />
      )}

      {/* Confetti particles */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 11,
        }}
      >
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              width: 8,
              height: 8,
              backgroundColor: particle.color,
              borderRadius: '50%',
              animation: `confettiFly 2s ease-out forwards`,
              '--vx': `${particle.vx}px`,
              '--vy': `${particle.vy}px`,
            } as React.CSSProperties & { '--vx': string; '--vy': string }}
          />
        ))}
      </div>
    </>
  );
}
