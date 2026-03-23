'use client';

import { useState, useCallback } from 'react';
import { RaceState } from '@/types';

export interface UndoableAction {
  id: string;
  description: string;
  previousState: RaceState;
  timestamp: number;
}

const MAX_TOASTS = 3;
const UNDO_TIMEOUT = 5000; // 5 seconds

export function useUndoAction(
  currentState: RaceState,
  setState: (state: RaceState) => void,
) {
  const [undoActions, setUndoActions] = useState<UndoableAction[]>([]);

  const addUndoAction = useCallback(
    (description: string, previousState: RaceState) => {
      const action: UndoableAction = {
        id: Date.now().toString(),
        description,
        previousState,
        timestamp: Date.now(),
      };

      setUndoActions((prev) => {
        // Keep only the last MAX_TOASTS - 1 actions to make room for the new one
        const updated = [...prev, action].slice(-MAX_TOASTS);
        return updated;
      });

      // Auto-remove after timeout
      setTimeout(() => {
        setUndoActions((prev) => prev.filter((a) => a.id !== action.id));
      }, UNDO_TIMEOUT);
    },
    [],
  );

  const undoAction = useCallback(
    (actionId: string) => {
      const action = undoActions.find((a) => a.id === actionId);
      if (action) {
        setState(action.previousState);
        setUndoActions((prev) => prev.filter((a) => a.id !== actionId));
      }
    },
    [undoActions, setState],
  );

  const dismissAction = useCallback((actionId: string) => {
    setUndoActions((prev) => prev.filter((a) => a.id !== actionId));
  }, []);

  return {
    undoActions,
    addUndoAction,
    undoAction,
    dismissAction,
  };
}
