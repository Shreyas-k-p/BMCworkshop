import React, { useState, useRef, useEffect } from 'react';
import { Session, Group, ScoreSubmission } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { TimerDisplay } from '../common/TimerDisplay';
import { Crown, CheckCircle2, Clock, ArrowRight, Trophy, Zap } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface Props {
  session: Session;
  groups: Record<string, Group>;
  scores: Record<string, Record<string, ScoreSubmission>>;
  onStartPresentationTimer: () => Promise<void>;
  onPausePresentationTimer: () => Promise<void>;
  onResetPresentationTimer: () => Promise<void>;
  onStartPitching?: () => Promise<void>;
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
  onStartPitching,
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

  // ── Sound: play once when all captains submit ─────────────────────────────
  const allSubmittedSoundRef = useRef<string>('');
  useEffect(() => {
    if (allSubmitted && allSubmittedSoundRef.current !== currentPresentingGroupId) {
      allSubmittedSoundRef.current = currentPresentingGroupId;
      soundEffects.playAllScoresIn();
    }
  }, [allSubmitted, currentPresentingGroupId]);

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
        soundEffects.playLeaderboardReveal();
        await onRevealLeaderboard();
      } else {
        soundEffects.playNextTeam();
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
            onClick={onStartPitching || onNextTeam}
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

                {group.businessIdea && (
                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-center space-y-0.5">
                    <span className="text-xs font-black text-cyan-400 uppercase block tracking-wider">
                      🚀 {group.businessIdea.businessName}
                    </span>
                    <span className="text-[11px] text-slate-300 line-clamp-2 italic">
                      "{group.businessIdea.description}"
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

            {currentGroup?.businessIdea && (
              <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 inline-block max-w-md w-full mx-auto space-y-1 text-left">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block">
                  BUSINESS NAME
                </span>
                <div className="text-2xl font-black text-white tracking-wide">
                  🚀 {currentGroup.businessIdea.businessName}
                </div>
                <div className="text-xs font-medium text-slate-300 italic pt-1 border-t border-slate-800/80 leading-relaxed">
                  "{currentGroup.businessIdea.description}"
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
                stageKey="presentation"
                presentationIndex={currentIndex}
              />
            </div>
          </GlassPanel>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <GlassPanel className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  {currentGroup ? `${currentGroup.groupName} — SCORING` : 'PEER SCORING'}
                </h3>
                <p className="text-xs text-slate-400">Only captains from other teams evaluate</p>
              </div>

              <div className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider ${
                allSubmitted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {allSubmitted ? '✓ ALL CAPTAINS SUBMITTED' : `${submissionCount} / ${totalEligibleCount} SUBMITTED`}
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                CAPTAIN SUBMISSION STATUS (PRIVATE):
              </span>

              {Object.values(groups).map((g) => {
                const isPresenting = g.id === currentPresentingGroupId;
                const hasSubmitted = Boolean(g.captainId && submittedCaptainUids.has(g.captainId));

                if (isPresenting) {
                  return (
                    <div
                      key={g.id}
                      className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 text-slate-400 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Crown className="w-4 h-4 text-slate-500 fill-current" />
                        <div>
                          <span className="font-bold text-slate-300 text-sm block">
                            {g.groupName}
                          </span>
                          <span className="text-xs text-slate-500">
                            {g.captainName || 'Captain'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        SELF SCORE NOT ALLOWED
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={g.id}
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
                          {g.groupName}
                        </span>
                        <span className="text-xs text-slate-400">
                          {g.captainName || 'Captain'}
                        </span>
                      </div>
                    </div>

                    {hasSubmitted ? (
                      <span className="flex items-center gap-1 font-black text-xs text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> ✓ SUBMITTED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-semibold text-xs text-amber-400 animate-pulse">
                        <Clock className="w-4 h-4" /> ⏳ PENDING
                      </span>
                    )}
                  </div>
                );
              })}
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
                disabled={loading || (!allSubmitted && !session.isDemoMode)}
                className="w-full py-4 px-6 rounded-xl font-black text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
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
                    NEXT TEAM ({nextGroup?.groupName || 'COMPLETE'})
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {!allSubmitted && !session.isDemoMode && (
                <p className="text-[11px] text-amber-400/80 text-center font-semibold">
                  Waiting for all {totalEligibleCount} eligible captains to submit scores.
                </p>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};
