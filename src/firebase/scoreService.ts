import { ref, get, set, update } from 'firebase/database';
import { db, auth } from './config';
import { ScoreSubmission, Group, Participant, Session } from '../types';
import { calculateAverageScore } from '../utils/scoring';
import { updateSessionUIState } from './sessionService';

export async function submitScore(
  sessionId: string,
  presentingTeamId: string,
  evaluatorUid: string,
  evaluatorTeamId: string,
  score: number
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to submit score.');
  }

  if (currentUser.uid !== evaluatorUid) {
    throw new Error('Unauthorized: Evaluator UID does not match authenticated user.');
  }

  if (typeof score !== 'number' || isNaN(score) || score < 0 || score > 10) {
    throw new Error('Score must be a valid number between 0 and 10.');
  }

  if (evaluatorTeamId === presentingTeamId) {
    throw new Error('Captains cannot score their own team.');
  }

  // 1. Verify active presentation stage and matching presenting team
  const sessionSnap = await get(ref(db, `sessions/${sessionId}`));
  if (!sessionSnap.exists()) {
    throw new Error('Session does not exist.');
  }
  const sessionData = sessionSnap.val() as Session;
  if (!sessionData.hasActiveSession) {
    throw new Error('Session is no longer active.');
  }
  if (sessionData.uiState !== 'PRESENTATION' && sessionData.uiState !== 'SCORING') {
    throw new Error('Score submission is only permitted during that team\'s active presentation.');
  }

  const order = sessionData.presentationOrder || [];
  const currentActiveTeamId = order[sessionData.presentationIndex || 0] || sessionData.currentPresentingTeamId;
  if (currentActiveTeamId !== presentingTeamId) {
    throw new Error('Can only score the team currently presenting.');
  }

  // 2. Verify evaluator is a verified captain in this session and not scoring own team
  const participantSnap = await get(ref(db, `participants/${sessionId}/${evaluatorUid}`));
  if (!participantSnap.exists()) {
    throw new Error('Participant record not found for this session.');
  }
  const participant = participantSnap.val() as Participant;
  if (!participant.isCaptain) {
    throw new Error('Only designated team captains are permitted to submit peer scores.');
  }
  if (participant.groupId === presentingTeamId) {
    throw new Error('Captains cannot score their own team.');
  }

  // 3. Verify evaluator hasn't already submitted a score for this presenting team
  const scoreRef = ref(db, `scores/${sessionId}/${presentingTeamId}/${evaluatorUid}`);
  const snap = await get(scoreRef);
  if (snap.exists()) {
    throw new Error('You have already submitted a score for this team.');
  }

  const submission: ScoreSubmission = {
    evaluatorUid,
    evaluatorTeamId: participant.groupId || evaluatorTeamId,
    presentingTeamId,
    score: Math.round(score * 10) / 10,
    submittedAt: Date.now()
  };

  await set(scoreRef, submission);
  console.log('[BMC SCORE] Submitted score:', submission.score, 'by captain', evaluatorUid, 'for team', presentingTeamId);
}

export async function simulateDemoCaptainScores(sessionId: string, presentingTeamId: string): Promise<void> {
  const groupsSnap = await get(ref(db, `groups/${sessionId}`));
  if (!groupsSnap.exists()) return;

  const groups = groupsSnap.val() as Record<string, Group>;
  const eligibleGroups = Object.values(groups).filter(g => g.id !== presentingTeamId && g.captainId);

  const updates: Record<string, any> = {};
  const now = Date.now();

  eligibleGroups.forEach(g => {
    if (g.captainId) {
      const score = Math.floor(Math.random() * 4) + 7;
      const scorePath = `scores/${sessionId}/${presentingTeamId}/${g.captainId}`;
      updates[scorePath] = {
        evaluatorUid: g.captainId,
        evaluatorTeamId: g.id,
        presentingTeamId,
        score,
        submittedAt: now
      };
    }
  });

  await update(ref(db), updates);
  console.log('[BMC SCORE] Simulated demo captain scores for presenting team:', presentingTeamId);
}

export async function calculateAndRevealLeaderboard(sessionId: string): Promise<void> {
  const groupsSnap = await get(ref(db, `groups/${sessionId}`));
  const scoresSnap = await get(ref(db, `scores/${sessionId}`));

  if (!groupsSnap.exists()) {
    throw new Error('No groups found for leaderboard.');
  }

  const groups = groupsSnap.val() as Record<string, Group>;
  const allScores = scoresSnap.val() as Record<string, Record<string, ScoreSubmission>> || {};

  const updates: Record<string, any> = {};

  Object.values(groups).forEach(g => {
    const teamScoresMap = allScores[g.id] || {};
    const avg = calculateAverageScore(teamScoresMap);
    updates[`groups/${sessionId}/${g.id}/finalScore`] = avg;
  });

  updates[`sessions/${sessionId}/leaderboardRevealed`] = true;

  await update(ref(db), updates);
  await updateSessionUIState(sessionId, 'LEADERBOARD');

  console.log('[BMC LEADERBOARD] Revealed final leaderboard scores');
}
