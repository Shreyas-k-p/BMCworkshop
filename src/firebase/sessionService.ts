import { ref, get, update } from 'firebase/database';
import { db, auth } from './config';
import { Session, UIState } from '../types';

let creatingSessionLock = false;

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BMC${random}`;
}

export async function generateUniqueSessionCode(): Promise<string> {
  let code = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const snapshot = await get(ref(db, `sessionCodes/${code}`));
    if (!snapshot.exists()) {
      return code;
    }
    code = generateCode();
    attempts++;
  }
  return `${code}${Math.floor(Math.random() * 90 + 10)}`;
}

export async function createSession(): Promise<Session> {
  const user = auth.currentUser;
  if (!user) {
    console.error('[BMC DATABASE] SESSION CREATE FAILED: Authentication not ready');
    throw new Error('Host authentication is not ready');
  }

  if (creatingSessionLock) {
    console.warn('[BMC DATABASE] SESSION CREATE BLOCKED: Creation already in progress');
    throw new Error('Session creation already in progress.');
  }

  creatingSessionLock = true;
  console.log('[BMC DATABASE] SESSION CREATE START');

  try {
    const code = await generateUniqueSessionCode();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = Date.now();
    const hostUid = user.uid;

    const newSession: Session = {
      id: sessionId,
      code,
      hostUid,
      hasActiveSession: true,
      uiState: 'JOINING',
      createdAt: now,
      updatedAt: now,
      stateVersion: 1,
      currentTeamNumber: null,
      currentPresentingTeamId: null,
      presentationIndex: 0,
      presentationOrder: [],
      leaderboardRevealed: false,
      preparation: {
        startedAt: null,
        pausedAt: null,
        durationSeconds: 900,
        remainingSeconds: 900,
        totalPausedSeconds: 0
      },
      study: {
        startedAt: null,
        pausedAt: null,
        durationSeconds: 600,
        remainingSeconds: 600,
        totalPausedSeconds: 0
      },
      presentation: {
        startedAt: null,
        pausedAt: null,
        durationSeconds: 180,
        remainingSeconds: 180,
        totalPausedSeconds: 0
      }
    };

    const updates: Record<string, any> = {};
    updates[`sessions/${sessionId}`] = newSession;
    updates[`sessionCodes/${code}`] = { sessionId };

    await update(ref(db), updates);

    console.log('[BMC DATABASE] SESSION CREATE SUCCESS');
    console.log('[BMC SESSION] Session ID:', sessionId, 'Code:', code, 'hostUid:', hostUid);
    return newSession;
  } catch (err: any) {
    const code = err.code || err.name || 'PERMISSION_DENIED';
    const message = err.message || 'Failed to create session in Realtime Database';
    console.error('[BMC DATABASE] SESSION CREATE FAILED');
    console.error('[BMC DATABASE] ERROR CODE:\n', code);
    console.error('[BMC DATABASE] ERROR MESSAGE:\n', message);
    throw err;
  } finally {
    creatingSessionLock = false;
  }
}

export async function findSessionByCode(code: string): Promise<Session | null> {
  const cleanCode = code.trim().toUpperCase();
  const codeSnap = await get(ref(db, `sessionCodes/${cleanCode}`));
  if (!codeSnap.exists()) {
    return null;
  }
  const val = codeSnap.val();
  const sessionId = typeof val === 'object' && val !== null ? val.sessionId : val;
  if (!sessionId) return null;

  const sessionSnap = await get(ref(db, `sessions/${sessionId}`));
  if (!sessionSnap.exists()) {
    return null;
  }
  return sessionSnap.val() as Session;
}

export async function updateSessionUIState(
  sessionId: string,
  nextState: UIState,
  currentVersion: number = 0,
  additionalData: Partial<Session> = {}
): Promise<void> {
  const sessionRef = ref(db, `sessions/${sessionId}`);
  const snap = await get(sessionRef);

  if (!snap.exists()) {
    throw new Error('Session does not exist');
  }

  const currentSession = snap.val() as Session;
  const newVersion = (currentSession.stateVersion || currentVersion) + 1;

  console.log('[BMC STATE]', {
    BEFORE: currentSession.uiState,
    AFTER: nextState,
    SOURCE: 'HOST_ACTION',
    SESSION: sessionId,
    VERSION: newVersion
  });

  const payload = {
    ...additionalData,
    uiState: nextState,
    stateVersion: newVersion,
    updatedAt: Date.now()
  };

  await update(sessionRef, payload);
}

export async function endSession(sessionId: string): Promise<void> {
  const sessionRef = ref(db, `sessions/${sessionId}`);
  const snap = await get(sessionRef);
  const currentVersion = snap.exists() ? (snap.val().stateVersion || 0) : 0;
  await update(sessionRef, {
    hasActiveSession: false,
    uiState: 'COMPLETED',
    stateVersion: currentVersion + 1,
    updatedAt: Date.now()
  });
  console.log('[BMC SESSION] Session ended:', sessionId, 'Version:', currentVersion + 1);
}
