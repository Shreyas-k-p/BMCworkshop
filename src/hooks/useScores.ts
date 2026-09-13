import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import { ScoreSubmission } from '../types';

export function useScores(sessionId: string | null, presentingGroupId: string | null = null) {
  const [scores, setScores] = useState<Record<string, Record<string, ScoreSubmission>>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!sessionId) {
      setScores({});
      setLoading(false);
      return;
    }

    const scoresRef = ref(db, `scores/${sessionId}`);

    const unsubscribe = onValue(
      scoresRef,
      (snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
          setScores(snapshot.val() as Record<string, Record<string, ScoreSubmission>>);
        } else {
          setScores({});
        }
      },
      (err) => {
        console.error('[useScores] Error:', err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [sessionId]);

  const currentPresentingScores = presentingGroupId && scores[presentingGroupId] ? Object.values(scores[presentingGroupId]) : [];

  return { scores, currentPresentingScores, loading };
}
