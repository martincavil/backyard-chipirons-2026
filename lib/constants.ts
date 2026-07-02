import { RaceState } from '@/types';

export const STORAGE_KEY = 'backyard-chipirons-2026';
export const SYNC_KEY = 'backyard-chipirons-sync';
export const LOOP_DISTANCE_KM = 6.6;
export const LOOP_ELEVATION_M = 117;
export const MAX_LOOP_DURATION_MS = 60 * 60 * 1000; // 1 hour
export const TZ = 'Europe/Paris';
export const FIRST_START_HOUR = 10; // 10h00 pile
export const LAST_START_HOUR = 19; // dernier départ possible
export const MAX_LOOPS = 10; // fin de course max 20h00

export const EVENT_NAME = "Backyard Chipiron(e)s 2026";
export const EVENT_DATE = '2026-07-04';
export const EVENT_LOCATION = "7 Chemin des Lutins, 92410 Ville-d'Avray";

// Couleur des goodies / casquettes de l'événement
export const ACCENT_GOLD = '#E2C543';

export const DEFAULT_STATE: RaceState = {
  raceStartTime: null,
  raceStarted: false,
  raceFinished: false,
  runners: [],
  lastElimination: null,
  lastArrival: null,
};
