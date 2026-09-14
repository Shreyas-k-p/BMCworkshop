import { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import { Participant } from '../types';

/**
 * Subscribes DIRECTLY to participants/{sessionId}/{uid}.
 *
 * CORE RULE: A participant belongs to CURRENT SESSION + FIREBASE AUTH UID.
 * When sessionId changes, the previous listener is unsubscribed and a new
 * one is created for the new session. State is fully reset between sessions.
 */
export function useStudentParticipant(
  sessionId: string | null,
  uid: string | null
) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Track the previous sessionId so we can detect session changes and log them
  const prevSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId || !uid) {
      setParticipant(null);
      setLoading(false);
      return;
    }

    // Log session transitions
    const prevSessionId = prevSessionIdRef.current;
    if (prevSessionId && prevSessionId !== sessionId) {
      console.log('[BMC STUDENT] OLD SESSION:', prevSessionId);
      console.log('[BMC STUDENT] NEW SESSION:', sessionId);
    }
    prevSessionIdRef.current = sessionId;

    // CRITICAL: Reset participant state when the session changes.
    // This prevents any stale groupId / isCaptain from the previous session
    // from leaking into the new session before Firebase responds.
    setParticipant(null);
    setLoading(true);

    const participantPath = `participants/${sessionId}/${uid}`;

    console.log('[BMC SESSION] CURRENT SESSION:', sessionId);
    console.log('[BMC STUDENT] CURRENT UID:', uid);
    console.log('[BMC STUDENT] PARTICIPANT PATH:', participantPath);

    const participantRef = ref(db, participantPath);

    const unsubscribe = onValue(
      participantRef,
      (snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
          const data = snapshot.val() as Participant;
          console.log('[BMC STUDENT] GROUP ID:', data.groupId ?? 'null');
          setParticipant(data);
        } else {
          // Student hasn't joined this session yet — show join form
          setParticipant(null);
        }
      },
      (err) => {
        console.error('[useStudentParticipant] Firebase error:', err);
        setLoading(false);
      }
    );

    return () => {
      console.log('[BMC STUDENT] Unsubscribing participant listener for session:', sessionId, 'uid:', uid);
      unsubscribe();
    };
  }, [sessionId, uid]);

  return { participant, loading };
}
