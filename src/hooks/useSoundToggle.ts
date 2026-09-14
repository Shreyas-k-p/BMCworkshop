import { useState, useCallback } from 'react';
import { soundEffects } from '../utils/soundEffects';

/**
 * Returns [enabled, toggle] for the global sound effects toggle.
 * Persisted to localStorage via soundEffects.setEnabled().
 */
export function useSoundToggle(): [boolean, () => void] {
  const [enabled, setEnabled] = useState(() => soundEffects.enabled);

  const toggle = useCallback(() => {
    const next = !soundEffects.enabled;
    soundEffects.setEnabled(next);
    setEnabled(next);
  }, []);

  return [enabled, toggle];
}
