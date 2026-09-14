import { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import { Session } from '../types';

export function useSession(sessionId: string | null) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const lastVersionRef = useRef<number>(0);

  useEffect(() => {
    lastVersionRef.current = 0;
    if (!sessionId) {
      setSession(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const sessionRef = ref(db, `sessions/${sessionId}`);

    const unsubscribe = onValue(
      sessionRef,
      (snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
          const incoming = snapshot.val() as Session;

          const incomingVer = incoming.stateVersion || 0;
          if (incomingVer >= lastVersionRef.current) {
            console.log('[BMC REALTIME] SESSION UPDATE', {
              uiState: incoming.uiState,
              version: incomingVer,
              hasActiveSession: incoming.hasActiveSession
            });
            lastVersionRef.current = incomingVer;
            setSession(incoming);
          } else {
            console.warn('[BMC REALTIME] Ignoring stale session update:', incomingVer, '<', lastVersionRef.current);
          }
        } else {
          console.warn('[BMC REALTIME] Session snapshot does not exist:', sessionId);
          setSession(null);
        }
      },
      (err) => {
        console.error('[BMC REALTIME] Error reading session:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [sessionId]);

  return { session, loading, error };
}
