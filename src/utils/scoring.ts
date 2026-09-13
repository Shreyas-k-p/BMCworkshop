import { ScoreSubmission } from '../types';

export function calculateAverageScore(scoresMap: Record<string, ScoreSubmission> | null | undefined): number {
  if (!scoresMap) return 0;
  const submissions = Object.values(scoresMap);
  if (submissions.length === 0) return 0;

  const sum = submissions.reduce((acc, curr) => acc + curr.score, 0);
  const avg = sum / submissions.length;
  return Math.round(avg * 10) / 10;
}

export function isEligibleToScore(
  _evaluatorUid: string,
  evaluatorTeamId: string | null,
  presentingTeamId: string | null,
  isCaptain: boolean
): boolean {
  if (!isCaptain) return false;
  if (!evaluatorTeamId || !presentingTeamId) return false;
  return evaluatorTeamId !== presentingTeamId;
}
