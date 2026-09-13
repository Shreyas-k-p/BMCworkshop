import React, { useState } from 'react';
import { Session, Group, ScoreSubmission } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { TimerDisplay } from '../common/TimerDisplay';
import { Crown, CheckCircle2, Clock, ArrowRight, Trophy, Zap } from 'lucide-react';

interface Props {
  session: Session;
  groups: Record<string, Group>;
  scores: Record<string, Record<string, ScoreSubmission>>;
  onStartPresentationTimer: () => Promise<void>;
  onPausePresentationTimer: () => Promise<void>;
  onResetPresentationTimer: () => Promise<void>;
  onNextTeam: () => Promise<void>;
  onRevealLeaderboard: () => Promise<void>;
  onSimulateDemoScores?: (presentingTeamId: string) => Promise<void>;
}

export const HostPresentation: React.FC<Props> = ({
  session,
  groups,
  scores,
  onStartPresentationTimer,
  onPausePresentationTimer,
  onResetPresentationTimer,
  onNextTeam,
  onRevealLeaderboard,
  onSimulateDemoScores
}) => {
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const presentationOrder = session.presentationOrder || Object.keys(groups);
  const currentIndex = session.presentationIndex || 0;
  const isLastTeam = currentIndex >= presentationOrder.length - 1;

  const currentPresentingGroupId = presentationOrder[currentIndex] || presentationOrder[0];
  const currentGroup = groups[currentPresentingGroupId];

  const nextGroupId = presentationOrder[currentIndex + 1];
  const nextGroup = nextGroupId ? groups[nextGroupId] : null;

  const eligibleCaptains = Object.values(groups).filter(
    g => g.id !== currentPresentingGroupId && g.captainId
  );

  const currentTeamScores = scores[currentPresentingGroupId] || {};
  const submittedCaptainUids = new Set(Object.keys(currentTeamScores));
  const submissionCount = eligibleCaptains.filter(c => submittedCaptainUids.has(c.captainId!)).length;
  const totalEligibleCount = eligibleCaptains.length;
  const allSubmitted = totalEligibleCount > 0 && submissionCount >= totalEligibleCount;

  const handleSimulate = async () => {
    if (!onSimulateDemoScores || !currentPresentingGroupId) return;
    setSimulating(true);
    try {
      await onSimulateDemoScores(currentPresentingGroupId);
    } catch (err) {
      console.error('[HostPresentation] Error simulating demo scores:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleAdvance = async () => {
    setLoading(true);
    try {
      if (isLastTeam) {
        await onRevealLeaderboard();
      } else {
        await onNextTeam();
      }
    } catch (err) {
      console.error('[HostPresentation] Error advancing team:', err);
    } finally {
      setLoading(false);
    }
  };

  if (session.uiState === 'PRESENTATION_ORDER') {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              STAGE 7: PRESENTATION ORDER
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              RANDOMIZED PITCH ORDER
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Teams will pitch in this exact order. Each team has 3 minutes.
            </p>
          </div>

          <button
            onClick={onNextTeam}
            className="py-3.5 px-8 rounded-xl font-extrabold text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-xl shadow-cyan-500/25 transition-all flex items-center gap-3"
          >
            START PITCHING (TEAM 1)
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {presentationOrder.map((gId, orderIdx) => {
            const group = groups[gId];
            if (!group) return null;
            return (
              <GlassPanel key={gId} glow={orderIdx === 0} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-black text-xl flex items-center justify-center">
                    #{orderIdx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    ORDER #{orderIdx + 1}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-white">{group.groupName}</h3>
                  {group.captainName && (
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 fill-current" /> {group.captainName}
                    </span>
                  )}
                </div>

                {group.product && (
                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-center">
                    <span className="text-xs font-extrabold text-cyan-400 uppercase block">
                      {group.product.name}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      {group.product.company}
                    </span>
                  </div>
                )}
              </GlassPanel>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <GlassPanel glow className="p-8 space-y-6 text-center">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs tracking-wider uppercase">
                PITCH {currentIndex + 1} OF {presentationOrder.length}
              </span>
              {nextGroup && (
                <span className="text-xs font-semibold text-slate-400">
                  NEXT: <strong className="text-slate-200">{nextGroup.groupName}</strong>
                </span>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                NOW PRESENTING
              </span>
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">
                {currentGroup?.groupName}
              </h2>
              {currentGroup?.captainName && (
                <p className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1">
                  <Crown className="w-4 h-4 fill-current" /> CAPTAIN: {currentGroup.captainName}
                </p>
              )}
            </div>

            {currentGroup?.product && (
              <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 inline-block max-w-sm w-full mx-auto space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  CASE PRODUCT
                </span>
                <div className="text-2xl font-black text-cyan-400 tracking-wide">
                  {currentGroup.product.name}
                </div>
                <div className="text-sm font-extrabold text-slate-300 uppercase">
                  {currentGroup.product.company}
                </div>
              </div>
            )}

            <div className="py-4">
              <TimerDisplay
                timerState={session.presentation}
                label="3-MINUTE PRESENTATION TIMER"
                onStart={onStartPresentationTimer}
                onPause={onPausePresentationTimer}
                onReset={onResetPresentationTimer}
                showControls={true}
                size="projector"
              />
            </div>
          </GlassPanel>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <GlassPanel className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  PEER SCORING
                </h3>
                <p className="text-xs text-slate-400">Only other team captains score</p>
              </div>

              <div className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider ${
                allSubmitted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {allSubmitted ? '✓ ALL SUBMITTED' : `${submissionCount} / ${totalEligibleCount} SUBMITTED`}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                CAPTAIN SUBMISSION STATUS (SCORES HIDDEN):
              </span>

              {eligibleCaptains.length === 0 ? (
                <p className="text-slate-500 text-sm">No eligible captain evaluators.</p>
              ) : (
                eligibleCaptains.map((cg) => {
                  const hasSubmitted = Boolean(cg.captainId && submittedCaptainUids.has(cg.captainId));

                  return (
                    <div
                      key={cg.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        hasSubmitted
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-navy-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Crown className={`w-4 h-4 fill-current ${hasSubmitted ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <div>
                          <span className="font-bold text-white text-sm block">
                            {cg.groupName}
                          </span>
                          <span className="text-xs text-slate-400">
                            {cg.captainName}
                          </span>
                        </div>
                      </div>

                      {hasSubmitted ? (
                        <span className="flex items-center gap-1 font-bold text-xs text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" /> SUBMITTED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-semibold text-xs text-amber-400 animate-pulse">
                          <Clock className="w-4 h-4" /> PENDING
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {session.isDemoMode && onSimulateDemoScores && (
              <button
                onClick={handleSimulate}
                disabled={simulating}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-2"
              >
                {simulating ? (
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    SIMULATE CAPTAIN SCORES (DEMO MODE)
                  </>
                )}
              </button>
            )}

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={handleAdvance}
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl font-black text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                ) : isLastTeam ? (
                  <>
                    <Trophy className="w-5 h-5" />
                    REVEAL FINAL LEADERBOARD
                  </>
                ) : (
                  <>
                    NEXT TEAM ({nextGroup?.groupName})
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};
