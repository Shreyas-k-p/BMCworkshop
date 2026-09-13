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

  const now = Date.now();
  const participant: Participant = {
    uid,
    name: name.trim(),
    department,
    status: 'active',
    joinedAt: now,
    lastSeenAt: now,
    groupId: null,
    isCaptain: false
  };

  await set(ref(db, `participants/${sessionId}/${uid}`), participant);
  console.log('[BMC PARTICIPANT] Joined session:', sessionId, name, department);

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
