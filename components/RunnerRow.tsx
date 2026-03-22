'use client';

import { Runner } from '@/types';
import { formatTime } from '@/lib/utils';

interface RunnerRowProps {
  runner: Runner;
  fastestLoopRunnerId: string | null;
  currentLoop: number;
}

export function RunnerRow({ runner, fastestLoopRunnerId, currentLoop }: RunnerRowProps) {
  const lastLoop = runner.loops?.[runner.loops.length - 1];
  const isFastest = runner.id === fastestLoopRunnerId;
  const completedCurrent =
    lastLoop?.loop === (currentLoop > 0 ? currentLoop - 1 : 0);

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
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: '50%',
          overflow: 'hidden',
          border: isFastest ? '2px solid gold' : '2px solid #333',
          flexShrink: 0,
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
