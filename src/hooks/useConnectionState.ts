import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/config';

export function useConnectionState(): boolean {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.exists()) {
        setIsConnected(Boolean(snap.val()));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isConnected;
}
