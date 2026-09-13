import { TimerState } from '../types';

export function calculateRemainingSeconds(timerState: TimerState | undefined | null, now: number = Date.now()): number {
  if (!timerState) return 0;

  const { startedAt, pausedAt, durationSeconds, remainingSeconds } = timerState;

  // Not started yet
  if (!startedAt) {
    return durationSeconds;
  }

  // Currently paused
  if (pausedAt) {
    return Math.max(0, remainingSeconds);
  }

  // Running: calculate elapsed time since startedAt
  const elapsedSeconds = Math.floor((now - startedAt) / 1000);
  const remaining = durationSeconds - elapsedSeconds;

  return Math.max(0, remaining);
}

export function formatTimeMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
