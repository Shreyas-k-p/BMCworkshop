import { ref, set, serverTimestamp } from 'firebase/database';
import { db, auth } from './config';

console.log('[BMC DATABASE] INITIALIZED');

export async function testDatabaseConnection(): Promise<void> {
  console.log('[BMC DATABASE] CONNECTION TEST START');
  const user = auth.currentUser;

  if (!user) {
    const errorMsg = 'Authentication not ready';
    console.error('[BMC DATABASE] CONNECTION TEST FAILED:', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const testRef = ref(db, `connectionTests/${user.uid}`);
    await set(testRef, {
      uid: user.uid,
      timestamp: serverTimestamp()
    });

    console.log('[BMC DATABASE] CONNECTION TEST SUCCESS');
  } catch (err: any) {
    const code = err.code || err.name || 'PERMISSION_DENIED';
    const message = err.message || 'Database connection test failed';
    console.error('[BMC DATABASE] ERROR CODE:\n', code);
    console.error('[BMC DATABASE] ERROR MESSAGE:\n', message);
    throw err;
  }
}

export function formatDatabaseError(err: any): { code: string; message: string; isDbError: boolean } {
  const code = err?.code || err?.name || 'PERMISSION_DENIED';
  const message = err?.message || 'Permission denied or database error';
  console.error('[BMC DATABASE] ERROR CODE:\n', code);
  console.error('[BMC DATABASE] ERROR MESSAGE:\n', message);
  return { code, message, isDbError: true };
}
