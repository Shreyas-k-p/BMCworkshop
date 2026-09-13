import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import { Participant } from '../types';

export function useParticipants(sessionId: string | null) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!sessionId) {
      setParticipants([]);
      setLoading(false);
      return;
    }

    const partsRef = ref(db, `participants/${sessionId}`);

    const unsubscribe = onValue(
      partsRef,
      (snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
          const data = snapshot.val() as Record<string, Participant>;
          const list = Object.values(data).sort((a, b) => a.joinedAt - b.joinedAt);
          setParticipants(list);
        } else {
          setParticipants([]);
        }
      },
      (err) => {
        console.error('[useParticipants] Error:', err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [sessionId]);

  return { participants, count: participants.length, loading };
}
