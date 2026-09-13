import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { initializeAuthListener } from '../firebase/auth';

export interface AuthState {
  user: User | null;
  uid: string | null;
  loading: boolean;
  authenticated: boolean;
  error: string | null;
  errorCode: string | null;
  retry: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const retry = useCallback(() => {
    setLoading(true);
    setAuthenticated(false);
    setError(null);
    setErrorCode(null);
    setRetryCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = initializeAuthListener(
      (u) => {
        setUser(u);
        setAuthenticated(true);
        setLoading(false);
        setError(null);
        setErrorCode(null);
      },
      (err) => {
        setUser(null);
        setAuthenticated(false);
        setLoading(false);
        setErrorCode(err.code);
        setError(`${err.code}: ${err.message}`);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [retryCount]);

  return {
    user,
    uid: user ? user.uid : null,
    loading,
    authenticated,
    error,
    errorCode,
    retry
  };
}
