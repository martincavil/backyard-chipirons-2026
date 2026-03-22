export type RunnerStatus = 'active' | 'dnf' | 'winner';

export type EliminationReason = 'timeout' | 'abandon';

export interface Loop {
  loop: number;
  timeMs: number;
  finishTime: string; // ISO string
}

export interface EliminatedAt {
  loop: number;
  time: string; // ISO string
  reason: EliminationReason;
}

export interface Runner {
  id: string;
  name: string;
  photo: string | null;
  status: RunnerStatus;
  loops: Loop[];
  eliminatedAt: EliminatedAt | null;
}

export interface LastElimination {
  name: string;
  _ts: number;
}

export interface RaceState {
  raceStartTime: string | null; // ISO string of race start (noon Paris)
  raceStarted: boolean;
  raceFinished: boolean;
  runners: Runner[];
  lastElimination: LastElimination | null;
}

export interface LoopInfo {
  currentLoop: number;
  msRemaining: number;
  loopStartTime: Date | null;
  loopEndTime: Date | null;
  preRace?: boolean;
}
