import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import { Group } from '../types';

export function useGroups(sessionId: string | null) {
  const [groups, setGroups] = useState<Record<string, Group>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!sessionId) {
      setGroups({});
      setLoading(false);
      return;
    }

    const groupsRef = ref(db, `groups/${sessionId}`);

    const unsubscribe = onValue(
      groupsRef,
      (snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
          setGroups(snapshot.val() as Record<string, Group>);
        } else {
          setGroups({});
        }
      },
      (err) => {
        console.error('[useGroups] Error:', err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [sessionId]);

  const groupList = Object.values(groups).sort((a, b) => a.groupNumber - b.groupNumber);

  return { groups, groupList, loading };
}
