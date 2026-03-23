'use client';

import { UndoableAction } from '@/hooks/useUndoAction';

interface UndoToastProps {
  actions: UndoableAction[];
  onUndo: (actionId: string) => void;
  onDismiss: (actionId: string) => void;
}

export function UndoToast({ actions, onUndo, onDismiss }: UndoToastProps) {
  if (actions.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 1000,
      }}
    >
      {actions.map((action, index) => (
        <div
          key={action.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 20px',
            backgroundColor: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            fontFamily: "'Oswald', sans-serif",
            fontSize: 15,
            color: '#eee',
            animation: 'slideUp 0.3s ease-out',
            minWidth: 400,
          }}
        >
          <span style={{ flex: 1 }}>{action.description}</span>
          <button
            onClick={() => onUndo(action.id)}
            style={{
              padding: '6px 16px',
              backgroundColor: '#ff8800',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              fontFamily: "'Oswald', sans-serif",
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ff9920';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ff8800';
            }}
          >
            Annuler
          </button>
          <button
            onClick={() => onDismiss(action.id)}
            style={{
              padding: '6px 12px',
              backgroundColor: 'transparent',
              color: '#666',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
            title="Fermer"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
