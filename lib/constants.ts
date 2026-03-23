import { RaceState } from '@/types';

export const STORAGE_KEY = 'backyard-chipirons-2026';
export const SYNC_KEY = 'backyard-chipirons-sync';
export const LOOP_DISTANCE_KM = 6.7;
export const MAX_LOOP_DURATION_MS = 60 * 60 * 1000; // 1 hour
export const TZ = 'Europe/Paris';

export const DEFAULT_STATE: RaceState = {
  raceStartTime: null,
  raceStarted: false,
  raceFinished: false,
  runners: [],
  lastElimination: null,
  lastArrival: null,
  soundToPlay: null,
};
