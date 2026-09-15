import React, { useState } from 'react';
import { Session, UIState } from '../../types';
import { LogOut, RotateCcw, ChevronRight, Users, Radio, Volume2, VolumeX } from 'lucide-react';
import { useSoundToggle } from '../../hooks/useSoundToggle';

interface Props {
  session: Session;
  participantCount: number;
  onNextStage?: () => void;
  onEndSession: () => void;
  onRestartSession: () => void;
  nextButtonLabel?: string;
  nextButtonDisabled?: boolean;
}

const STAGE_META: Record<UIState, { title: string; current: string; next: string }> = {
  NO_SESSION: { title: 'No Session', current: 'Create session to begin', next: 'Join screen' },
  JOINING: { title: '1. Student Join & Lobby', current: 'Students scanning QR and joining', next: 'Balanced Team Formation' },
  GROUPING: { title: '2. Team Formation', current: 'Creating balanced teams', next: 'Captain Selection' },
  GROUPS_READY: { title: '2. Teams Formed', current: 'Teams ready', next: 'Select 1 Captain per Team' },
  CAPTAIN_SELECTION: { title: '3. Captain Selection', current: 'Selecting team captains', next: 'Business Idea Challenge' },
  BUSINESS_IDEA: { title: '4. Business Idea', current: '5-Minute Business Idea Challenge', next: '15-Min BMC Preparation' },
  PREPARATION: { title: '5. BMC Preparation', current: '15-Minute BMC Preparation', next: '5-Min Study & Prepare' },
  STUDY_TIME: { title: '6. Study & Prepare', current: '5-Minute Study & Pitch Preparation', next: 'Presentation Order' },
  PRESENTATION_ORDER: { title: '7. Pitch Order', current: 'Presentation order randomized', next: 'Start Team Presentations' },
  PRESENTATION: { title: '8. Team Pitching', current: 'Team presentation in progress', next: 'Peer Captain Scoring' },
  SCORING: { title: '9. Peer Scoring', current: 'Other captains submitting scores', next: 'Next Team Pitch or Leaderboard' },
  LEADERBOARD: { title: '10. Final Leaderboard', current: 'Winner celebration and results', next: 'End Session' },
  COMPLETED: { title: 'Ended', current: 'Competition finished', next: 'Create New Session' }
};

export const HostControlBar: React.FC<Props> = ({
  session,
  participantCount,
  onNextStage,
  onEndSession,
  onRestartSession,
  nextButtonLabel,
  nextButtonDisabled = false
}) => {
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [showConfirmRestart, setShowConfirmRestart] = useState(false);
  const [soundEnabled, toggleSound] = useSoundToggle();

  const meta = STAGE_META[session.uiState] || {
    title: session.uiState,
    current: 'Active session',
    next: 'Next stage'
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-navy-950/80 border-b border-slate-800/80 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-black text-xl tracking-tight text-white">
              BMC <span className="text-cyan-400">LIVE</span>
            </span>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-navy-900 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm">
            <Radio className="w-4 h-4 text-cyan-400 animate-ping" />
            CODE: <span className="text-white text-base tracking-widest">{session.code}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-navy-900 border border-slate-800 text-slate-300 font-semibold text-sm">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{participantCount} {participantCount === 1 ? 'STUDENT' : 'STUDENTS'}</span>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-center text-center">
          <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
            STAGE: {meta.title}
          </span>
          <span className="text-xs font-semibold text-slate-300">
            NOW: {meta.current}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
              soundEnabled
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-700'
            }`}
            title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Sound ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Sound OFF</span>
              </>
            )}
          </button>
          {onNextStage && nextButtonLabel && (
            <button
              onClick={onNextStage}
              disabled={nextButtonDisabled}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-extrabold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {nextButtonLabel}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {showConfirmRestart ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 p-1 rounded-xl">
              <span className="text-xs font-semibold text-amber-300 px-2">Restart?</span>
              <button
                onClick={() => {
                  setShowConfirmRestart(false);
                  onRestartSession();
                }}
                className="px-2 py-1 rounded-lg bg-amber-500 text-navy-950 font-bold text-xs hover:bg-amber-400"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmRestart(false)}
                className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmRestart(true)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 transition-all"
              title="Restart Session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {showConfirmEnd ? (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 p-1 rounded-xl">
              <span className="text-xs font-semibold text-rose-300 px-2">End Session?</span>
              <button
                onClick={() => {
                  setShowConfirmEnd(false);
                  onEndSession();
                }}
                className="px-2 py-1 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-400"
              >
                Yes, End
              </button>
              <button
                onClick={() => setShowConfirmEnd(false)}
                className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmEnd(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-400 border border-slate-700/80 text-slate-400 transition-all font-semibold text-xs"
              title="End Session"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">END SESSION</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
