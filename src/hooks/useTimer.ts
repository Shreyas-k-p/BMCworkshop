import { useState, useEffect } from 'react';
import { TimerState } from '../types';
import { calculateRemainingSeconds, formatTimeMMSS } from '../utils/timers';

export function useTimer(timerState: TimerState | undefined | null) {
  const [remaining, setRemaining] = useState<number>(() => calculateRemainingSeconds(timerState));

  useEffect(() => {
    // Initial calculation
    setRemaining(calculateRemainingSeconds(timerState));

    if (!timerState || (!timerState.startedAt && !timerState.pausedAt)) {
      return;
    }

    const interval = setInterval(() => {
      const rem = calculateRemainingSeconds(timerState);
      setRemaining(rem);
    }, 200);

    return () => clearInterval(interval);
  }, [timerState]);

  const isRunning = Boolean(timerState?.startedAt && !timerState?.pausedAt);
  const isPaused = Boolean(timerState?.pausedAt);
  const isTimeUp = remaining === 0;

  return {
    remaining,
    formatted: formatTimeMMSS(remaining),
    isRunning,
    isPaused,
    isTimeUp
  };
}
