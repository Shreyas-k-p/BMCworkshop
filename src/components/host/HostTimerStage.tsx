import React, { useState } from 'react';
import { Session, TimerState } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { TimerDisplay } from '../common/TimerDisplay';
import { ArrowRight, Maximize2, Minimize2 } from 'lucide-react';

interface Props {
  session: Session;
  stageType: 'PREPARATION' | 'STUDY_TIME';
  onStartTimer: () => Promise<void>;
  onPauseTimer: () => Promise<void>;
  onResetTimer: () => Promise<void>;
  onProceedToNext: () => Promise<void>;
}

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

  const title = isPrep ? '15-MINUTE BMC PREPARATION' : '10-MINUTE PRODUCT STUDY';
  const subtitle = isPrep
    ? 'Students are collaborating in teams to construct their Business Model Canvas.'
    : 'Teams are analyzing product market fit, target customer segments, and revenue models.';
  const nextLabel = isPrep ? 'PROCEED TO PRODUCT STUDY' : 'RANDOMIZE PITCH ORDER';

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
    <div className={`max-w-7xl mx-auto p-6 space-y-8 ${isFullScreen ? 'fixed inset-0 z-50 bg-navy-950 p-12 max-w-none flex flex-col justify-center' : ''}`}>
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            STAGE {isPrep ? '5' : '6'}: {stageType}
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

      <GlassPanel glow className="p-12 text-center space-y-8 max-w-4xl mx-auto">
        <TimerDisplay
          timerState={timerState}
          label={title}
          onStart={onStartTimer}
          onPause={onPauseTimer}
          onReset={onResetTimer}
          showControls={true}
          size="projector"
          stageKey={isPrep ? 'preparation' : 'study'}
        />

        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-center gap-6">
          <span className="text-slate-400 font-semibold text-sm">
            NEXT UP: <span className="text-white font-bold">{isPrep ? 'Product Study Timer' : 'Pitch Order & Peer Scoring'}</span>
          </span>
        </div>
      </GlassPanel>
    </div>
  );
};
