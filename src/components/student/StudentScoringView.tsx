import React, { useState } from 'react';
import { Group, Participant, Session, ScoreSubmission } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { TimerDisplay } from '../common/TimerDisplay';
import { Crown, CheckCircle2, Clock, Send, ShieldAlert, ListOrdered } from 'lucide-react';
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
  const isPresentationStageActive = session.uiState === 'PRESENTATION' || session.uiState === 'SCORING';

  // Current presenting team is ONLY defined and valid when in PRESENTATION or SCORING
  const currentPresentingGroupId = isPresentationStageActive
    ? (presentationOrder[currentIndex] || session.currentPresentingTeamId)
    : null;

  const presentingGroup = currentPresentingGroupId ? groups[currentPresentingGroupId] : null;

  const myGroupId = currentParticipant.groupId;
  const isCaptain = Boolean(currentParticipant.isCaptain);

  // STRICT TIMING & PERMISSION: Eligible to score ONLY when presentation is active,
  // presenting group is known, user is captain, and user's team != presenting team.
  const eligible = isPresentationStageActive && isEligibleToScore(
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

  // ───────────────────────────────────────────────────────────────────────────
  // STAGE 7: PRESENTATION ORDER (Before presentations start — NO scoring entry)
  // ───────────────────────────────────────────────────────────────────────────
  if (session.uiState === 'PRESENTATION_ORDER') {
    return (
      <div className="min-h-screen bg-navy-950 p-4 pb-12 space-y-6 max-w-lg mx-auto flex flex-col justify-center">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
            STAGE: PITCH ORDER
          </span>
          <h1 className="text-2xl font-black text-white">RANDOMIZED PITCH ORDER</h1>
          <p className="text-xs text-slate-400">
            Pitches will begin shortly. The host will start Team 1.
          </p>
        </div>

        <GlassPanel className="p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <ListOrdered className="w-4 h-4" />
            PRESENTATION QUEUE
          </div>

          <div className="space-y-2.5">
            {presentationOrder.map((gId, idx) => {
              const g = groups[gId];
              if (!g) return null;
              const isMyTeam = g.id === myGroupId;
              return (
                <div
                  key={gId}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isMyTeam
                      ? 'bg-cyan-500/10 border-cyan-400/40 text-white'
                      : 'bg-navy-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 font-black text-xs text-cyan-400 flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-black flex items-center gap-1.5">
                        {g.groupName}
                        {isMyTeam && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[9px] font-bold uppercase">
                            YOUR TEAM
                          </span>
                        )}
                      </div>
                      {g.businessIdea && (
                        <div className="text-[10px] text-cyan-400 font-bold">
                          🚀 {g.businessIdea.businessName}
                        </div>
                      )}
                    </div>
                  </div>

                  {g.captainName && (
                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <Crown className="w-3 h-3 fill-current" /> {g.captainName}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Score entry will open when each team begins pitching.</span>
          </div>
        </GlassPanel>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STAGE 8 & 9: LIVE PRESENTATION & SCORING
  // ───────────────────────────────────────────────────────────────────────────
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
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              NOW PITCHING ({currentIndex + 1} OF {presentationOrder.length})
            </span>
          </div>
          <h2 className="text-3xl font-black text-white">{presentingGroup.groupName}</h2>

          {presentingGroup.captainName && (
            <p className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-current" /> Captain: {presentingGroup.captainName}
            </p>
          )}

          {presentingGroup.businessIdea && (
            <div className="p-3.5 rounded-xl bg-navy-950 border border-cyan-500/40 text-left space-y-1">
              <span className="text-[9px] uppercase font-bold text-cyan-400 tracking-wider block">
                BUSINESS NAME & PITCH CONCEPT
              </span>
              <div className="text-base font-black text-white uppercase">
                🚀 {presentingGroup.businessIdea.businessName}
              </div>
              <div className="text-xs text-slate-300 italic leading-relaxed pt-1 border-t border-slate-800">
                "{presentingGroup.businessIdea.description}"
              </div>
            </div>
          )}

          <div className="pt-2">
            <TimerDisplay
              timerState={session.presentation}
              label="3-MINUTE PITCH TIMER"
              size="normal"
              stageKey="presentation"
              presentationIndex={currentIndex}
            />
          </div>
        </GlassPanel>
      )}

      {/* Scoring Section: STRICTLY only for eligible captains of OTHER teams */}
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
        /* Status/Waiting Panel for non-evaluators */
        <GlassPanel className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
            {myGroupId === currentPresentingGroupId ? (
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            ) : (
              <Clock className="w-6 h-6 animate-pulse text-cyan-400" />
            )}
          </div>

          <h3 className="text-xl font-black text-white">
            {myGroupId === currentPresentingGroupId
              ? "YOUR TEAM IS PRESENTING"
              : "PRESENTATION IN PROGRESS"}
          </h3>

          <div className="inline-block px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-bold text-amber-300">
            {myGroupId === currentPresentingGroupId
              ? "Waiting — You cannot score your own team"
              : isCaptain
              ? "Waiting for your scoring turn"
              : "Waiting — Only captains evaluate pitches"}
          </div>

          <p className="text-slate-400 text-xs max-w-xs mx-auto">
            {myGroupId === currentPresentingGroupId
              ? "Captains from other teams are currently evaluating your pitch!"
              : "Other team captains are submitting confidential peer scores for this pitch."}
          </p>
        </GlassPanel>
      )}
    </div>
  );
};
