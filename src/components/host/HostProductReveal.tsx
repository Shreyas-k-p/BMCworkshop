import React, { useState, useEffect, useRef } from 'react';
import { Group } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { ArrowRight, Crown, Package, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface Props {
  groups: Record<string, Group>;
  onStartPreparation: () => Promise<void>;
}

export const HostProductReveal: React.FC<Props> = ({
  groups,
  onStartPreparation
}) => {
  const [loading, setLoading] = useState(false);
  const groupList = Object.values(groups).sort((a, b) => a.groupNumber - b.groupNumber);

  // Play dramatic reveal sound once when this stage mounts
  const revealPlayed = useRef(false);
  useEffect(() => {
    if (!revealPlayed.current) {
      revealPlayed.current = true;
      soundEffects.playProductReveal();
    }
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      await onStartPreparation();
    } catch (err) {
      console.error('[HostProductReveal] Error starting preparation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> STAGE 4: PRODUCT ASSIGNMENT
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            ASSIGNED PRODUCTS & COMPANIES
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Each team must analyze their assigned product and construct a full Business Model Canvas.
          </p>
        </div>

        <button
          onClick={handleStart}
          disabled={loading}
          className="py-3.5 px-8 rounded-xl font-extrabold text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 shrink-0"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              START 15-MIN PREPARATION
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* Revealed Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupList.map((g) => {
          const product = g.product;
          const isFailed = product?.type === 'failed';
          const membersList = g.members ? (Array.isArray(g.members) ? g.members : Object.values(g.members)) : [];

          return (
            <GlassPanel key={g.id} glow className="p-8 space-y-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-black text-lg flex items-center justify-center">
                      {g.groupNumber}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">
                        {g.groupName}
                      </h3>
                      {g.captainName && (
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                          <Crown className="w-3 h-3 fill-current" /> {g.captainName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-6 rounded-2xl bg-navy-950 border border-slate-800 text-center space-y-2 relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-slate-700">
                    <Package className="w-12 h-12 opacity-10" />
                  </div>

                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border inline-block ${
                    isFailed
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {isFailed ? 'FAILED PRODUCT CASE' : 'SUCCESSFUL PRODUCT CASE'}
                  </span>

                  <h4 className="text-3xl font-black text-white tracking-wide pt-2">
                    {product?.name || 'PRODUCT'}
                  </h4>

                  <p className="text-xl font-extrabold text-cyan-400 uppercase tracking-widest">
                    {product?.company || 'COMPANY'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
                  TEAM MEMBERS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {membersList.map((m) => (
                    <span
                      key={m.uid}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs font-semibold"
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
};
