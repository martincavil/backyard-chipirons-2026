'use client';

import { useState, useEffect } from 'react';
import { RaceState } from '@/types';
import { DEFAULT_STATE, SYNC_KEY } from '@/lib/constants';
import { loadState, loadFromStorage, saveState, persistToStorage } from '@/lib/storage';

export function useRaceState() {
  const [state, setState] = useState<RaceState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  // Load initial state
  useEffect(() => {
    (async () => {
      // Try localStorage first (faster), then persistent storage
      let saved = loadState();
      if (!saved) {
        saved = await loadFromStorage();
      }
      if (saved && saved.runners) {
        setState(saved);
      }
      setLoaded(true);
    })();
  }, []);

  // Listen for cross-tab sync
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === SYNC_KEY && e.newValue) {
        try {
          const synced = JSON.parse(e.newValue);
          if (synced && synced.runners) {
            setState(synced);
          }
        } catch {
          // Ignore parse errors
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Helper to update state with persistence
  const updateState = (newState: RaceState) => {
    setState(newState);
    saveState(newState);
    persistToStorage(newState);
  };

  return { state, setState: updateState, loaded };
}
