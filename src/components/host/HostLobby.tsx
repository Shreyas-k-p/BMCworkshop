import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Session, Participant } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { DepartmentBadge } from '../common/DepartmentBadge';
import { Users, UserPlus, ArrowRight, QrCode, AlertCircle } from 'lucide-react';
import { getJoinUrl } from '../../utils/urlHelper';
import { soundEffects } from '../../utils/soundEffects';

interface Props {
  session: Session;
  participants: Participant[];
  onAddDemoStudents: () => Promise<void>;
  onCreateTeams: () => Promise<void>;
}

export const HostLobby: React.FC<Props> = ({
  session,
  participants,
  onAddDemoStudents,
  onCreateTeams
}) => {
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track participant count to detect genuinely new joins (not page refresh)
  // Initialized to current count so refresh doesn't trigger sounds
  const prevCountRef = useRef(participants.length);
  useEffect(() => {
    const current = participants.length;
    if (current > prevCountRef.current) {
      soundEffects.playJoin();
    }
    prevCountRef.current = current;
  }, [participants.length]);

  const joinUrl = getJoinUrl(session.code);
  const canCreateTeams = participants.length >= 5;

  const handleDemo = async () => {
    setLoadingDemo(true);
    setError(null);
    try {
      await onAddDemoStudents();
    } catch (err: any) {
      setError(err.message || 'Failed to add demo students.');
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleCreateTeams = async () => {
    if (!canCreateTeams) return;
    setLoadingTeams(true);
    setError(null);
    soundEffects.playClick();
    try {
      await onCreateTeams();
      soundEffects.playTeamReveal();
    } catch (err: any) {
      setError(err.message || 'Failed to create teams.');
    } finally {
      setLoadingTeams(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (5 cols): QR Code & Joining Info */}
        <div className="lg:col-span-5 space-y-6">
          <GlassPanel glow className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-extrabold text-cyan-400">
                SCAN TO JOIN COMPETITION
              </span>
              <h2 className="text-4xl font-mono font-black text-white tracking-widest">
                {session.code}
              </h2>
            </div>

            {/* QR Code Container */}
            <div className="p-5 bg-white rounded-2xl shadow-2xl inline-block mx-auto border-4 border-cyan-400">
              <QRCodeSVG
                value={joinUrl}
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="space-y-1">
              <p className="text-slate-300 font-semibold text-sm">
                Open phone browser or camera & scan QR
              </p>
              <p className="text-slate-500 text-xs font-mono break-all">
                {joinUrl}
              </p>
            </div>

            {/* Demo Mode Button */}
            <button
              onClick={handleDemo}
              disabled={loadingDemo}
              className="w-full py-3 px-4 rounded-xl font-bold bg-navy-800 hover:bg-slate-800 border border-slate-700 text-cyan-400 transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loadingDemo ? (
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  ADD DEMO STUDENTS (+10)
                </>
              )}
            </button>
          </GlassPanel>
        </div>

        {/* Right Column (7 cols): Live Participant Counter & List */}
        <div className="lg:col-span-7 space-y-6">
          <GlassPanel className="p-8 space-y-6 min-h-[480px] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">LIVE PARTICIPANTS</h3>
                    <p className="text-xs text-slate-400">Students connected in real-time</p>
                  </div>
                </div>

                {/* Participant Badge */}
                <div className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-black text-lg tracking-wider">
                  {participants.length} {participants.length === 1 ? 'STUDENT' : 'STUDENTS'} JOINED
                </div>
              </div>

              {/* Student Grid */}
              <div className="mt-6">
                {participants.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-500 animate-pulse">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <p className="text-slate-400 font-bold text-lg">WAITING FOR STUDENTS TO JOIN...</p>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                      Scan the QR code or share session code <span className="text-cyan-400 font-mono font-bold">{session.code}</span> to get started.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                    {participants.map((p, idx) => (
                      <motion.div
                        key={p.uid}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-3.5 rounded-xl bg-navy-950/60 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <span className="font-bold text-white text-sm block truncate">
                              {p.name}
                            </span>
                            {p.isDemo && (
                              <span className="text-[10px] uppercase font-bold text-amber-400">DEMO</span>
                            )}
                          </div>
                        </div>
                        <DepartmentBadge department={p.department} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-6 border-t border-slate-800 space-y-2">
              {!canCreateTeams && (
                <p className="text-xs text-amber-400 font-medium text-center">
                  ⚠️ Minimum 5 students required to form balanced teams. (Currently {participants.length})
                </p>
              )}
              
              <button
                onClick={handleCreateTeams}
                disabled={!canCreateTeams || loadingTeams}
                className="w-full py-4 px-6 rounded-xl font-black text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loadingTeams ? (
                  <div className="w-6 h-6 border-3 border-navy-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    CREATE BALANCED TEAMS
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};
