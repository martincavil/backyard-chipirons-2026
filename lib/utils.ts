import { LoopInfo } from '@/types';
import { TZ, MAX_LOOP_DURATION_MS } from './constants';

// Format ms to MM:SS or HH:MM:SS
export function formatTime(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatTimeFull(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Get current Paris time
export function getParisNow(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
}

// Get the next hour boundary from a Paris date
export function getNextHourBoundary(parisDate: Date): Date {
  const next = new Date(parisDate);
  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  return next;
}

// Compute current loop info based on race start time (noon Paris)
export function computeLoopInfo(raceStartTime: string | null): LoopInfo {
  const now = getParisNow();
  if (!raceStartTime)
    return {
      currentLoop: 0,
      msRemaining: 0,
      loopStartTime: null,
      loopEndTime: null,
    };

  const start = new Date(raceStartTime);
  const elapsed = now.getTime() - start.getTime();

  if (elapsed < 0) {
    return {
      currentLoop: 0,
      msRemaining: -elapsed,
      loopStartTime: null,
      loopEndTime: null,
      preRace: true,
    };
  }

  const currentLoop = Math.floor(elapsed / MAX_LOOP_DURATION_MS) + 1;
  const loopStart = new Date(
    start.getTime() + (currentLoop - 1) * MAX_LOOP_DURATION_MS,
  );
  const loopEnd = new Date(loopStart.getTime() + MAX_LOOP_DURATION_MS);
  const msRemaining = loopEnd.getTime() - now.getTime();

  return {
    currentLoop,
    msRemaining,
    loopStartTime: loopStart,
    loopEndTime: loopEnd,
  };
}
