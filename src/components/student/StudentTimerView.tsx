import React from 'react';
import { Group, Participant, Session, TimerState } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { TimerDisplay } from '../common/TimerDisplay';
import { Crown, Layers, BookOpen, CheckCircle2, Lightbulb } from 'lucide-react';

interface Props {
  session: Session;
  myGroup: Group | undefined;
  currentParticipant: Participant;
}

const BMC_BLOCKS_BRIEF = [
  '1. Customer Segments',
  '2. Value Propositions',
  '3. Channels',
  '4. Customer Relationships',
  '5. Revenue Streams',
  '6. Key Resources',
  '7. Key Activities',
  '8. Key Partnerships',
  '9. Cost Structure'
];

const STUDY_TIPS = [
  'Understand all 9 blocks of your team\'s BMC',
  'Decide who in your team explains which part',
  'Prepare your 3-minute pitch highlight',
  'Identify core strengths of your business',
  'Prepare for possible questions from competing captains'
];

export const StudentTimerView: React.FC<Props> = ({
  session,
  myGroup,
  currentParticipant
}) => {
  const isPrep = session.uiState === 'PREPARATION';
  const timerState: TimerState = isPrep ? session.preparation : session.study;
  const idea = myGroup?.businessIdea;

  return (
    <div className="min-h-screen bg-navy-950 p-4 pb-12 space-y-6 max-w-lg mx-auto flex flex-col justify-center">
      <div className="text-center space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
          STAGE: {isPrep ? '15-MIN BMC PREPARATION' : '5-MIN STUDY & PREPARE'}
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight">
          {isPrep ? '🧩 BUILD YOUR BUSINESS MODEL' : '📚 STUDY & PREPARE'}
        </h1>
        <p className="text-slate-400 text-xs">
          {myGroup?.groupName || 'Your Team'}
        </p>
      </div>

      <GlassPanel glow className="p-5 text-center space-y-3">
        <TimerDisplay
          timerState={timerState}
          label={isPrep ? '15:00 — BMC PREPARATION' : '05:00 — STUDY & PREPARE'}
          size="normal"
        />
      </GlassPanel>

      {/* Team Info & Submitted Business Idea */}
      {myGroup && (
        <GlassPanel className="p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-lg font-black text-white">{myGroup.groupName}</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">
              YOUR TEAM
            </span>
          </div>

          {idea ? (
            <div className="p-3.5 rounded-xl bg-navy-950 border border-cyan-500/40 space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-black uppercase tracking-wider">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> YOUR SUBMITTED BUSINESS
              </div>
              <div className="text-base font-black text-white uppercase">
                🚀 {idea.businessName}
              </div>
              <div className="text-xs text-slate-300 italic leading-relaxed pt-1 border-t border-slate-800/80">
                "{idea.description}"
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-xs text-slate-400 text-center">
              Awaiting business idea confirmation...
            </div>
          )}

          {currentParticipant.isCaptain && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 fill-current" /> YOU ARE TEAM CAPTAIN (PEER SCORER)
            </div>
          )}
        </GlassPanel>
      )}

      {/* 9 Blocks Checklist or Study Tips */}
      <GlassPanel className="p-5 space-y-3 text-left">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider pb-2 border-b border-slate-800">
          {isPrep ? (
            <>
              <Layers className="w-4 h-4" /> 9 CANVAS BLOCKS TO BUILD
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 text-amber-400" /> 5-MINUTE STUDY CHECKLIST
            </>
          )}
        </div>

        {isPrep ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {BMC_BLOCKS_BRIEF.map((block, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-navy-950/80 border border-slate-800 text-slate-200 font-semibold flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>{block}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            {STUDY_TIPS.map((tip, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-navy-950/80 border border-slate-800 flex items-center gap-2.5 text-slate-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>
    </div>
  );
};
