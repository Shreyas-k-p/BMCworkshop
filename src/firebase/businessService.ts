import { ref, get, update } from 'firebase/database';
import { db, auth } from './config';
import { BusinessIdea, Group, Participant, Session } from '../types';

export async function submitBusinessIdea(
  sessionId: string,
  groupId: string,
  captainUid: string,
  businessName: string,
  description: string
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to submit business idea.');
  }

  if (currentUser.uid !== captainUid) {
    throw new Error('Unauthorized: Captain UID does not match authenticated user.');
  }

  const cleanName = businessName.trim();
  const cleanDesc = description.trim();

  if (!cleanName || cleanName.length < 2) {
    throw new Error('Business name must be at least 2 characters.');
  }

  if (cleanName.length > 60) {
    throw new Error('Business name cannot exceed 60 characters.');
  }

  if (!cleanDesc || cleanDesc.length < 10) {
    throw new Error('About the business must be at least 10 characters.');
  }

  if (cleanDesc.length > 400) {
    throw new Error('About the business cannot exceed 400 characters.');
  }

  // 1. Verify session is active
  const sessionSnap = await get(ref(db, `sessions/${sessionId}`));
  if (!sessionSnap.exists()) {
    throw new Error('Session does not exist.');
  }
  const session = sessionSnap.val() as Session;
  if (!session.hasActiveSession) {
    throw new Error('Session is no longer active.');
  }

  // 2. Verify captain status and membership
  const participantSnap = await get(ref(db, `participants/${sessionId}/${captainUid}`));
  if (!participantSnap.exists()) {
    throw new Error('Participant record not found for this session.');
  }
  const participant = participantSnap.val() as Participant;
  if (!participant.isCaptain) {
    throw new Error('Only the designated team captain can submit the business idea.');
  }
  if (participant.groupId !== groupId) {
    throw new Error('Captain does not belong to this group.');
  }

  // 3. Check if already locked
  const existingIdeaSnap = await get(ref(db, `businessIdeas/${sessionId}/${groupId}`));
  if (existingIdeaSnap.exists() && existingIdeaSnap.val().locked) {
    throw new Error('Business idea has already been submitted and locked.');
  }

  const idea: BusinessIdea = {
    businessName: cleanName,
    description: cleanDesc,
    submittedBy: captainUid,
    submittedAt: Date.now(),
    locked: true
  };

  const updates: Record<string, any> = {};
  updates[`businessIdeas/${sessionId}/${groupId}`] = idea;
  updates[`groups/${sessionId}/${groupId}/businessIdea`] = idea;

  await update(ref(db), updates);
  console.log('[BMC BUSINESS IDEA] Submitted for group:', groupId, 'Name:', cleanName);
}

const DEMO_IDEAS: Array<{ name: string; desc: string }> = [
  {
    name: 'SleepBot',
    desc: 'A robot that wakes up sleepy college students and physically carries them to class.'
  },
  {
    name: 'BreakFast',
    desc: 'Drone breakfast delivery for students who wake up five minutes before their morning lecture.'
  },
  {
    name: 'AttendanceBot',
    desc: 'An AI assistant that calculates the optimal bunk rate to maintain exactly 75.1% attendance.'
  },
  {
    name: 'GhostWriter Pen',
    desc: 'A smart vibrating pen that buzzes when you are about to select the wrong MCQ option.'
  },
  {
    name: 'ProcrastiMate',
    desc: 'An app that matches you with other students so you can procrastinate together guilt-free.'
  },
  {
    name: 'CaffeineRush',
    desc: 'High-speed espresso delivery dispatched via miniature catapult across campus.'
  },
  {
    name: 'NoteNinja',
    desc: 'Instant peer-to-peer handwriting transcriber that turns teacher whiteboard scribbles into clean summaries.'
  },
  {
    name: 'MessRescue',
    desc: 'A culinary emergency hotline supplying tasty seasonings to survive college hostel food.'
  }
];

export async function simulateDemoBusinessIdeas(sessionId: string): Promise<void> {
  const groupsSnap = await get(ref(db, `groups/${sessionId}`));
  if (!groupsSnap.exists()) return;

  const groups = groupsSnap.val() as Record<string, Group>;
  const groupList = Object.values(groups);

  const updates: Record<string, any> = {};
  const now = Date.now();

  groupList.forEach((group, idx) => {
    if (!group.businessIdea) {
      const demo = DEMO_IDEAS[idx % DEMO_IDEAS.length];
      const idea: BusinessIdea = {
        businessName: demo.name,
        description: demo.desc,
        submittedBy: group.captainId || 'demo_captain',
        submittedAt: now,
        locked: true
      };
      updates[`businessIdeas/${sessionId}/${group.id}`] = idea;
      updates[`groups/${sessionId}/${group.id}/businessIdea`] = idea;
    }
  });

  await update(ref(db), updates);
  console.log('[BMC BUSINESS IDEA] Simulated demo business ideas for session:', sessionId);
}
