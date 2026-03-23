'use client';

import { useEffect, useRef, useState } from 'react';
import { LastArrival, Runner } from '@/types';
import { formatTime } from '@/lib/utils';
import { CelebrationEffect } from './CelebrationEffect';
import { ProgressRing } from './ProgressRing';
import { MAX_LOOP_DURATION_MS } from '@/lib/constants';

interface RunnerRowProps {
  runner: Runner;
  fastestLoopRunnerId: string | null;
  currentLoop: number;
  lastArrival: LastArrival | null;
  msRemaining: number;
}

export function RunnerRow({ runner, fastestLoopRunnerId, currentLoop, lastArrival, msRemaining }: RunnerRowProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const lastArrivalRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      lastArrival &&
      lastArrival.runnerId === runner.id &&
      lastArrival._ts !== lastArrivalRef.current
    ) {
      lastArrivalRef.current = lastArrival._ts;
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastArrival, runner.id]);

  const lastLoop = runner.loops?.[runner.loops.length - 1];
  const isFastest = runner.id === fastestLoopRunnerId;

  // Check if runner has completed current loop
  const completedCurrentLoop = lastLoop?.loop === currentLoop;

  // Calculate progress in current loop (0-1)
  const msElapsed = MAX_LOOP_DURATION_MS - msRemaining;
  const progress = Math.min(1, Math.max(0, msElapsed / MAX_LOOP_DURATION_MS));

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 16px',
        borderRadius: 12,
        background: isFastest
          ? 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,215,0,0.02))'
          : 'rgba(255,255,255,0.03)',
        border: isFastest
          ? '1px solid rgba(255,215,0,0.3)'
          : '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {showCelebration && <CelebrationEffect runnerId={runner.id} />}
      <div style={{ flexShrink: 0 }}>
        <ProgressRing
          progress={progress}
          completed={completedCurrentLoop}
          size={50}
          strokeWidth={3}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              border: isFastest ? '2px solid gold' : '2px solid #333',
              background: '#1a1a2e',
            }}
          >
            {runner.photo ? (
              <img
                src={runner.photo}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#555',
                  fontSize: 18,
                }}
              >
                🏃
              </div>
            )}
          </div>
        </ProgressRing>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 18,
            color: '#eee',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {runner.name}
          </span>
          {isFastest && <span style={{ fontSize: 14 }}>⚡</span>}
        </div>
        <div
          style={{
            fontSize: 13,
            color: '#777',
            fontFamily: "'Oswald', sans-serif",
          }}
        >
          {runner.loops.length} boucle{runner.loops.length !== 1 ? 's' : ''}{' '}
          complétée{runner.loops.length !== 1 ? 's' : ''}
          {lastLoop && ` · dernière: ${formatTime(lastLoop.timeMs)}`}
        </div>
      </div>
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 28,
          color: isFastest ? 'gold' : '#00ff88',
          textShadow: isFastest ? '0 0 10px rgba(255,215,0,0.4)' : 'none',
        }}
      >
        {runner.loops.length}
      </div>
    </div>
  );
}
