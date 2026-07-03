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
import { CaptainMorganRain } from './CaptainMorganRain';

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

        {/* Mini participant wall at top-right */}
        {state.runners.length > 0 && (
          <div
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              maxWidth: 500,
              zIndex: 100,
              transform: 'scale(0.7)',
              transformOrigin: 'top right',
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
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Captain Morgan bottles raining in the background */}
        <CaptainMorganRain count={28} />

        <div
          style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            color: 'gold',
            letterSpacing: 6,
            marginBottom: 20,
            textTransform: 'uppercase',
            position: 'relative',
            zIndex: 1,
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
            position: 'relative',
            zIndex: 1,
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
            position: 'relative',
            zIndex: 1,
          }}
        >
          {winner.name}
        </div>
        <div style={{ fontSize: 24, color: '#00ff88', marginTop: 10, position: 'relative', zIndex: 1 }}>
          {winner.loops.length} boucles ·{' '}
          {(winner.loops.length * LOOP_DISTANCE_KM).toFixed(1)} km
        </div>
      </div>
    );
  }

  // ---- MOBILE layout (scrollable, stacked) ----
  if (isMobile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(ellipse at top, #0d1b2a 0%, #050a14 60%)',
          color: '#fff',
          padding: '12px 12px 80px',
          position: 'relative',
        }}
      >
        {wastedRunner && (
          <WastedOverlay name={wastedRunner} onDone={dismissWastedOverlay} />
        )}

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
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(22px, 4vw, 44px)',
              letterSpacing: 4,
              color: '#fff',
            }}
          >
            🦑 Backyard Chipirons 2026
          </div>
          <div style={{ display: 'flex', gap: 16, fontFamily: "'Oswald', sans-serif" }}>
            <HeaderStat value={activeRunners.length} label="En course" color="#00ff88" size={28} />
            <HeaderStat value={eliminatedRunners.length} label="Éliminés" color="#cc0000" size={28} />
            <HeaderStat value={currentLoop || '—'} label="Boucle" color="#4488ff" size={28} />
          </div>
        </div>

        {state.raceStarted && (
          <CorralTimer msRemaining={msRemaining} currentLoop={currentLoop} preRace={preRace} />
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

        <div style={{ marginTop: 24 }}>
          <ParticipantWall runners={state.runners} size={100} />
        </div>

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

        {state.raceStarted && (
          <LiveStatsFooter state={state} raceElapsedMs={raceElapsedMs} />
        )}
      </div>
    );
  }

  // ---- TV layout (fullscreen, no scroll, two columns) ----
  // Photo size adapts to how many people are on the wall so nothing overflows.
  const wallCount = state.runners.length;
  const wallSize =
    wallCount <= 10 ? 150 : wallCount <= 14 ? 130 : wallCount <= 18 ? 112 : 96;

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at top, #0d1b2a 0%, #050a14 60%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {wastedRunner && (
        <WastedOverlay name={wastedRunner} onDone={dismissWastedOverlay} />
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 32px',
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 42,
              letterSpacing: 4,
              color: '#fff',
              textShadow: '0 0 20px rgba(0,255,136,0.2)',
            }}
          >
            🦑 Backyard Chipirons 2026
          </div>
          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 14,
              color: '#666',
              letterSpacing: 1,
            }}
          >
            Samedi 4 juillet 2026 · Ville-d&apos;Avray
          </div>
        </div>
        <div style={{ display: 'flex', gap: 40, fontFamily: "'Oswald', sans-serif" }}>
          <HeaderStat value={activeRunners.length} label="En course" color="#00ff88" size={52} />
          <HeaderStat value={eliminatedRunners.length} label="Éliminés" color="#cc0000" size={52} />
          <HeaderStat value={currentLoop || '—'} label="Boucle" color="#4488ff" size={52} />
        </div>
      </div>

      {/* Main two-column area */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* LEFT: clock + participant wall */}
        <div
          style={{
            flex: '1 1 62%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {state.raceStarted ? (
            <CorralTimer msRemaining={msRemaining} currentLoop={currentLoop} preRace={preRace} />
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 0',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 56,
                color: '#444',
                letterSpacing: 6,
              }}
            >
              En attente du départ...
            </div>
          )}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '8px 24px 24px',
            }}
          >
            <ParticipantWall runners={state.runners} size={wallSize} />
          </div>
        </div>

        {/* RIGHT: active runners list */}
        <div
          style={{
            flex: '1 1 38%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            padding: '20px 24px 20px 28px',
          }}
        >
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 24,
              color: '#00ff88',
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 14,
              flexShrink: 0,
            }}
          >
            Coureurs en lice
          </div>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
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
            {sortedActive.length === 0 && (
              <div style={{ color: '#444', fontFamily: "'Oswald', sans-serif", fontSize: 16 }}>
                Aucun coureur en lice.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer stats bar (inline, part of the flex column) */}
      {state.raceStarted && (
        <div style={{ flexShrink: 0 }}>
          <LiveStatsFooter state={state} raceElapsedMs={raceElapsedMs} inline />
        </div>
      )}
    </div>
  );
}

interface HeaderStatProps {
  value: number | string;
  label: string;
  color: string;
  size: number;
}

function HeaderStat({ value, label, color, size }: HeaderStatProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: size, color, fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#666', letterSpacing: 2, textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}
