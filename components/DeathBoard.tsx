'use client';

import { Runner } from '@/types';

interface DeathRowProps {
  runner: Runner;
  index: number;
}

function DeathRow({ runner, index }: DeathRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        borderRadius: 8,
        background: 'rgba(255,0,0,0.04)',
        border: '1px solid rgba(255,0,0,0.1)',
        opacity: 0.8,
        animation: `slideIn 0.5s ease ${index * 0.05}s both`,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1px solid #440000',
          flexShrink: 0,
          background: '#1a0a0a',
          filter: 'grayscale(100%)',
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
              color: '#333',
              fontSize: 14,
            }}
          >
            💀
          </div>
        )}
      </div>
      <div style={{ flex: 1, fontFamily: "'Oswald', sans-serif" }}>
        <span style={{ color: '#aa4444', fontSize: 15 }}>{runner.name}</span>
      </div>
      <div
        style={{
          fontSize: 12,
          color: '#664444',
          fontFamily: "'Oswald', sans-serif",
          textAlign: 'right',
        }}
      >
        <div>Boucle {runner.eliminatedAt?.loop || '?'}</div>
        <div>
          {runner.eliminatedAt?.reason === 'abandon' ? 'Abandon' : 'Hors délai'}
        </div>
      </div>
    </div>
  );
}

interface DeathBoardProps {
  eliminatedRunners: Runner[];
}

export function DeathBoard({ eliminatedRunners }: DeathBoardProps) {
  if (eliminatedRunners.length === 0) return null;

  return (
    <div style={{ flex: 1, minWidth: 220 }}>
      <div
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontSize: 14,
          color: '#662222',
          letterSpacing: 3,
          textTransform: 'uppercase',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        💀 Death Board
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {eliminatedRunners.map((r, i) => (
          <DeathRow key={r.id} runner={r} index={i} />
        ))}
      </div>
    </div>
  );
}
