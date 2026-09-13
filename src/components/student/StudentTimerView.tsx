import React from 'react';
import { Group, Participant, Session, TimerState } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { TimerDisplay } from '../common/TimerDisplay';
import { Crown } from 'lucide-react';

interface Props {
  session: Session;
  myGroup: Group | undefined;
  currentParticipant: Participant;
}

export const StudentTimerView: React.FC<Props> = ({
  session,
  myGroup,
  currentParticipant
}) => {
  const isPrep = session.uiState === 'PREPARATION';
  const timerState: TimerState = isPrep ? session.preparation : session.study;

  const product = myGroup?.product;

  return (
    <div className="min-h-screen bg-navy-950 p-4 pb-12 space-y-6 max-w-lg mx-auto flex flex-col justify-center">
      <div className="text-center space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
          STAGE: {isPrep ? '15-MIN PREPARATION' : '10-MIN PRODUCT STUDY'}
        </span>
        <h1 className="text-2xl font-black text-white">
          {isPrep ? 'BUILD YOUR BMC' : 'STUDY PRODUCT CASE'}
        </h1>
      </div>

      <GlassPanel glow className="p-6 text-center space-y-4">
        <TimerDisplay
          timerState={timerState}
          label={isPrep ? 'BMC PREPARATION TIMER' : 'PRODUCT STUDY TIMER'}
          size="normal"
        />
      </GlassPanel>

      {myGroup && (
        <GlassPanel className="p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-lg font-black text-white">{myGroup.groupName}</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">
              YOUR TEAM
            </span>
          </div>

          {product && (
            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 text-center space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-500">CASE PRODUCT</span>
              <div className="text-xl font-black text-cyan-400 uppercase">{product.name}</div>
              <div className="text-xs font-bold text-slate-300 uppercase">{product.company}</div>
            </div>
          )}

          {currentParticipant.isCaptain && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 fill-current" /> YOU ARE TEAM CAPTAIN (PEER SCORER)
            </div>
          )}
        </GlassPanel>
      )}
    </div>
  );
};
