import React, { useState, useEffect, useRef } from 'react';
import { Session, Group } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { TimerDisplay } from '../common/TimerDisplay';
import { Lightbulb, CheckCircle2, Clock, ArrowRight, Crown, Sparkles, Zap, Lock } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface Props {
  session: Session;
  groups: Record<string, Group>;
  onStartTimer: () => Promise<void>;
  onPauseTimer: () => Promise<void>;
  onResetTimer: () => Promise<void>;
  onStartBmcPreparation: () => Promise<void>;
  onSimulateDemoIdeas?: () => Promise<void>;
}

export const HostBusinessIdeaStage: React.FC<Props> = ({
  session,
  groups,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onStartBmcPreparation,
  onSimulateDemoIdeas
}) => {
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const groupList = Object.values(groups).sort((a, b) => a.groupNumber - b.groupNumber);
  const totalTeams = groupList.length;
  const submittedCount = groupList.filter(g => Boolean(g.businessIdea && g.businessIdea.locked)).length;
  const allSubmitted = totalTeams > 0 && submittedCount >= totalTeams;

  // Sound: chime when a new idea gets submitted
  const prevSubmittedCountRef = useRef(submittedCount);
  useEffect(() => {
    if (submittedCount > prevSubmittedCountRef.current) {
      soundEffects.playBusinessIdeaSubmitted();
    }
    prevSubmittedCountRef.current = submittedCount;
  }, [submittedCount]);

  const handleStartBmc = async () => {
    setLoading(true);
    soundEffects.playClick();
    try {
      await onStartBmcPreparation();
      soundEffects.playGo();
    } catch (err) {
      console.error('[HostBusinessIdeaStage] Error starting BMC prep:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    if (!onSimulateDemoIdeas) return;
    setSimulating(true);
    try {
      await onSimulateDemoIdeas();
    } catch (err) {
      console.error('[HostBusinessIdeaStage] Error simulating demo ideas:', err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" /> STAGE 4: BUSINESS IDEA CHALLENGE
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            CREATE YOUR BUSINESS IDEA
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            "Create the most ridiculous business idea you can think of — then make it sound like a real business."
          </p>
        </div>

        <button
          onClick={handleStartBmc}
          disabled={loading || !allSubmitted}
          className="py-3.5 px-8 rounded-xl font-extrabold text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 shrink-0"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              START BMC PREPARATION (15 MIN)
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* Grid: Timer + Submission Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): 5-Minute Timer Display */}
        <div className="lg:col-span-5 space-y-6">
          <GlassPanel glow className="p-8 text-center space-y-6">
            <TimerDisplay
              timerState={session.businessIdea}
              label="5-MINUTE BUSINESS IDEA CHALLENGE"
              onStart={onStartTimer}
              onPause={onPauseTimer}
              onReset={onResetTimer}
              showControls={true}
              size="normal"
              stageKey="businessIdea"
            />

            {/* Instruction Callout Box */}
            <div className="p-4 rounded-2xl bg-navy-950/80 border border-slate-800 text-left space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Challenge Prompt
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Teams brainstorm together. Only the team <strong className="text-amber-400 font-bold">Captain</strong> can submit the official business name and short description.
              </p>
              <p className="text-slate-500 text-[11px]">
                Once submitted, ideas are permanently locked for the 15-minute BMC stage!
              </p>
            </div>

            {/* Demo Simulation Button */}
            {session.isDemoMode && onSimulateDemoIdeas && (
              <button
                onClick={handleSimulate}
                disabled={simulating || allSubmitted}
                className="w-full py-3 px-4 rounded-xl font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all flex items-center justify-center gap-2 text-xs"
              >
                {simulating ? (
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    AUTO-POPULATE DEMO BUSINESS IDEAS
                  </>
                )}
              </button>
            )}
          </GlassPanel>
        </div>

        {/* Right Column (7 cols): Live Business Idea Grid */}
        <div className="lg:col-span-7 space-y-6">
          <GlassPanel className="p-6 space-y-6">
            {/* Status Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  SUBMITTED BUSINESS IDEAS
                </h3>
                <p className="text-xs text-slate-400">Live feed of team submissions</p>
              </div>

              <div
                className={`px-4 py-2 rounded-xl font-black text-sm uppercase tracking-wider flex items-center gap-2 ${
                  allSubmitted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {allSubmitted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> ALL TEAMS HAVE SUBMITTED
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 animate-pulse" /> {submittedCount} / {totalTeams} TEAMS SUBMITTED
                  </>
                )}
              </div>
            </div>

            {/* Team Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {groupList.map((group) => {
                const idea = group.businessIdea;
                const isSubmitted = Boolean(idea && idea.locked);

                return (
                  <div
                    key={group.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isSubmitted
                        ? 'bg-navy-900/80 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                        : 'bg-navy-950/60 border-slate-800/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-black text-xs flex items-center justify-center">
                            #{group.groupNumber}
                          </span>
                          <span className="font-black text-white text-sm">
                            {group.groupName}
                          </span>
                        </div>

                        {group.captainName && (
                          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                            <Crown className="w-3 h-3 fill-current" /> {group.captainName}
                          </span>
                        )}
                      </div>

                      {isSubmitted ? (
                        <div className="pt-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-black text-cyan-400">
                            <span>🚀</span>
                            <span className="tracking-wide uppercase text-sm">{idea?.businessName}</span>
                          </div>
                          <p className="text-xs text-slate-300 italic leading-relaxed pl-5 border-l-2 border-cyan-500/30">
                            "{idea?.description}"
                          </p>
                        </div>
                      ) : (
                        <div className="py-6 text-center space-y-2">
                          <Clock className="w-6 h-6 text-amber-400/60 mx-auto animate-pulse" />
                          <p className="text-xs font-semibold text-slate-400">
                            ⏳ Waiting for captain submission...
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider">
                      {isSubmitted ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> IDEA LOCKED
                        </span>
                      ) : (
                        <span className="text-amber-400 animate-pulse">
                          BRAINSTORMING
                        </span>
                      )}
                      <span className="text-slate-500">
                        {Object.keys(group.members || {}).length} MEMBERS
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};
