'use client';

import { useState } from 'react';
import { SoundType } from '@/lib/sounds';

interface SoundboardProps {
  onPlaySound: (sound: SoundType) => void;
}

const sounds: Array<{ type: SoundType; emoji: string; label: string }> = [
  { type: 'horn', emoji: '🏁', label: 'Klaxon de départ' },
  { type: 'applause', emoji: '👏', label: 'Applaudissements' },
  { type: 'boss', emoji: '⚔️', label: 'Boss fight' },
  { type: 'victory', emoji: '🎉', label: 'Victoire' },
];

export function Soundboard({ onPlaySound }: SoundboardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      style={{
        marginTop: 20,
        border: '1px solid #333',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#0f0f1a',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '14px 20px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: 'none',
          color: '#eee',
          fontFamily: "'Oswald', sans-serif",
          fontSize: 16,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #1f1f33 0%, #1a2644 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
        }}
      >
        <span>🎵 Soundboard</span>
        <span style={{ fontSize: 12, color: '#666' }}>
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div
          style={{
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {sounds.map((sound) => (
            <button
              key={sound.type}
              onClick={() => onPlaySound(sound.type)}
              style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
                border: '1px solid #333',
                borderRadius: 8,
                color: '#eee',
                fontFamily: "'Oswald', sans-serif",
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#00cc66';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,204,102,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: 32 }}>{sound.emoji}</span>
              <span style={{ fontSize: 14 }}>{sound.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
