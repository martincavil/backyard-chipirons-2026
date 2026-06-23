'use client';

import { formatTime } from '@/lib/utils';
import { LOOP_DISTANCE_KM, LOOP_ELEVATION_M } from '@/lib/constants';

interface CorralTimerProps {
  msRemaining: number;
  currentLoop: number;
  preRace?: boolean;
}

export function CorralTimer({ msRemaining, currentLoop, preRace }: CorralTimerProps) {
  const urgent = msRemaining < 5 * 60 * 1000;
  const critical = msRemaining < 60 * 1000;
  const flash = critical && Math.floor(Date.now() / 500) % 2 === 0;

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '24px 0',
      }}
    >
      <div
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontSize: 'clamp(20px, 3vw, 28px)',
          color: '#aaa',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {preRace ? 'Départ dans' : `Boucle ${currentLoop} — Temps restant`}
      </div>
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(72px, 14vw, 160px)',
          fontWeight: 400,
          color: critical
            ? flash
              ? '#ff0000'
              : '#660000'
            : urgent
              ? '#ff4444'
              : '#00ff88',
          lineHeight: 1,
          textShadow: critical
            ? '0 0 40px rgba(255,0,0,0.8), 0 0 80px rgba(255,0,0,0.4)'
            : urgent
              ? '0 0 30px rgba(255,68,68,0.5)'
              : '0 0 30px rgba(0,255,136,0.3)',
          transition: critical ? 'none' : 'color 1s, text-shadow 1s',
        }}
      >
        {formatTime(msRemaining)}
      </div>
      {!preRace && (
        <div
          style={{
            color: '#666',
            fontSize: 14,
            marginTop: 4,
            fontFamily: "'Oswald', sans-serif",
          }}
        >
          {LOOP_DISTANCE_KM} km / {LOOP_ELEVATION_M}m D+ par boucle
        </div>
      )}
    </div>
  );
}
