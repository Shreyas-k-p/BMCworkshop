import React, { useState } from 'react';
import { Session, TimerState } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { TimerDisplay } from '../common/TimerDisplay';
import { ArrowRight, Maximize2, Minimize2, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

interface Props {
  session: Session;
  stageType: 'PREPARATION' | 'STUDY_TIME';
  onStartTimer: () => Promise<void>;
  onPauseTimer: () => Promise<void>;
  onResetTimer: () => Promise<void>;
  onProceedToNext: () => Promise<void>;
}

const BMC_9_BLOCKS = [
  { num: 1, title: 'Customer Segments', desc: 'Who are your most important users & paying customers?' },
  { num: 2, title: 'Value Propositions', desc: 'What unique problem are you solving or value delivering?' },
  { num: 3, title: 'Channels', desc: 'How do you reach, market, and deliver to customers?' },
  { num: 4, title: 'Customer Relationships', desc: 'How do you acquire, retain, and grow users?' },
  { num: 5, title: 'Revenue Streams', desc: 'How does the business make money? Pricing model?' },
  { num: 6, title: 'Key Resources', desc: 'What key assets (tech, talent, IP) are required?' },
  { num: 7, title: 'Key Activities', desc: 'What critical actions must the company perform daily?' },
  { num: 8, title: 'Key Partnerships', desc: 'Who are essential partners and suppliers?' },
  { num: 9, title: 'Cost Structure', desc: 'What are the major costs to operate this business?' }
];

const STUDY_CHECKLIST = [
  'Understand all 9 blocks of your team\'s Business Model Canvas',
  'Decide clearly who in your team will explain which BMC part',
  'Prepare a confident 3-minute pitch highlighting unfair advantages',
  'Identify core business strengths & defensibility',
  'Anticipate tough peer questions from competing team captains'
];

export const HostTimerStage: React.FC<Props> = ({
  session,
  stageType,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onProceedToNext
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPrep = stageType === 'PREPARATION';
  const timerState: TimerState = isPrep ? session.preparation : session.study;

  const title = isPrep ? '15-MINUTE BMC PREPARATION' : '5-MINUTE STUDY & PREPARE';
  const subtitle = isPrep
    ? '🧩 BUILD YOUR BUSINESS MODEL — Teams construct the complete 9-block Business Model Canvas around their submitted idea.'
    : '📚 STUDY & PREPARE — Final 5 minutes to align your pitch, assign sections, and prepare for peer evaluation.';
  const nextLabel = isPrep ? 'PROCEED TO STUDY & PREPARE' : 'RANDOMIZE PITCH ORDER';

  const handleNext = async () => {
    setLoading(true);
    try {
      await onProceedToNext();
    } catch (err) {
      console.error('[HostTimerStage] Error proceeding:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-8 ${isFullScreen ? 'fixed inset-0 z-50 bg-navy-950 p-8 max-w-none overflow-y-auto flex flex-col justify-center' : ''}`}>
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            STAGE {isPrep ? '5' : '6'}: {stageType === 'PREPARATION' ? 'BMC PREPARATION (15 MIN)' : 'STUDY & PREPARATION (5 MIN)'}
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <button
            onClick={handleNext}
            disabled={loading}
            className="py-3.5 px-6 rounded-xl font-extrabold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-xl shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {nextLabel}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <GlassPanel glow className="p-8 text-center space-y-6 max-w-4xl mx-auto">
        <TimerDisplay
          timerState={timerState}
          label={isPrep ? '15:00 — BUILD YOUR BUSINESS MODEL' : '05:00 — STUDY & PREPARE'}
          onStart={onStartTimer}
          onPause={onPauseTimer}
          onReset={onResetTimer}
          showControls={true}
          size="projector"
          stageKey={isPrep ? 'preparation' : 'study'}
        />

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-6">
          <span className="text-slate-400 font-semibold text-sm">
            NEXT UP: <span className="text-white font-bold">{isPrep ? '5-Minute Study & Pitch Prep' : 'Pitch Order & Peer Scoring'}</span>
          </span>
        </div>
      </GlassPanel>

      {/* Guide Cards on Projection Display */}
      {isPrep ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs uppercase tracking-widest">
            <Layers className="w-4 h-4" /> The 9 Business Model Canvas Blocks
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BMC_9_BLOCKS.map((block) => (
              <div
                key={block.num}
                className="p-3.5 rounded-xl bg-navy-900/60 border border-slate-800 space-y-1 text-left hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-black text-xs flex items-center justify-center">
                    {block.num}
                  </span>
                  <span className="font-extrabold text-white text-sm">
                    {block.title}
                  </span>
                </div>
                <p className="text-slate-400 text-xs pl-8">
                  {block.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4 text-left">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-widest">
            <BookOpen className="w-4 h-4" /> Study & Pitch Preparation Goals
          </div>
          <div className="space-y-2.5">
            {STUDY_CHECKLIST.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-navy-900/60 border border-slate-800 flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-slate-200 text-sm font-semibold">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
