import { ref, set, get, update } from 'firebase/database';
import { db } from './config';
import { Participant, Department, DEPARTMENTS } from '../types';

const DEMO_NAMES = [
  'Akhil', 'Arjun', 'Ananya', 'Rahul', 'Meera', 'Nikhil', 'Adithya', 'Neha',
  'Priya', 'Siddharth', 'Varun', 'Kavya', 'Rohan', 'Sneha', 'Tanvi', 'Vikas',
  'Deepak', 'Aishwarya', 'Gautam', 'Divya', 'Karthik', 'Swati', 'Manish', 'Pooja',
  'Rishabh', 'Shruti', 'Tarun', 'Aniket', 'Bhavna', 'Chetan'
];

export async function joinSessionAsStudent(
  sessionId: string,
  uid: string,
  name: string,
  department: Department
): Promise<Participant> {
  const sessionSnap = await get(ref(db, `sessions/${sessionId}`));

  if (!sessionSnap.exists()) {
    throw new Error('SESSION NOT FOUND');
  }

  const session = sessionSnap.val();
  if (!session.hasActiveSession) {
    throw new Error('SESSION HAS ENDED');
  }

  // Check if this participant already exists in THIS session (e.g. page refresh mid-session).
  // If they already have a groupId assigned (teams already formed), preserve it.
  // If they are joining a NEW session, they will have groupId=null by definition
  // because the record doesn't exist yet.
  const existingSnap = await get(ref(db, `participants/${sessionId}/${uid}`));
  const existingData = existingSnap.exists() ? existingSnap.val() : null;

  const now = Date.now();
  const participant: Participant = {
    uid,
    name: name.trim(),
    department,
    status: 'active',
    joinedAt: existingData?.joinedAt ?? now,
    lastSeenAt: now,
    // CRITICAL: If a record already exists in THIS session, preserve its groupId.
    // If this is a brand-new join (no existing record), groupId must be null.
    groupId: existingData?.groupId ?? null,
    isCaptain: existingData?.isCaptain ?? false
  };

  const participantPath = `participants/${sessionId}/${uid}`;

  console.log('[BMC SESSION] CURRENT SESSION:', sessionId);
  console.log('[BMC STUDENT] CURRENT UID:', uid);
  console.log('[BMC STUDENT] PARTICIPANT PATH:', participantPath);
  console.log('[BMC STUDENT] Name:', name.trim(), '| Department:', department);
  console.log('[BMC STUDENT] groupId:', participant.groupId ?? 'null', '| isCaptain:', participant.isCaptain);
  if (existingData) {
    console.log('[BMC STUDENT] Rejoining SAME session — preserving existing state');
  } else {
    console.log('[BMC STUDENT] First join for this session — starting fresh with groupId=null');
  }

  await set(ref(db, participantPath), participant);
  console.log('[BMC PARTICIPANT] Joined session successfully:', sessionId, name.trim(), department);

  return participant;
}

export async function addDemoStudents(sessionId: string, count: number = 10): Promise<void> {
  const existingSnap = await get(ref(db, `participants/${sessionId}`));
  const existing = existingSnap.val() || {};
  const existingCount = Object.keys(existing).length;

  const updates: Record<string, Participant> = {};
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const idx = (existingCount + i) % DEMO_NAMES.length;
    const uid = `demo_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`;
    const name = `${DEMO_NAMES[idx]}${i >= DEMO_NAMES.length ? ` ${Math.floor(i / DEMO_NAMES.length) + 1}` : ''}`;
    const department = DEPARTMENTS[i % DEPARTMENTS.length];

    updates[uid] = {
      uid,
      name,
      department,
      status: 'active',
      joinedAt: now,
      lastSeenAt: now,
      groupId: null,
      isCaptain: false,
      isDemo: true
    };
  }

  await update(ref(db, `participants/${sessionId}`), updates);
  
  // Mark session as demo mode enabled
  await update(ref(db, `sessions/${sessionId}`), { isDemoMode: true });

  console.log('[BMC PARTICIPANT] Added', count, 'demo students to session:', sessionId);
}
