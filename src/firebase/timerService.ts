import { ref, get, update } from 'firebase/database';
import { db } from './config';
import { TimerState } from '../types';
import { calculateRemainingSeconds } from '../utils/timers';

type TimerType = 'businessIdea' | 'preparation' | 'study' | 'presentation';

export async function startTimer(sessionId: string, timerType: TimerType): Promise<void> {
  const path = `sessions/${sessionId}/${timerType}`;
  const snap = await get(ref(db, path));
  if (!snap.exists()) return;

  const current = snap.val() as TimerState;
  const remaining = current.pausedAt ? current.remainingSeconds : current.durationSeconds;

  await update(ref(db, path), {
    startedAt: Date.now(),
    pausedAt: null,
    durationSeconds: remaining,
    remainingSeconds: remaining
  });

  console.log('[BMC TIMER] Started', timerType, 'timer for session:', sessionId);
}

export async function pauseTimer(sessionId: string, timerType: TimerType): Promise<void> {
  const path = `sessions/${sessionId}/${timerType}`;
  const snap = await get(ref(db, path));
  if (!snap.exists()) return;

  const current = snap.val() as TimerState;
  const remaining = calculateRemainingSeconds(current);

  await update(ref(db, path), {
    startedAt: null,
    pausedAt: Date.now(),
    remainingSeconds: remaining
  });

  console.log('[BMC TIMER] Paused', timerType, 'timer for session:', sessionId, 'remaining:', remaining);
}

export async function resetTimer(sessionId: string, timerType: TimerType, durationSeconds: number): Promise<void> {
  const path = `sessions/${sessionId}/${timerType}`;
  await update(ref(db, path), {
    startedAt: null,
    pausedAt: null,
    durationSeconds,
    remainingSeconds: durationSeconds
  });

  console.log('[BMC TIMER] Reset', timerType, 'timer for session:', sessionId);
}
