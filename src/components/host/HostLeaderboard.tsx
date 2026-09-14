import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Group } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { DepartmentBadge } from '../common/DepartmentBadge';
import { Crown, RotateCcw, LogOut, Sparkles } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface Props {
  groups: Record<string, Group>;
  onRestartSession: () => void;
  onEndSession: () => void;
}

export const HostLeaderboard: React.FC<Props> = ({
  groups,
  onRestartSession,
  onEndSession
}) => {
  const sortedGroups = Object.values(groups).sort(
    (a, b) => (b.finalScore || 0) - (a.finalScore || 0)
  );

  const top1 = sortedGroups[0];
  const top2 = sortedGroups[1];
  const top3 = sortedGroups[2];

  // Confetti animation
  useEffect(() => {
    const end = Date.now() + 3 * 1000;
    const colors = ['#06b6d4', '#3b82f6', '#fbbf24', '#f43f5e'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  // Winner sound — plays once on mount, synchronized with confetti
  const winnerSoundPlayed = useRef(false);
  useEffect(() => {
    if (!winnerSoundPlayed.current) {
      winnerSoundPlayed.current = true;
      soundEffects.playWinner();
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10 pb-16">
      <div className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-xs tracking-widest uppercase"
        >
          <Sparkles className="w-4 h-4 fill-current" /> FINAL COMPETITION RESULTS
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">
          BMC LIVE <span className="text-amber-400">CHAMPIONS</span>
        </h1>
        <p className="text-slate-400 text-lg font-medium">
          Final peer captain evaluation leaderboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
        {top2 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-2 md:order-1"
          >
            <GlassPanel className="p-6 text-center border-slate-400/40 relative space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-300/20 border-2 border-slate-300 text-slate-300 font-black text-xl flex items-center justify-center mx-auto">
                🥈
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                  2ND PLACE
                </span>
                <h3 className="text-3xl font-black text-white">{top2.groupName}</h3>
                <div className="text-4xl font-black text-slate-300 tracking-tight mt-1">
                  {top2.finalScore?.toFixed(1) || '0.0'} <span className="text-xs text-slate-400">/ 10</span>
                </div>
              </div>
              {top2.product && (
                <div className="p-2 rounded-xl bg-navy-950 text-xs font-bold text-cyan-400">
                  {top2.product.name}
                </div>
              )}
            </GlassPanel>
          </motion.div>
        )}

        {top1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1.05, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="order-1 md:order-2 z-10"
          >
            <GlassPanel glow className="p-8 text-center border-amber-500/60 shadow-amber-500/20 space-y-5 relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-amber-500 text-navy-950 font-black text-2xl flex items-center justify-center shadow-xl shadow-amber-500/40 animate-bounce">
                👑
              </div>
              <div className="pt-2">
                <span className="text-xs uppercase font-black text-amber-400 tracking-widest block">
                  WINNER & CHAMPION
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white">{top1.groupName}</h2>
                <div className="text-5xl md:text-6xl font-black text-amber-400 tracking-tight mt-2">
                  {top1.finalScore?.toFixed(1) || '0.0'} <span className="text-sm text-slate-400">/ 10</span>
                </div>
              </div>

              {top1.product && (
                <div className="p-3 rounded-2xl bg-navy-950 border border-amber-500/30">
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block">
                    WINNING BUSINESS MODEL CASE
                  </span>
                  <div className="text-lg font-black text-white uppercase">{top1.product.name}</div>
                  <div className="text-xs font-bold text-cyan-400 uppercase">{top1.product.company}</div>
                </div>
              )}
            </GlassPanel>
          </motion.div>
        )}

        {top3 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="order-3"
          >
            <GlassPanel className="p-6 text-center border-amber-700/40 relative space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-700/20 border-2 border-amber-700 text-amber-600 font-black text-xl flex items-center justify-center mx-auto">
                🥉
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">
                  3RD PLACE
                </span>
                <h3 className="text-3xl font-black text-white">{top3.groupName}</h3>
                <div className="text-4xl font-black text-amber-500 tracking-tight mt-1">
                  {top3.finalScore?.toFixed(1) || '0.0'} <span className="text-xs text-slate-400">/ 10</span>
                </div>
              </div>
              {top3.product && (
                <div className="p-2 rounded-xl bg-navy-950 text-xs font-bold text-cyan-400">
                  {top3.product.name}
                </div>
              )}
            </GlassPanel>
          </motion.div>
        )}
      </div>

      <GlassPanel className="p-8 space-y-6">
        <h3 className="text-2xl font-black text-white tracking-tight">COMPLETE LEADERBOARD</h3>

        <div className="space-y-3">
          {sortedGroups.map((g, idx) => (
            <div
              key={g.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
                idx === 0
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : idx === 1
                  ? 'bg-slate-300/10 border-slate-400/30'
                  : idx === 2
                  ? 'bg-amber-800/10 border-amber-700/30'
                  : 'bg-navy-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <span className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-lg text-slate-200 shrink-0">
                  #{idx + 1}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-2xl font-black text-white">{g.groupName}</h4>
                    {g.captainName && (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 fill-current" /> {g.captainName}
                      </span>
                    )}
                  </div>
                  {g.product && (
                    <span className="text-xs text-slate-400 font-medium">
                      Product: <strong className="text-cyan-400">{g.product.name}</strong> ({g.product.company})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                {Object.values(g.members || {}).map((m) => (
                  <div key={m.uid} className="flex items-center gap-1 bg-navy-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                    <span className="text-xs font-bold text-slate-200">{m.name}</span>
                    <DepartmentBadge department={m.department} size="sm" />
                  </div>
                ))}
              </div>

              <div className="text-right shrink-0">
                <div className="text-3xl font-black text-cyan-400">
                  {g.finalScore?.toFixed(1) || '0.0'}
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500">FINAL AVG SCORE</span>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      <div className="flex items-center justify-center gap-4 pt-6">
        <button
          onClick={onRestartSession}
          className="py-3.5 px-6 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          RESTART NEW SESSION
        </button>

        <button
          onClick={onEndSession}
          className="py-3.5 px-8 rounded-xl font-extrabold bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          END SESSION
        </button>
      </div>
    </div>
  );
};
