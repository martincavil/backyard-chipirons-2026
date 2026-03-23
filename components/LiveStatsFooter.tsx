'use client';

import { RaceState } from '@/types';
import { formatTimeFull } from '@/lib/utils';
import { LOOP_DISTANCE_KM } from '@/lib/constants';

interface LiveStatsFooterProps {
  state: RaceState;
  raceElapsedMs: number;
}

export function LiveStatsFooter({ state, raceElapsedMs }: LiveStatsFooterProps) {
  // Calculate total loops completed by all runners
  const totalLoops = state.runners.reduce((sum, r) => sum + r.loops.length, 0);

  // Calculate total distance (all loops × distance per loop)
  const totalDistance = (totalLoops * LOOP_DISTANCE_KM).toFixed(1);

  // Find fastest loop across all runners
  type FastestLoopInfo = { name: string; time: string };
  let fastestLoop: FastestLoopInfo | null = null;
  let fastestTimeMs = Infinity;

  state.runners.forEach((runner) => {
    runner.loops.forEach((loop) => {
      if (loop.timeMs < fastestTimeMs) {
        fastestTimeMs = loop.timeMs;
        fastestLoop = {
          name: runner.name,
          time: formatTimeFull(loop.timeMs),
        };
      }
    });
  });

  const hasFastestLoop = fastestLoop !== null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 30px',
        backgroundColor: 'rgba(10, 10, 20, 0.9)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        fontFamily: "'Oswald', sans-serif",
        fontSize: 14,
        color: '#aaa',
        zIndex: 100,
      }}
    >
      {/* Total distance */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>🌍</span>
        <span style={{ color: '#fff', fontWeight: 500 }}>
          {totalDistance} km
        </span>
        <span style={{ color: '#666' }}>parcourus</span>
      </div>

      <div
        style={{
          width: 1,
          height: 24,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
      />

      {/* Race duration */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>⏱️</span>
        <span style={{ color: '#fff', fontWeight: 500 }}>
          {formatTimeFull(raceElapsedMs)}
        </span>
        <span style={{ color: '#666' }}>de course</span>
      </div>

      <div
        style={{
          width: 1,
          height: 24,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
      />

      {/* Fastest loop */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>⚡</span>
        {hasFastestLoop ? (
          <>
            <span style={{ color: '#666' }}>Boucle la plus rapide :</span>
            <span style={{ color: 'gold', fontWeight: 500 }}>
              {fastestLoop!.name}
            </span>
            <span style={{ color: '#fff' }}>— {fastestLoop!.time}</span>
          </>
        ) : (
          <span style={{ color: '#666' }}>Aucune boucle complétée</span>
        )}
      </div>

      <div
        style={{
          width: 1,
          height: 24,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
      />

      {/* Total loops */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>🔄</span>
        <span style={{ color: '#fff', fontWeight: 500, fontSize: 16 }}>
          {totalLoops}
        </span>
        <span style={{ color: '#666' }}>
          boucle{totalLoops !== 1 ? 's' : ''} complétée{totalLoops !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
