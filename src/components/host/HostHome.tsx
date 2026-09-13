import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Trophy, Users, Shield, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Database } from 'lucide-react';
import { GlassPanel } from '../common/GlassPanel';
import { AuthState } from '../../hooks/useAuth';
import { testDatabaseConnection } from '../../firebase/database';

interface Props {
  onCreateSession: () => Promise<void>;
  authState: AuthState;
}

export const HostHome: React.FC<Props> = ({ onCreateSession, authState }) => {
  const [creating, setCreating] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbErrorCode, setDbErrorCode] = useState<string | null>(null);
  const [dbTesting, setDbTesting] = useState(false);
  const [dbSuccess, setDbSuccess] = useState(false);

  const { loading: authLoading, authenticated, error: authError, errorCode, retry } = authState;

  useEffect(() => {
    if (authenticated) {
      setDbTesting(true);
      testDatabaseConnection()
        .then(() => {
          setDbSuccess(true);
          setDbError(null);
          setDbErrorCode(null);
        })
        .catch((err: any) => {
          setDbSuccess(false);
          const code = err.code || err.name || 'PERMISSION_DENIED';
          const message = err.message || 'Permission denied';
          setDbErrorCode(code);
          setDbError(message);
        })
        .finally(() => {
          setDbTesting(false);
        });
    }
  }, [authenticated]);

  const handleCreate = async () => {
    if (!authenticated || creating || authLoading) return;
    setCreating(true);
    setDbError(null);
    setDbErrorCode(null);

    try {
      await onCreateSession();
    } catch (err: any) {
      console.error('[BMC DATABASE] SESSION CREATE FAILED:', err);
      const code = err.code || err.name || 'PERMISSION_DENIED';
      const message = err.message || 'Permission denied';
      setDbErrorCode(code);
      setDbError(message);
    } finally {
      setCreating(false);
    }
  };

  const isConfigError = errorCode === 'auth/configuration-not-found' || errorCode === 'auth/operation-not-allowed';

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl w-full text-center z-10 space-y-8">
        {/* Title Tagline Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold text-xs tracking-widest uppercase mb-2">
            <Sparkles className="w-4 h-4" /> Live Classroom Competition System
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white">
            BMC <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">LIVE</span>
          </h1>

          <p className="text-2xl md:text-3xl font-extrabold tracking-widest text-slate-300 uppercase">
            Build. Compete. Pitch. Win.
          </p>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Real-time Business Model Canvas competition platform for engineering students.
          </p>
        </motion.div>

        {/* Action Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <GlassPanel glow className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Host a Competition</h2>
              <p className="text-slate-400 text-sm">
                Projector-optimized host controls with real-time student mobile interaction.
              </p>
            </div>

            {/* Auth & Database Status Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {authLoading ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  CONNECTING AUTH...
                </div>
              ) : authenticated ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" /> HOST READY
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-black uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5" /> AUTHENTICATION FAILED
                </div>
              )}

              {authenticated && (
                dbTesting ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                    <Database className="w-3 h-3 animate-pulse" /> TESTING DB...
                  </div>
                ) : dbSuccess ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
                    <Database className="w-3.5 h-3.5" /> DB CONNECTED
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5" /> DB DENIED
                  </div>
                )
              )}
            </div>

            {/* Authentication Error Box */}
            {authError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-left font-mono space-y-3">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>AUTHENTICATION ERROR ({errorCode || 'auth/unknown'})</span>
                </div>

                <div className="break-words font-sans text-xs bg-navy-950/80 p-2.5 rounded border border-rose-500/20 text-slate-200">
                  {authError}
                </div>

                {isConfigError && (
                  <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-sans text-xs space-y-2">
                    <div className="font-extrabold flex items-center gap-1">
                      <span>⚠️ Firebase Authentication Console Setup Checklist</span>
                    </div>

                    <p className="text-[11px] text-slate-300">
                      Project ID: <strong className="font-mono text-cyan-300">studio-3692413383-3932e</strong>
                    </p>

                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                      <li>Open <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline text-cyan-400 inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a></li>
                      <li>Select project <strong>studio-3692413383-3932e</strong></li>
                      <li>Go to <strong>Build</strong> &gt; <strong>Authentication</strong> &gt; Click <strong>Get Started</strong></li>
                      <li>Go to <strong>Sign-in method</strong> tab &gt; Click <strong>Anonymous</strong> &gt; Toggle <strong>Enable</strong> &gt; Click <strong>Save</strong></li>
                    </ol>
                  </div>
                )}

                <button
                  onClick={retry}
                  className="w-full py-2 px-3 bg-rose-500 hover:bg-rose-400 text-navy-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> RETRY AUTHENTICATION
                </button>
              </div>
            )}

            {/* Database Error Box */}
            {dbError && !authError && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs text-left font-mono space-y-3">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <Database className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>DATABASE ERROR</span>
                </div>

                <div className="break-words font-sans text-xs bg-navy-950/80 p-2.5 rounded border border-amber-500/20 text-slate-200">
                  {dbErrorCode ? `[${dbErrorCode}] ` : ''}{dbError}
                </div>

                <div className="text-[11px] font-sans text-slate-400 space-y-1">
                  <p>Check Realtime Database Rules in Firebase Console:</p>
                  <p className="text-cyan-300 font-mono">https://studio-3692413383-3932e-default-rtdb.firebaseio.com</p>
                </div>
              </div>
            )}

            {/* Create Session Button */}
            <button
              onClick={handleCreate}
              disabled={!authenticated || creating || authLoading}
              className="w-full py-4 px-6 rounded-xl font-extrabold text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {creating ? (
                <div className="w-6 h-6 border-3 border-navy-950 border-t-transparent rounded-full animate-spin" />
              ) : authLoading ? (
                <span>CONNECTING...</span>
              ) : !authenticated ? (
                <span>AUTHENTICATION NOT READY</span>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  CREATE SESSION
                </>
              )}
            </button>
          </GlassPanel>
        </motion.div>

        {/* Key Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 max-w-3xl mx-auto"
        >
          <div className="p-4 rounded-xl bg-navy-900/40 border border-slate-800 text-left space-y-1">
            <Users className="w-5 h-5 text-cyan-400 mb-1" />
            <h3 className="text-white font-bold text-sm">Instant Mobile Join</h3>
            <p className="text-slate-400 text-xs">Students scan QR code or enter session code from any browser.</p>
          </div>
          <div className="p-4 rounded-xl bg-navy-900/40 border border-slate-800 text-left space-y-1">
            <Sparkles className="w-5 h-5 text-cyan-400 mb-1" />
            <h3 className="text-white font-bold text-sm">Balanced Teams</h3>
            <p className="text-slate-400 text-xs">Automated team formation (5-7 members) with department balance.</p>
          </div>
          <div className="p-4 rounded-xl bg-navy-900/40 border border-slate-800 text-left space-y-1">
            <Shield className="w-5 h-5 text-cyan-400 mb-1" />
            <h3 className="text-white font-bold text-sm">Peer Captain Scoring</h3>
            <p className="text-slate-400 text-xs">Captains score other teams live. Real-time authoritative sync.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
