import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerState } from '../../types';
import { useTimer } from '../../hooks/useTimer';
import { useTimerSounds } from '../../hooks/useTimerSounds';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface Props {
  timerState: TimerState | undefined | null;
  label?: string;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  showControls?: boolean;
  size?: 'normal' | 'projector';
  /** Sound stage key: 'preparation' | 'study' | 'presentation'. Omit to disable sounds. */
  stageKey?: string;
  /** Current presentation index (for presentation timer deduplication). */
  presentationIndex?: number;
}

export const TimerDisplay: React.FC<Props> = ({
  timerState,
  label,
  onStart,
  onPause,
  onReset,
  showControls = false,
  size = 'projector',
  stageKey,
  presentationIndex = 0,
}) => {
  const { remaining, formatted, isRunning, isPaused, isTimeUp } = useTimer(timerState);

  // Fire timer milestone sounds (deduplication handled inside the hook)
  useTimerSounds(stageKey ? timerState : null, stageKey ?? '', presentationIndex);

  const isLowTime = remaining > 0 && remaining <= 60;
  const isCriticalTime = remaining > 0 && remaining <= 10;

  return (
    <div className="flex flex-col items-center justify-center text-center select-none">
      {label && (
        <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
          {label}
        </span>
      )}

      {/* Main Timer Display */}
      <div className="relative flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isCriticalTime ? (
            <motion.div
              key={remaining}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-8xl md:text-9xl font-black text-rose-500 tracking-tighter drop-shadow-[0_0_35px_rgba(244,63,94,0.6)]"
            >
              {remaining}
            </motion.div>
          ) : isTimeUp ? (
            <motion.div
              key="times-up"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl md:text-8xl font-black text-rose-400 tracking-tight drop-shadow-[0_0_30px_rgba(244,63,94,0.5)]"
            >
              TIME'S UP
            </motion.div>
          ) : (
            <div
              className={`font-black tracking-tight tabular-nums transition-colors duration-500 ${
                size === 'projector' ? 'text-7xl md:text-9xl' : 'text-5xl md:text-7xl'
              } ${
                isLowTime
                  ? 'text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.5)]'
                  : isRunning
                  ? 'text-cyan-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                  : 'text-slate-300'
              }`}
            >
              {formatted}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Warning banner */}
      {isLowTime && !isCriticalTime && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm tracking-wider uppercase animate-pulse"
        >
          ⚡ 1 MINUTE LEFT
        </motion.div>
      )}

      {/* Status indicator */}
      <div className="mt-2 text-sm font-semibold tracking-wider uppercase flex items-center gap-2 text-slate-400">
        {isRunning && (
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            RUNNING
          </span>
        )}
        {isPaused && (
          <span className="text-amber-400">PAUSED</span>
        )}
        {!isRunning && !isPaused && !isTimeUp && (
          <span className="text-slate-500">READY</span>
        )}
      </div>

      {/* Host Control Buttons */}
      {showControls && (
        <div className="flex items-center gap-3 mt-6">
          {!isRunning ? (
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-navy-950 shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              {isPaused ? 'RESUME' : 'START TIMER'}
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-navy-950 shadow-lg shadow-amber-500/30 transition-all transform hover:scale-105 active:scale-95"
            >
              <Pause className="w-5 h-5 fill-current" />
              PAUSE TIMER
            </button>
          )}

          {onReset && (
            <button
              onClick={onReset}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
