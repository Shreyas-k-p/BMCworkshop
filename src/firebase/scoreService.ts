import { ref, get, set, update } from 'firebase/database';
import { db } from './config';
import { ScoreSubmission, Group } from '../types';
import { calculateAverageScore } from '../utils/scoring';
import { updateSessionUIState } from './sessionService';

export async function submitScore(
  sessionId: string,
  presentingTeamId: string,
  evaluatorUid: string,
  evaluatorTeamId: string,
  score: number
): Promise<void> {
  if (score < 0 || score > 10) {
    throw new Error('Score must be between 0 and 10.');
  }

  if (evaluatorTeamId === presentingTeamId) {
    throw new Error('Captains cannot score their own team.');
  }

  const scoreRef = ref(db, `scores/${sessionId}/${presentingTeamId}/${evaluatorUid}`);
  const snap = await get(scoreRef);
  if (snap.exists()) {
    throw new Error('You have already submitted a score for this team.');
  }

  const submission: ScoreSubmission = {
    evaluatorUid,
    evaluatorTeamId,
    presentingTeamId,
    score: Math.round(score * 10) / 10,
    submittedAt: Date.now()
  };

  await set(scoreRef, submission);
  console.log('[BMC SCORE] Submitted score:', score, 'by', evaluatorUid, 'for team', presentingTeamId);
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
