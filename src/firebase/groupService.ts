import { ref, get, update } from 'firebase/database';
import { db } from './config';
import { Group, Participant } from '../types';
import { calculateOptimalTeams } from '../utils/grouping';
import { updateSessionUIState } from './sessionService';
import { resetTimer, startTimer } from './timerService';

export async function createBalancedGroups(sessionId: string): Promise<Record<string, Group>> {
  const partsSnap = await get(ref(db, `participants/${sessionId}`));

  if (!partsSnap.exists()) {
    throw new Error('No participants found to form teams.');
  }

  const partsObj = partsSnap.val() as Record<string, Participant>;
  const participants = Object.values(partsObj);

  console.log('[BMC GROUPING] Session:', sessionId, '| Participant count:', participants.length);
  participants.forEach(p => {
    console.log('[BMC GROUPING]  Participant:', p.name, '| UID:', p.uid, '| Dept:', p.department);
  });

  const { groups, error } = calculateOptimalTeams(participants);

  if (error) {
    throw new Error(error);
  }

  const updates: Record<string, any> = {};
  updates[`groups/${sessionId}`] = groups;

  // Build a set of all UIDs assigned across all groups so we can validate
  const assignedUids = new Set<string>();

  let assignedCount = 0;
  Object.values(groups).forEach(g => {
    const membersList = Array.isArray(g.members) ? g.members : Object.values(g.members);
    membersList.forEach(m => {
      if (m && m.uid) {
        updates[`participants/${sessionId}/${m.uid}/groupId`] = g.id;
        assignedUids.add(m.uid);
        assignedCount++;
      }
    });
  });

  // POST-ASSIGNMENT VALIDATION: Every participant MUST have a groupId.
  // If any participant was missed by the grouping algorithm, abort before writing.
  const unassigned = participants.filter(p => !assignedUids.has(p.uid));
  if (unassigned.length > 0) {
    const names = unassigned.map(p => `${p.name} (${p.uid})`).join(', ');
    console.error('[BMC GROUPING] TEAM FORMATION FAILED — unassigned participants:', names);
    throw new Error(
      `TEAM FORMATION FAILED: ${unassigned.length} participant(s) not assigned to a team: ${names}`
    );
  }

  console.log('[BMC GROUPING]');
  console.log('  Session:', sessionId);
  console.log('  Number of participants:', participants.length);
  console.log('  Number assigned:', assignedCount);
  console.log('  Groups created:', Object.keys(groups).length);
  console.log('  All participants assigned:', assignedCount === participants.length ? 'YES ✓' : 'NO ✗');

  await update(ref(db), updates);
  await updateSessionUIState(sessionId, 'GROUPS_READY');

  console.log('[BMC GROUP] Successfully created balanced groups:', Object.keys(groups).length);
  return groups;
}


export async function selectCaptainForGroup(
  sessionId: string,
  groupId: string,
  captainUid: string,
  captainName: string
): Promise<void> {
  const groupSnap = await get(ref(db, `groups/${sessionId}/${groupId}`));
  if (!groupSnap.exists()) {
    throw new Error('Group not found');
  }

  const group = groupSnap.val() as Group;
  const updates: Record<string, any> = {};

  if (group.captainId) {
    updates[`participants/${sessionId}/${group.captainId}/isCaptain`] = false;
    updates[`groups/${sessionId}/${groupId}/members/${group.captainId}/isCaptain`] = false;
  }

  updates[`groups/${sessionId}/${groupId}/captainId`] = captainUid;
  updates[`groups/${sessionId}/${groupId}/captainName`] = captainName;
  updates[`groups/${sessionId}/${groupId}/members/${captainUid}/isCaptain`] = true;
  updates[`participants/${sessionId}/${captainUid}/isCaptain`] = true;

  await update(ref(db), updates);
  console.log('[BMC CAPTAIN] Selected captain:', captainName, 'for group:', groupId);
}

export async function startBusinessIdeaChallenge(sessionId: string): Promise<void> {
  const groupsSnap = await get(ref(db, `groups/${sessionId}`));
  if (!groupsSnap.exists()) {
    throw new Error('No groups found for session');
  }

  // Reset and start the 5-minute business idea timer (300 seconds)
  await resetTimer(sessionId, 'businessIdea', 300);
  await startTimer(sessionId, 'businessIdea');
  await updateSessionUIState(sessionId, 'BUSINESS_IDEA');
  console.log('[BMC BUSINESS IDEA] Started 5-minute business idea challenge');
}

export async function generateAndSavePresentationOrder(sessionId: string): Promise<string[]> {
  const groupsSnap = await get(ref(db, `groups/${sessionId}`));
  if (!groupsSnap.exists()) {
    throw new Error('No groups found for session');
  }

  const groups = groupsSnap.val() as Record<string, Group>;
  const groupIds = Object.keys(groups);

  const shuffledOrder = [...groupIds].sort(() => 0.5 - Math.random());
  const updates: Record<string, any> = {};

  shuffledOrder.forEach((gId, idx) => {
    updates[`groups/${sessionId}/${gId}/presentationOrder`] = idx + 1;
  });

  updates[`sessions/${sessionId}/presentationOrder`] = shuffledOrder;
  updates[`sessions/${sessionId}/presentationIndex`] = 0;
  updates[`sessions/${sessionId}/currentPresentingTeamId`] = shuffledOrder[0];

  await update(ref(db), updates);
  await updateSessionUIState(sessionId, 'PRESENTATION_ORDER');

  console.log('[BMC PRESENTATION] Presentation order randomized:', shuffledOrder);
  return shuffledOrder;
}
