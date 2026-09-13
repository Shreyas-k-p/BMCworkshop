import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Group } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { DepartmentBadge } from '../common/DepartmentBadge';
import { Crown, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  groups: Record<string, Group>;
  onSelectCaptain: (groupId: string, captainUid: string, captainName: string) => Promise<void>;
  onConfirmAllCaptains: () => Promise<void>;
}

export const HostCaptainSelection: React.FC<Props> = ({
  groups,
  onSelectCaptain,
  onConfirmAllCaptains
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupList = Object.values(groups).sort((a, b) => a.groupNumber - b.groupNumber);
  
  // Check if every team has 1 captain selected
  const allCaptainsSelected = groupList.length > 0 && groupList.every(g => Boolean(g.captainId));

  const handleSelect = async (groupId: string, captainUid: string, captainName: string) => {
    setError(null);
    try {
      await onSelectCaptain(groupId, captainUid, captainName);
    } catch (err: any) {
      setError(err.message || 'Failed to assign captain.');
    }
  };

  const handleContinue = async () => {
    if (!allCaptainsSelected) return;
    setLoading(true);
    setError(null);
    try {
      await onConfirmAllCaptains();
    } catch (err: any) {
      setError(err.message || 'Failed to proceed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            STAGE 3: CAPTAIN SELECTION
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            SELECT TEAM CAPTAINS
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Pick exactly ONE captain per team to represent and score peer presentations.
          </p>
        </div>

        <button
          onClick={handleContinue}
          disabled={!allCaptainsSelected || loading}
          className="py-3.5 px-8 rounded-xl font-extrabold text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shrink-0"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              ASSIGN PRODUCTS
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold">
          {error}
        </div>
      )}

      {/* Progress banner */}
      <div className="p-4 rounded-2xl bg-navy-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          <span className="font-extrabold text-white text-lg">
            {groupList.filter(g => Boolean(g.captainId)).length} OF {groupList.length} CAPTAINS SELECTED
          </span>
        </div>
        {!allCaptainsSelected && (
          <span className="text-amber-400 font-bold text-xs uppercase tracking-wider animate-pulse">
            ⚠️ Select 1 captain for every team to enable continue
          </span>
        )}
      </div>

      {/* Group Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupList.map((g) => {
          const members = Object.values(g.members || {});
          const isSelected = Boolean(g.captainId);

          return (
            <GlassPanel
              key={g.id}
              glow={isSelected}
              className={`p-6 space-y-4 ${isSelected ? 'border-amber-500/40' : ''}`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {g.groupName}
                    </h3>
                    {g.captainName ? (
                      <span className="text-xs font-bold text-amber-400 block">
                        👑 {g.captainName}
                      </span>
                    ) : (
                      <span className="text-xs text-rose-400 font-bold block">
                        NO CAPTAIN SELECTED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Members Selection List */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  CLICK MEMBER TO MAKE CAPTAIN:
                </span>
                {members.map((m) => {
                  const isCaptain = g.captainId === m.uid;

                  return (
                    <motion.button
                      key={m.uid}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(g.id, m.uid, m.name)}
                      className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all text-left ${
                        isCaptain
                          ? 'bg-amber-500/20 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : 'bg-navy-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {isCaptain ? (
                          <Crown className="w-5 h-5 text-amber-400 fill-current shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-600 shrink-0" />
                        )}
                        <span className={`font-bold text-sm truncate ${isCaptain ? 'text-amber-300' : 'text-white'}`}>
                          {m.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DepartmentBadge department={m.department} size="sm" />
                        {isCaptain && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
};
