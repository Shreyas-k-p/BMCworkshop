import React, { useState } from 'react';
import { Group, Participant, Session, ScoreSubmission } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { Crown, CheckCircle2, Clock, Send } from 'lucide-react';
import { isEligibleToScore } from '../../utils/scoring';

interface Props {
  session: Session;
  groups: Record<string, Group>;
  scores: Record<string, Record<string, ScoreSubmission>>;
  currentParticipant: Participant;
  onSubmitScore: (presentingTeamId: string, score: number) => Promise<void>;
}

export const StudentScoringView: React.FC<Props> = ({
  session,
  groups,
  scores,
  currentParticipant,
  onSubmitScore
}) => {
  const [selectedScore, setSelectedScore] = useState<number>(8);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presentationOrder = session.presentationOrder || Object.keys(groups);
  const currentIndex = session.presentationIndex || 0;
  const currentPresentingGroupId = presentationOrder[currentIndex] || session.currentPresentingTeamId;
  const presentingGroup = currentPresentingGroupId ? groups[currentPresentingGroupId] : null;

  const myGroupId = currentParticipant.groupId;
  const isCaptain = Boolean(currentParticipant.isCaptain);

  const eligible = isEligibleToScore(
    currentParticipant.uid,
    myGroupId,
    currentPresentingGroupId,
    isCaptain
  );

  const currentTeamScores = currentPresentingGroupId ? scores[currentPresentingGroupId] || {} : {};
  const existingSubmission = currentTeamScores[currentParticipant.uid];
  const hasSubmitted = Boolean(existingSubmission);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligible || !currentPresentingGroupId || hasSubmitted) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmitScore(currentPresentingGroupId, selectedScore);
    } catch (err: any) {
      console.error('[StudentScoringView] Submit error:', err);
      setError(err.message || 'Score submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 p-4 pb-12 space-y-6 max-w-lg mx-auto flex flex-col justify-center">
      <div className="text-center space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
          STAGE: PITCH PRESENTATIONS
        </span>
        <h1 className="text-2xl font-black text-white">LIVE PITCH STAGE</h1>
      </div>

      {presentingGroup && (
        <GlassPanel glow className="p-6 text-center space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            NOW PITCHING
          </span>
          <h2 className="text-3xl font-black text-white">{presentingGroup.groupName}</h2>

          {presentingGroup.product && (
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 space-y-0.5">
              <div className="text-lg font-black text-cyan-400 uppercase">
                {presentingGroup.product.name}
              </div>
              <div className="text-xs font-bold text-slate-300 uppercase">
                {presentingGroup.product.company}
              </div>
            </div>
          )}
        </GlassPanel>
      )}

      {eligible ? (
        <GlassPanel className="p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400 fill-current" />
              <h3 className="text-lg font-extrabold text-white">CAPTAIN PEER EVALUATION</h3>
            </div>
            <span className="text-xs font-bold text-amber-400">SCORE: 0–10</span>
          </div>

          {hasSubmitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-white">SCORE SUBMITTED</h4>
              <p className="text-slate-400 text-xs">
                You rated <strong className="text-white">{presentingGroup?.groupName}</strong>: {' '}
                <span className="text-cyan-400 font-extrabold text-lg">{existingSubmission.score} / 10</span>
              </p>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider pt-2">
                Waiting for host to proceed to next team.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                  {error}
                </div>
              )}

              <div className="space-y-3 text-center">
                <span className="text-xs font-extrabold text-slate-300 uppercase block">
                  SELECT RATING (0 TO 10):
                </span>
                
                <div className="text-5xl font-black text-cyan-400 tracking-tight">
                  {selectedScore} <span className="text-sm text-slate-400 font-normal">/ 10</span>
                </div>

                <div className="grid grid-cols-6 gap-2 pt-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setSelectedScore(num)}
                      className={`py-3 rounded-xl font-black text-sm transition-all border ${
                        selectedScore === num
                          ? 'bg-cyan-500 text-navy-950 border-cyan-400 shadow-lg shadow-cyan-500/30 scale-105'
                          : 'bg-navy-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-xl font-black text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-xl shadow-cyan-500/25 transition-all transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    SUBMIT CONFIDENTIAL SCORE
                  </>
                )}
              </button>
            </form>
          )}
        </GlassPanel>
      ) : (
        <GlassPanel className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>

          <h3 className="text-xl font-black text-white">
            {myGroupId === currentPresentingGroupId
              ? "YOUR TEAM IS PRESENTING"
              : "WAITING FOR NEXT PRESENTATION"}
          </h3>

          <p className="text-slate-400 text-xs">
            {myGroupId === currentPresentingGroupId
              ? "Captains from other teams are currently evaluating your pitch!"
              : "Other team captains are submitting confidential peer scores."}
          </p>
        </GlassPanel>
      )}
    </div>
  );
};
