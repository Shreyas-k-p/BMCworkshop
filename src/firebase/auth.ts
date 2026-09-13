import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './config';

export function initializeAuthListener(
  onSuccess: (user: User) => void,
  onError: (err: { code: string; message: string }) => void
) {
  console.log('[BMC AUTH] Auth listener started');

  const unsubscribe = onAuthStateChanged(
    auth,
    (user) => {
      console.log('[BMC AUTH] Current user:\n', user ? user.uid : null);
      if (user) {
        console.log('[BMC AUTH] Authentication READY');
        onSuccess(user);
      } else {
        console.log('[BMC AUTH] Anonymous sign-in started');
        signInAnonymously(auth)
          .then((cred) => {
            console.log('[BMC AUTH] Anonymous sign-in successful:\n', cred.user.uid);
            console.log('[BMC AUTH] Authentication READY');
            onSuccess(cred.user);
          })
          .catch((err: any) => {
            const code = err.code || 'auth/unknown';
            const message = err.message || 'Anonymous authentication failed';
            console.error('[BMC AUTH] ERROR CODE:\n', code);
            console.error('[BMC AUTH] ERROR MESSAGE:\n', message);
            onError({ code, message });
          });
      }
    },
    (err: any) => {
      const code = err.code || 'auth/unknown';
      const message = err.message || 'Auth listener failed';
      console.error('[BMC AUTH] ERROR CODE:\n', code);
      console.error('[BMC AUTH] ERROR MESSAGE:\n', message);
      onError({ code, message });
    }
  );

  return unsubscribe;
}
