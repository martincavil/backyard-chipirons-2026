'use client';

import { Runner } from '@/types';
import { formatTime } from '@/lib/utils';

interface DuelModeProps {
  runners: [Runner, Runner];
  currentLoop: number;
}

export function DuelMode({ runners, currentLoop }: DuelModeProps) {
  const [runner1, runner2] = runners;

  const getBestTime = (runner: Runner) => {
    if (runner.loops.length === 0) return null;
    return Math.min(...runner.loops.map((l) => l.timeMs));
  };

  const getLastTime = (runner: Runner) => {
    if (runner.loops.length === 0) return null;
    return runner.loops[runner.loops.length - 1].timeMs;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #1a0a0a 0%, #050505 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Animated background particles */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,0,0,0.05) 0%, transparent 50%)',
          animation: 'pulse 3s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: '30px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(36px, 6vw, 60px)',
            color: '#ff4444',
            letterSpacing: 8,
            textShadow: '0 0 20px rgba(255,68,68,0.5), 0 0 40px rgba(255,68,68,0.3)',
            marginBottom: 10,
          }}
        >
          ⚔️ DUEL FINAL ⚔️
        </div>
        <div
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 18,
            color: '#999',
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          Last (Wo)Man Standing — Boucle {currentLoop}
        </div>
      </div>

      {/* Duel Arena */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '40px 60px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Runner 1 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid #ff8800',
              boxShadow: '0 0 40px rgba(255,136,0,0.6)',
              background: '#1a1a2e',
            }}
          >
            {runner1.photo ? (
              <img
                src={runner1.photo}
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
                  fontSize: 80,
                }}
              >
                🏃
              </div>
            )}
          </div>

          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(28px, 4vw, 40px)',
              color: '#fff',
              textAlign: 'center',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {runner1.name}
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: '20px 30px',
              background: 'rgba(255,136,0,0.1)',
              border: '1px solid rgba(255,136,0,0.3)',
              borderRadius: 12,
              minWidth: 250,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: "'Oswald', sans-serif",
                fontSize: 16,
                color: '#ddd',
              }}
            >
              <span>Boucles complétées</span>
              <span style={{ color: '#ff8800', fontWeight: 600 }}>
                {runner1.loops.length}
              </span>
            </div>
            {getLastTime(runner1) && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 16,
                  color: '#ddd',
                }}
              >
                <span>Dernière boucle</span>
                <span style={{ color: '#aaa' }}>
                  {formatTime(getLastTime(runner1)!)}
                </span>
              </div>
            )}
            {getBestTime(runner1) && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 16,
                  color: '#ddd',
                }}
              >
                <span>Meilleur temps</span>
                <span style={{ color: 'gold' }}>
                  {formatTime(getBestTime(runner1)!)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* VS */}
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(48px, 8vw, 80px)',
            color: '#fff',
            letterSpacing: 8,
            textShadow: '0 0 30px rgba(255,255,255,0.5)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          VS
        </div>

        {/* Runner 2 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid #4488ff',
              boxShadow: '0 0 40px rgba(68,136,255,0.6)',
              background: '#1a1a2e',
            }}
          >
            {runner2.photo ? (
              <img
                src={runner2.photo}
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
                  fontSize: 80,
                }}
              >
                🏃
              </div>
            )}
          </div>

          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(28px, 4vw, 40px)',
              color: '#fff',
              textAlign: 'center',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {runner2.name}
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: '20px 30px',
              background: 'rgba(68,136,255,0.1)',
              border: '1px solid rgba(68,136,255,0.3)',
              borderRadius: 12,
              minWidth: 250,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: "'Oswald', sans-serif",
                fontSize: 16,
                color: '#ddd',
              }}
            >
              <span>Boucles complétées</span>
              <span style={{ color: '#4488ff', fontWeight: 600 }}>
                {runner2.loops.length}
              </span>
            </div>
            {getLastTime(runner2) && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 16,
                  color: '#ddd',
                }}
              >
                <span>Dernière boucle</span>
                <span style={{ color: '#aaa' }}>
                  {formatTime(getLastTime(runner2)!)}
                </span>
              </div>
            )}
            {getBestTime(runner2) && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 16,
                  color: '#ddd',
                }}
              >
                <span>Meilleur temps</span>
                <span style={{ color: 'gold' }}>
                  {formatTime(getBestTime(runner2)!)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
