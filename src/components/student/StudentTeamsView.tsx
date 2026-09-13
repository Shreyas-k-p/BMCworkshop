import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Group, Participant } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { DepartmentBadge } from '../common/DepartmentBadge';
import { Crown, Users, Sparkles, Package, Radar } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface Props {
  groups: Record<string, Group>;
  currentParticipant: Participant;
  sessionId?: string;
}

function getMembersList(g?: Group | null): Participant[] {
  if (!g || !g.members) return [];
  if (Array.isArray(g.members)) return g.members.filter(Boolean);
  return Object.values(g.members).filter(Boolean);
}

export const StudentTeamsView: React.FC<Props> = ({
  groups,
  currentParticipant,
  sessionId = 'default_session'
}) => {
  // Find ONLY the student's assigned group
  const myGroupId = currentParticipant.groupId;
  const myGroup = myGroupId
    ? groups[myGroupId] || Object.values(groups).find(g => g.id === myGroupId)
    : Object.values(groups).find(g => {
        const mems = getMembersList(g);
        return mems.some(m => m && m.uid === currentParticipant.uid);
      });

  const revealedStorageKey = `bmc_live_team_revealed_${sessionId}_${currentParticipant.uid}`;

  // Check if team reveal suspense animation has already been shown
  const [hasRevealed, setHasRevealed] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(revealedStorageKey));
  });

  // Animation Step: 0 = WAITING/SEARCHING, 1 = TEAM ASSIGNMENT, 2 = YOUR TEAM IS..., 3 = TEAM NUMBER REVEAL, 4 = FINAL TEAM VIEW
  const [animationStep, setAnimationStep] = useState<number>(() => {
    return localStorage.getItem(revealedStorageKey) ? 4 : 1;
  });

  useEffect(() => {
    if (!myGroup) return;

    if (hasRevealed) {
      setAnimationStep(4);
      return;
    }

    // Trigger exciting 4-step reveal animation sequence
    setAnimationStep(1); // Step 1: TEAM ASSIGNMENT (Finding your team...)
    soundEffects.playCuriousShuffle();

    const t1 = setTimeout(() => {
      setAnimationStep(2); // Step 2: YOUR TEAM IS...
      soundEffects.playCuriousShuffle();
    }, 1400);

    const t2 = setTimeout(() => {
      setAnimationStep(3); // Step 3: TEAM NUMBER REVEAL
      soundEffects.playTeamRevealSound();
    }, 2800);

    const t3 = setTimeout(() => {
      setAnimationStep(4); // Step 4: YOUR TEAM & MEMBER CARDS
      setHasRevealed(true);
      localStorage.setItem(revealedStorageKey, 'true');
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [myGroup?.id, hasRevealed, revealedStorageKey]);

  // Case 1: Waiting for host to create/assign teams
  if (!myGroup) {
    return (
      <div className="min-h-screen bg-navy-950 p-6 flex flex-col items-center justify-center text-center">
        <GlassPanel glow className="p-8 space-y-6 max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400 flex items-center justify-center mx-auto animate-pulse">
            <Radar className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
              TEAM FORMATION IN PROGRESS
            </span>
            <h2 className="text-3xl font-black text-white">WAITING FOR TEAMS...</h2>
            <p className="text-slate-400 text-xs">
              The host is generating balanced squads. Your assigned team will be revealed shortly!
            </p>
          </div>
        </GlassPanel>
      </div>
    );
  }

  const members = getMembersList(myGroup);
  const product = myGroup.product;

  return (
    <div className="min-h-screen bg-navy-950 p-4 pb-16 max-w-md mx-auto flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {/* STEP 1: TEAM ASSIGNMENT (Finding your team...) */}
        {animationStep === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="py-12 text-center space-y-6"
          >
            <GlassPanel glow className="p-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center mx-auto text-cyan-400 shadow-xl shadow-cyan-500/30">
                <Radar className="w-10 h-10 animate-spin" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  BALANCING DEPARTMENTS
                </span>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                  TEAM ASSIGNMENT
                </h2>
                <p className="text-slate-400 text-xs">
                  Finding your optimal squad placement...
                </p>
              </div>
            </GlassPanel>
          </motion.div>
        )}

        {/* STEP 2: YOUR TEAM IS... */}
        {animationStep === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(5px)' }}
            transition={{ duration: 0.4 }}
            className="py-16 text-center space-y-6"
          >
            <GlassPanel glow className="p-10 space-y-4 border-cyan-400/80 shadow-2xl shadow-cyan-500/30">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold text-xs uppercase tracking-widest">
                <Sparkles className="w-4 h-4 animate-bounce" /> SUSPENSE REVEAL
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase">
                YOUR TEAM IS...
              </h2>
            </GlassPanel>
          </motion.div>
        )}

        {/* STEP 3: TEAM NUMBER REVEAL */}
        {animationStep === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [0.7, 1.2, 1] }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
            className="py-16 text-center space-y-6"
          >
            <GlassPanel glow className="p-10 space-y-4 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/50 bg-gradient-to-b from-navy-900 to-navy-950">
              <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                SQUAD ASSIGNED
              </span>
              <div className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 tracking-tight">
                TEAM {myGroup.groupNumber}
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-widest">
                {myGroup.groupName}
              </h3>
            </GlassPanel>
          </motion.div>
        )}

        {/* STEP 4: FINAL REVEAL — YOUR TEAM ONLY & MEMBER CARDS */}
        {animationStep === 4 && (
          <motion.div
            key="step-4-final"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* Header */}
            <div className="text-center space-y-1 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-extrabold text-[10px] uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> BMC LIVE COMPETITION
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">YOUR TEAM</h1>
              <p className="text-slate-400 text-xs">
                Your assigned squad members & competition details.
              </p>
            </div>

            {/* ONLY YOUR ASSIGNED TEAM CARD */}
            <GlassPanel
              glow
              className="p-5 space-y-5 border-cyan-400/80 shadow-2xl shadow-cyan-500/25 bg-gradient-to-b from-navy-900/90 to-navy-950"
            >
              {/* Team Title & Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-navy-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-cyan-500/40">
                    {myGroup.groupNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        {myGroup.groupName}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-400 text-navy-950 text-[10px] font-black uppercase tracking-wider">
                        YOUR TEAM
                      </span>
                    </div>
                    <p className="text-xs font-bold text-cyan-300">
                      {members.length} MEMBERS
                    </p>
                  </div>
                </div>
              </div>

              {/* Assigned Product Banner */}
              {product && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950 to-navy-900 border border-cyan-500/50 text-center space-y-1 relative overflow-hidden">
                  <div className="flex items-center justify-center gap-1.5 text-cyan-400 text-[10px] font-black uppercase tracking-wider">
                    <Package className="w-3.5 h-3.5" /> ASSIGNED PRODUCT
                  </div>
                  <div className="text-xl font-black text-white uppercase tracking-tight">
                    {product.name}
                  </div>
                  <div className="text-xs font-bold text-cyan-300 uppercase">
                    {product.company}
                  </div>
                </div>
              )}

              {/* Member List Revealed One by One */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  SQUAD MEMBERS ({members.length})
                </span>

                {members.map((m, idx) => {
                  const isMe = m.uid === currentParticipant.uid;
                  const isCaptain = myGroup.captainId === m.uid;

                  return (
                    <motion.div
                      key={m.uid}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                        isMe
                          ? 'bg-cyan-500/20 border-cyan-400/80 text-cyan-200 shadow-lg shadow-cyan-500/20'
                          : isCaptain
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                          : 'bg-navy-950/80 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        {isCaptain ? (
                          <Crown className="w-4 h-4 text-amber-400 fill-current shrink-0 animate-bounce" />
                        ) : (
                          <Users className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate text-sm font-black">{m.name}</span>
                        {isMe && (
                          <span className="px-2 py-0.5 rounded bg-cyan-400 text-navy-950 font-black text-[9px] uppercase tracking-wider">
                            YOU
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCaptain && (
                          <span className="text-[9px] font-extrabold uppercase text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                            👑 CAPTAIN
                          </span>
                        )}
                        <DepartmentBadge department={m.department} size="sm" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
