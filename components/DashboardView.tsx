'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RaceState } from '@/types';
import { computeLoopInfo } from '@/lib/utils';
import { playDeathSound } from '@/lib/audio';
import { LOOP_DISTANCE_KM } from '@/lib/constants';
import { CorralTimer } from './CorralTimer';
import { RunnerRow } from './RunnerRow';
import { ParticipantWall } from './ParticipantWall';
import { WastedOverlay } from './WastedOverlay';
import { LiveStatsFooter } from './LiveStatsFooter';
import { playSound } from '@/lib/sounds';
import { DuelMode } from './DuelMode';

interface DashboardViewProps {
  state: RaceState;
}

export function DashboardView({ state }: DashboardViewProps) {
  const [now, setNow] = useState(Date.now());
  const [wastedRunner, setWastedRunner] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  // Initialized from the already-loaded state so a page refresh doesn't
  // replay the overlay/sound for an elimination/sound that already happened.
  const lastEliminationRef = useRef<number | null>(
    state.lastElimination?._ts ?? null,
  );
  const bossSoundPlayedRef = useRef(
    state.runners.filter((r) => r.status === 'active').length === 2,
  );

  // Stable identity so WastedOverlay's internal setTimeout isn't reset on
  // every parent re-render (the dashboard re-renders every 200ms for the timer).
  const dismissWastedOverlay = useCallback(() => setWastedRunner(null), []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
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

  // Detect duel mode (exactly 2 active runners)
  const isDuelMode = activeRunners.length === 2;

  // Play boss fight sound when entering duel mode (only once)
  useEffect(() => {
    if (isDuelMode && !bossSoundPlayedRef.current) {
      bossSoundPlayedRef.current = true;
      playSound('boss');
    }
    // Reset when more than 2 runners (shouldn't happen but just in case)
    if (activeRunners.length > 2) {
      bossSoundPlayedRef.current = false;
    }
  }, [isDuelMode, activeRunners.length]);

  // Calculate race elapsed time
  const raceElapsedMs = state.raceStartTime
    ? now - new Date(state.raceStartTime).getTime()
    : 0;

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

  // Duel mode: exactly 2 active runners
  if (isDuelMode && !winner) {
    return (
      <div style={{ position: 'relative' }}>
        {wastedRunner && (
          <WastedOverlay
            name={wastedRunner}
            onDone={dismissWastedOverlay}
          />
        )}

        <DuelMode
          runners={activeRunners as [any, any]}
          currentLoop={currentLoop}
          msRemaining={msRemaining}
          preRace={preRace}
        />

        {/* Mini participant wall at bottom */}
        {state.runners.length > 0 && (
          <div
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              maxWidth: 500,
              zIndex: 100,
              transform: 'scale(0.7)',
              transformOrigin: 'bottom right',
            }}
          >
            <ParticipantWall runners={state.runners} />
          </div>
        )}
      </div>
    );
  }

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
        padding: isMobile ? '12px 12px 80px' : '20px 30px 80px',
        position: 'relative',
      }}
    >
      {wastedRunner && (
        <WastedOverlay
          name={wastedRunner}
          onDone={dismissWastedOverlay}
        />
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 16,
          marginBottom: 8,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(22px, 4vw, 44px)',
              letterSpacing: 4,
              color: '#fff',
              textShadow: '0 0 20px rgba(0,255,136,0.2)',
            }}
          >
            🦑 Backyard Chipirons 2026
          </div>
          {!isMobile && (
            <div
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 13,
                color: '#666',
                letterSpacing: 1,
                marginTop: 2,
              }}
            >
              Samedi 4 juillet 2026 · Ville-d&apos;Avray
            </div>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            gap: isMobile ? 16 : 30,
            fontFamily: "'Oswald', sans-serif",
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: isMobile ? 28 : 36,
                color: '#00ff88',
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              {activeRunners.length}
            </div>
            <div style={{ fontSize: 11, color: '#666', letterSpacing: 2, textTransform: 'uppercase' }}>
              En course
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: isMobile ? 28 : 36,
                color: '#cc0000',
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              {eliminatedRunners.length}
            </div>
            <div style={{ fontSize: 11, color: '#666', letterSpacing: 2, textTransform: 'uppercase' }}>
              Éliminés
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: isMobile ? 28 : 36,
                color: '#4488ff',
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              {currentLoop || '—'}
            </div>
            <div style={{ fontSize: 11, color: '#666', letterSpacing: 2, textTransform: 'uppercase' }}>
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

      {/* Participant wall — main focal point */}
      <div style={{ marginTop: 24 }}>
        <ParticipantWall runners={state.runners} size={100} />
      </div>

      {/* Active runners — secondary detail list */}
      <div style={{ marginTop: 32, opacity: 0.7 }}>
        <div
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 11,
            color: '#555',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Coureurs en lice
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sortedActive.map((r) => (
            <RunnerRow
              key={r.id}
              runner={r}
              fastestLoopRunnerId={fastestLoopRunnerId}
              currentLoop={currentLoop}
              lastArrival={state.lastArrival}
              msRemaining={msRemaining}
            />
          ))}
        </div>
      </div>

      {/* Live stats footer */}
      {state.raceStarted && (
        <LiveStatsFooter state={state} raceElapsedMs={raceElapsedMs} />
      )}
    </div>
  );
}
