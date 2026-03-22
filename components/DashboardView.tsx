'use client';

import { useState, useEffect, useRef } from 'react';
import { RaceState } from '@/types';
import { computeLoopInfo } from '@/lib/utils';
import { playDeathSound } from '@/lib/audio';
import { LOOP_DISTANCE_KM } from '@/lib/constants';
import { CorralTimer } from './CorralTimer';
import { RunnerRow } from './RunnerRow';
import { DeathBoard } from './DeathBoard';
import { WastedOverlay } from './WastedOverlay';

interface DashboardViewProps {
  state: RaceState;
}

export function DashboardView({ state }: DashboardViewProps) {
  const [now, setNow] = useState(Date.now());
  const [wastedRunner, setWastedRunner] = useState<string | null>(null);
  const lastEliminationRef = useRef<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(interval);
  }, []);

  // Detect new elimination for sound + overlay
  useEffect(() => {
    if (
      state.lastElimination &&
      state.lastElimination._ts !== lastEliminationRef.current
    ) {
      lastEliminationRef.current = state.lastElimination._ts;
      setWastedRunner(state.lastElimination.name);
      playDeathSound();
    }
  }, [state.lastElimination]);

  const { currentLoop, msRemaining, preRace } = computeLoopInfo(
    state.raceStartTime,
  );
  const activeRunners = state.runners.filter((r) => r.status === 'active');
  const eliminatedRunners = state.runners.filter((r) => r.status === 'dnf');
  const winner = state.runners.find((r) => r.status === 'winner');

  // Find fastest loop time among all runners (last completed loop)
  let fastestLoopRunnerId: string | null = null;
  let fastestTime = Infinity;
  activeRunners.forEach((r) => {
    if (r.loops.length > 0) {
      const last = r.loops[r.loops.length - 1];
      if (last.timeMs < fastestTime) {
        fastestTime = last.timeMs;
        fastestLoopRunnerId = r.id;
      }
    }
  });

  // Sort active runners by loops completed (desc), then last loop time (asc)
  const sortedActive = [...activeRunners].sort((a, b) => {
    if (b.loops.length !== a.loops.length)
      return b.loops.length - a.loops.length;
    const aLast = a.loops[a.loops.length - 1]?.timeMs ?? Infinity;
    const bLast = b.loops[b.loops.length - 1]?.timeMs ?? Infinity;
    return aLast - bLast;
  });

  if (winner) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background:
            'radial-gradient(ellipse at center, #0a1628 0%, #050a14 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: "'Oswald', sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            color: 'gold',
            letterSpacing: 6,
            marginBottom: 20,
            textTransform: 'uppercase',
          }}
        >
          🏆 Finisher 🏆
        </div>
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid gold',
            boxShadow: '0 0 60px rgba(255,215,0,0.4)',
          }}
        >
          {winner.photo ? (
            <img
              src={winner.photo}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 60,
              }}
            >
              🏃
            </div>
          )}
        </div>
        <div
          style={{
            fontSize: 'clamp(36px, 8vw, 80px)',
            color: '#fff',
            marginTop: 20,
            fontFamily: "'Bebas Neue', sans-serif",
          }}
        >
          {winner.name}
        </div>
        <div style={{ fontSize: 24, color: '#00ff88', marginTop: 10 }}>
          {winner.loops.length} boucles ·{' '}
          {(winner.loops.length * LOOP_DISTANCE_KM).toFixed(1)} km
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #0d1b2a 0%, #050a14 60%)',
        color: '#fff',
        padding: '20px 30px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {wastedRunner && (
        <WastedOverlay
          name={wastedRunner}
          onDone={() => setWastedRunner(null)}
        />
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 16,
          marginBottom: 8,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(28px, 4vw, 44px)',
              letterSpacing: 4,
              color: '#fff',
              textShadow: '0 0 20px rgba(0,255,136,0.2)',
            }}
          >
            🦑 Backyard Chipirons 2026
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 30,
            fontFamily: "'Oswald', sans-serif",
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 36,
                color: '#00ff88',
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              {activeRunners.length}
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#666',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              En course
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 36,
                color: '#cc0000',
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              {eliminatedRunners.length}
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#666',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Éliminés
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 36,
                color: '#4488ff',
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              {currentLoop || '—'}
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#666',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Boucle
            </div>
          </div>
        </div>
      </div>

      {/* Timer */}
      {state.raceStarted && (
        <CorralTimer
          msRemaining={msRemaining}
          currentLoop={currentLoop}
          preRace={preRace}
        />
      )}

      {!state.raceStarted && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 48,
            color: '#444',
            letterSpacing: 6,
          }}
        >
          En attente du départ...
        </div>
      )}

      {/* Main content: runners + death board */}
      <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
        {/* Active runners */}
        <div style={{ flex: 2 }}>
          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 14,
              color: '#555',
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Coureurs en lice
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sortedActive.map((r) => (
              <RunnerRow
                key={r.id}
                runner={r}
                fastestLoopRunnerId={fastestLoopRunnerId}
                currentLoop={currentLoop}
              />
            ))}
            {sortedActive.length === 0 && (
              <div
                style={{
                  color: '#444',
                  fontFamily: "'Oswald', sans-serif",
                  padding: 20,
                  textAlign: 'center',
                }}
              >
                {state.raceStarted
                  ? 'Plus aucun coureur en lice !'
                  : 'Les coureurs apparaîtront ici'}
              </div>
            )}
          </div>
        </div>

        {/* Death board */}
        <DeathBoard eliminatedRunners={eliminatedRunners} />
      </div>
    </div>
  );
}
