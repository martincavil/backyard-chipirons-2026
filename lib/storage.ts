import { RaceState } from '@/types';
import { STORAGE_KEY, SYNC_KEY } from './constants';

// Persistent storage helpers
export function saveState(state: RaceState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Trigger sync to other tabs
    localStorage.setItem(
      SYNC_KEY,
      JSON.stringify({ ...state, _ts: Date.now() }),
    );
  } catch (e) {
    console.error('Save failed', e);
  }
}

export function loadState(): RaceState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Ignore error
  }
  return null;
}

// Also persist to window.storage for cross-session (if available)
export async function persistToStorage(state: RaceState): Promise<void> {
  try {
    if ((window as any).storage) {
      await (window as any).storage.set('race-state', JSON.stringify(state));
    }
  } catch (e) {
    // Ignore error
  }
}

export async function loadFromStorage(): Promise<RaceState | null> {
  try {
    if ((window as any).storage) {
      const result = await (window as any).storage.get('race-state');
      if (result) return JSON.parse(result.value);
    }
  } catch (e) {
    // Ignore error
  }
  return null;
}
