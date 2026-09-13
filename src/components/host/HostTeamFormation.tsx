import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Group, DEPARTMENTS } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { DepartmentBadge } from '../common/DepartmentBadge';
import { Users, Crown, ArrowRight, Dices, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface Props {
  groups: Record<string, Group>;
  onProceedToCaptains: () => Promise<void>;
}

const SAMPLE_NAMES = [
  'Akhil', 'Arjun', 'Ananya', 'Rahul', 'Meera', 'Nikhil', 'Adithya', 'Neha',
  'Priya', 'Siddharth', 'Varun', 'Kavya', 'Rohan', 'Sneha', 'Tanvi', 'Vikas'
];

export const HostTeamFormation: React.FC<Props> = ({
  groups,
  onProceedToCaptains
}) => {
  const [animating, setAnimating] = useState(true);
  const [loading, setLoading] = useState(false);

  // Dynamic shuffling state during animation
  const [shufflingNames, setShufflingNames] = useState<string[]>([]);
  const [shufflingDepts, setShufflingDepts] = useState<any[]>([]);

  const groupList = Object.values(groups).sort((a, b) => a.groupNumber - b.groupNumber);

  useEffect(() => {
    let tickCount = 0;
    const interval = setInterval(() => {
      // Pick random names and departments for slot-machine shuffle effect
      const randomNames = Array.from({ length: 4 }, () => SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)]);
      const randomDepts = Array.from({ length: 4 }, () => DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)]);

      setShufflingNames(randomNames);
      setShufflingDepts(randomDepts);

      // Play curious shuffle tick sound
      soundEffects.playCuriousShuffle();

      tickCount++;
      if (tickCount >= 40) { // ~3.2 seconds of curious shuffling
        clearInterval(interval);
        setAnimating(false);
        soundEffects.playTeamRevealSound();
      }
    }, 80);

    return () => clearInterval(interval);
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await onProceedToCaptains();
    } catch (err) {
      console.error('[HostTeamFormation] Error proceeding:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <AnimatePresence mode="wait">
        {animating ? (
          <motion.div
            key="shuffling-stage"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="py-16 text-center space-y-8 max-w-2xl mx-auto"
          >
            {/* Spinning & pulsing shuffle icon */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-cyan-500/20 border-2 border-cyan-400 animate-ping opacity-30" />
              <div className="w-24 h-24 rounded-3xl bg-navy-900 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-2xl shadow-cyan-500/50">
                <Dices className="w-12 h-12 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-extrabold text-xs uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 animate-bounce" /> ALGORITHM ACTIVE
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-wider uppercase">
                SHUFFLING & BALANCING TEAMS...
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Distributing members across departments evenly into high-performance squads.
              </p>
            </div>

            {/* Slot-machine shuffling preview cards */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-navy-900/60 border border-slate-800">
              {shufflingNames.map((name, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [ -10, 0, 10, 0] }}
                  transition={{ duration: 0.15 }}
                  className="p-3 rounded-xl bg-navy-950 border border-cyan-500/30 flex items-center justify-between shadow-lg"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-bold text-white text-sm truncate">{name}</span>
                  </div>
                  {shufflingDepts[i] && (
                    <DepartmentBadge department={shufflingDepts[i]} size="sm" />
                  )}
                </motion.div>
              ))}
            </div>

            <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3.2, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-500/50"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="teams-formed-stage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Header banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> STAGE 2: GROUPS READY
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  BALANCED TEAMS FORMED
                </h2>
              </div>

              <button
                onClick={handleContinue}
                disabled={loading}
                className="py-3.5 px-8 rounded-xl font-extrabold text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 shrink-0"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    SELECT CAPTAINS
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupList.map((g, idx) => {
                const members = Object.values(g.members || {});
                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                  >
                    <GlassPanel glow className="p-6 space-y-4 h-full">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-black text-lg flex items-center justify-center">
                            {g.groupNumber}
                          </div>
                          <h3 className="text-2xl font-black text-white tracking-tight">
                            {g.groupName}
                          </h3>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                          {members.length} MEMBERS
                        </span>
                      </div>

                      {/* Member List */}
                      <div className="space-y-2">
                        {members.map((m) => (
                          <div
                            key={m.uid}
                            className="p-3 rounded-xl bg-navy-950/60 border border-slate-800/80 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Users className="w-4 h-4 text-slate-500 shrink-0" />
                              <span className="font-bold text-white text-sm truncate">
                                {m.name}
                              </span>
                              {m.isCaptain && (
                                <Crown className="w-4 h-4 text-amber-400 shrink-0 fill-current" />
                              )}
                            </div>
                            <DepartmentBadge department={m.department} size="sm" />
                          </div>
                        ))}
                      </div>
                    </GlassPanel>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
