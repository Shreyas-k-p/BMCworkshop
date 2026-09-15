import React, { useState } from 'react';
import { Group, Participant, Session } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { TimerDisplay } from '../common/TimerDisplay';
import { Lightbulb, Crown, Send, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface Props {
  session: Session;
  myGroup: Group | undefined;
  currentParticipant: Participant;
  onSubmitIdea: (businessName: string, description: string) => Promise<void>;
}

export const StudentBusinessIdeaView: React.FC<Props> = ({
  session,
  myGroup,
  currentParticipant,
  onSubmitIdea
}) => {
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCaptain = Boolean(currentParticipant.isCaptain);
  const existingIdea = myGroup?.businessIdea;
  const isLocked = Boolean(existingIdea && existingIdea.locked);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCaptain || isLocked || submitting) return;

    if (!businessName.trim() || businessName.trim().length < 2) {
      setError('Business name must be at least 2 characters.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide a short description (at least 10 characters).');
      return;
    }

    setSubmitting(true);
    setError(null);
    soundEffects.playClick();

    try {
      await onSubmitIdea(businessName, description);
      soundEffects.playBusinessIdeaSubmitted();
    } catch (err: any) {
      setError(err.message || 'Failed to submit business idea.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 p-4 pb-12 space-y-6 max-w-lg mx-auto flex flex-col justify-center">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-extrabold text-[10px] uppercase tracking-widest">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> 5-MIN CHALLENGE
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          CREATE BUSINESS IDEA
        </h1>
        <p className="text-slate-400 text-xs">
          {myGroup?.groupName || 'Your Team'}
        </p>
      </div>

      {/* 5-Minute Timer Display */}
      <GlassPanel glow className="p-5 text-center space-y-3">
        <TimerDisplay
          timerState={session.businessIdea}
          label="TIME REMAINING TO SUBMIT IDEA"
          size="normal"
        />
      </GlassPanel>

      {/* Main Card: Captain Form or Non-Captain View */}
      {isCaptain ? (
        /* ─── CAPTAIN SUBMISSION SCREEN ─── */
        <GlassPanel className="p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400 fill-current" />
              <div>
                <h3 className="text-lg font-black text-white">
                  {isLocked ? 'BUSINESS IDEA SUBMITTED' : 'CREATE YOUR BUSINESS IDEA'}
                </h3>
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                  👑 TEAM CAPTAIN SUBMISSION
                </span>
              </div>
            </div>
            {isLocked && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase">
                <Lock className="w-3.5 h-3.5" /> LOCKED
              </span>
            )}
          </div>

          {isLocked && existingIdea ? (
            /* Locked Confirmation */
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">
                  ✅ BUSINESS IDEA SUBMITTED
                </h4>
                <p className="text-xs text-slate-400">
                  🔒 BUSINESS IDEA LOCKED
                </p>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-cyan-500/40 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                    BUSINESS NAME:
                  </span>
                </div>
                <div className="text-lg font-black text-white uppercase">
                  🚀 {existingIdea.businessName}
                </div>
                <div className="text-xs text-slate-300 leading-relaxed italic pt-1 border-t border-slate-800">
                  "{existingIdea.description}"
                </div>
              </div>

              <p className="text-slate-400 text-xs">
                Your team will construct the 9-block Business Model Canvas around this idea in the next 15-minute stage.
              </p>
            </div>
          ) : (
            /* Editable Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                  {error}
                </div>
              )}

              <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-extrabold text-amber-300 flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" /> INSTRUCTIONS
                </span>
                <p>
                  "Create the most ridiculous business idea you can think of — then make it sound like a real business."
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase text-slate-300 tracking-wider block">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. SleepBot"
                  maxLength={50}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-bold"
                />
                <div className="flex justify-end text-[10px] text-slate-500">
                  {businessName.length} / 50 characters
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase text-slate-300 tracking-wider block">
                  About the Business
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. A robot that wakes up sleepy college students and takes them to class."
                  rows={3}
                  maxLength={300}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-medium resize-none leading-relaxed"
                />
                <div className="flex justify-end text-[10px] text-slate-500">
                  {description.length} / 300 characters
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-xl font-black text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-xl shadow-cyan-500/25 transition-all transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    SUBMIT BUSINESS IDEA
                  </>
                )}
              </button>
            </form>
          )}
        </GlassPanel>
      ) : (
        /* ─── NON-CAPTAIN STUDENT SCREEN ─── */
        <GlassPanel className="p-6 text-center space-y-4">
          {isLocked && existingIdea ? (
            <div className="space-y-4 py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">
                  ✅ Your team's business idea has been submitted.
                </h3>
                <p className="text-xs text-slate-400">
                  Submitted by team captain {myGroup?.captainName || ''}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-cyan-500/40 text-left space-y-2">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  SUBMITTED BUSINESS IDEA:
                </span>
                <div className="text-lg font-black text-white uppercase">
                  🚀 {existingIdea.businessName}
                </div>
                <div className="text-xs text-slate-300 leading-relaxed italic pt-1 border-t border-slate-800">
                  "{existingIdea.description}"
                </div>
              </div>

              <p className="text-slate-400 text-xs">
                Get ready! The 15-minute Business Model Canvas stage will begin shortly.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400 flex items-center justify-center mx-auto animate-pulse">
                <Lightbulb className="w-7 h-7 text-amber-400" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 block">
                  💡 BUSINESS IDEA CHALLENGE
                </span>
                <h3 className="text-xl font-black text-white">
                  Your captain is submitting your team's business idea.
                </h3>
              </div>

              {myGroup?.captainName && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Crown className="w-3.5 h-3.5 fill-current" /> Captain: {myGroup.captainName}
                </div>
              )}

              <p className="text-slate-300 text-xs max-w-xs mx-auto leading-relaxed">
                Collaborate with your team now! Brainstorm the funniest and most creative workable business idea with your squad.
              </p>
            </div>
          )}
        </GlassPanel>
      )}
    </div>
  );
};
