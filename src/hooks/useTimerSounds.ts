import { useEffect, useRef } from 'react';
import { TimerState } from '../types';
import { useTimer } from './useTimer';
import { soundEffects } from '../utils/soundEffects';

/**
 * Fires sound effects for timer milestones, guarded against duplicates.
 *
 * The guard key is: `${stageKey}-${presentationIndex}-${milestone}`
 * This means:
 *   - Refreshing the page at 20s won't re-trigger the 30s warning.
 *   - Advancing to presentation #2 resets the milestone set correctly
 *     (new key prefix) so the 30s warning fires again for team #2.
 *
 * @param timerState - Firebase timer state from session
 * @param stageKey   - e.g. 'preparation', 'study', 'presentation'
 * @param presentationIndex - current presentation index (for presentation timer only)
 */
export function useTimerSounds(
  timerState: TimerState | undefined | null,
  stageKey: string,
  presentationIndex = 0
) {
  const { remaining, isRunning, isTimeUp } = useTimer(timerState);

  // Prefix changes when presentationIndex changes → milestone set resets naturally
  const keyPrefix = `${stageKey}-${presentationIndex}`;

  // Set of already-played milestones for this stageKey+presentationIndex combo
  const played = useRef<Set<string>>(new Set());
  const lastKeyPrefix = useRef<string>(keyPrefix);

  // Reset guard when prefix changes (new presentation team or new stage)
  if (lastKeyPrefix.current !== keyPrefix) {
    played.current = new Set();
    lastKeyPrefix.current = keyPrefix;
  }

  // Track whether the timer was running in the previous render
  const wasRunning = useRef(false);

  useEffect(() => {
    if (!isRunning) {
      wasRunning.current = false;
      return;
    }

    // ── Timer just started (transition from not-running to running) ──────────
    if (!wasRunning.current) {
      wasRunning.current = true;
      const startKey = `${keyPrefix}-start`;
      if (!played.current.has(startKey)) {
        played.current.add(startKey);
        if (stageKey === 'presentation') {
          soundEffects.playPresentationStart();
        } else {
          soundEffects.playSuccess();
        }
      }
    }

    // ── 60s warning (study and preparation only) ─────────────────────────────
    if (remaining === 60 && stageKey !== 'presentation') {
      const key = `${keyPrefix}-60`;
      if (!played.current.has(key)) {
        played.current.add(key);
        soundEffects.playWarning();
      }
    }

    // ── 30s warning (presentation only) ─────────────────────────────────────
    if (remaining === 30 && stageKey === 'presentation') {
      const key = `${keyPrefix}-30`;
      if (!played.current.has(key)) {
        played.current.add(key);
        soundEffects.playWarning();
      }
    }

    // ── Final 10-second countdown (all stages) ───────────────────────────────
    if (remaining > 0 && remaining <= 10) {
      const key = `${keyPrefix}-${remaining}`;
      if (!played.current.has(key)) {
        played.current.add(key);
        soundEffects.playCountdownBeep(remaining <= 5);
      }
    }
  }, [remaining, isRunning, stageKey, keyPrefix]);

  // ── TIME'S UP ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isTimeUp) {
      const key = `${keyPrefix}-timesup`;
      if (!played.current.has(key)) {
        played.current.add(key);
        soundEffects.playTimeUp();
      }
    }
  }, [isTimeUp, keyPrefix]);
}
