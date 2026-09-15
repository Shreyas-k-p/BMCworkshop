import React from 'react';
import { Group, Participant } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { Crown, Sparkles } from 'lucide-react';

interface Props {
  groups: Record<string, Group>;
  currentParticipant: Participant;
}

export const StudentLeaderboard: React.FC<Props> = ({ groups, currentParticipant }) => {
  const sortedGroups = Object.values(groups).sort(
    (a, b) => (b.finalScore || 0) - (a.finalScore || 0)
  );

  const myGroupId = currentParticipant.groupId;

  return (
    <div className="min-h-screen bg-navy-950 p-4 pb-12 space-y-6 max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-[10px] uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 fill-current" /> FINAL RESULTS
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">LEADERBOARD</h1>
        <p className="text-slate-400 text-xs">Final peer captain evaluation results</p>
      </div>

      <div className="space-y-3">
        {sortedGroups.map((g, idx) => {
          const isMyTeam = g.id === myGroupId;
          const isWinner = idx === 0;

          return (
            <GlassPanel
              key={g.id}
              glow={isWinner || isMyTeam}
              className={`p-4 space-y-3 ${
                isWinner
                  ? 'border-amber-500/60 shadow-amber-500/20'
                  : isMyTeam
                  ? 'border-cyan-400/50'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center ${
                    idx === 0
                      ? 'bg-amber-500 text-navy-950'
                      : idx === 1
                      ? 'bg-slate-300 text-navy-950'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>

                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      {g.groupName}
                      {isMyTeam && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[9px] font-bold uppercase">
                          YOUR TEAM
                        </span>
                      )}
                    </h3>
                    {g.captainName && (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Crown className="w-3 h-3 fill-current" /> {g.captainName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-cyan-400">
                    {g.finalScore?.toFixed(1) || '0.0'}
                  </div>
                  <span className="text-[8px] uppercase font-bold text-slate-500">FINAL SCORE</span>
                </div>
              </div>

              {g.businessIdea && (
                <div className="p-2 rounded-lg bg-navy-950 text-center text-xs font-bold text-slate-300">
                  Business: <span className="text-cyan-400 font-extrabold">🚀 {g.businessIdea.businessName}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/60">
                {Object.values(g.members || {}).map((m) => (
                  <span
                    key={m.uid}
                    className="px-2 py-0.5 rounded bg-slate-800/80 text-[10px] font-bold text-slate-300"
                  >
                    {m.name} ({m.department})
                  </span>
                ))}
              </div>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
};
