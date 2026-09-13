import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import { Group } from '../types';

export function useStudentGroup(sessionId: string | null, groupId: string | null) {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!sessionId || !groupId) {
      setGroup(null);
      setLoading(false);
      return;
    }

    const groupRef = ref(db, `groups/${sessionId}/${groupId}`);

    const unsubscribe = onValue(
      groupRef,
      (snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
          setGroup(snapshot.val() as Group);
        } else {
          setGroup(null);
        }
      },
      (err) => {
        console.error('[useStudentGroup] Error fetching student group:', err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [sessionId, groupId]);

  return { group, loading };
}
