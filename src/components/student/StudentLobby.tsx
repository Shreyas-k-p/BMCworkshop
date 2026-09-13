import React, { useState } from 'react';
import { Participant, Session } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { DepartmentBadge } from '../common/DepartmentBadge';
import { CheckCircle2, Clock, Users, Send, MessageSquare, Sparkles } from 'lucide-react';
import { sendLobbyMessage } from '../../firebase/messageService';
import { soundEffects } from '../../utils/soundEffects';

interface Props {
  participant: Participant;
  session: Session;
}

const QUICK_REACTIONS = [
  '🚀 Ready to win!',
  '🔥 Let\'s go!',
  '💡 Big ideas coming!',
  '⚡ High energy!',
  '🏆 Team ready!'
];

export const StudentLobby: React.FC<Props> = ({ participant, session }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const isGrouping = session.uiState === 'GROUPING';

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || message).trim();
    if (!text || sending) return;

    setSending(true);
    try {
      await sendLobbyMessage(session.id, participant.uid, participant.name, participant.department, text);
      soundEffects.playCuriousShuffle();
      setLastSent(text);
      if (!textToSend) setMessage('');
    } catch (err) {
      console.error('[StudentLobby] Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 pb-12">
      <div className="w-full max-w-md space-y-6 text-center">
        <GlassPanel glow className="p-8 space-y-6">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
              SUCCESSFULLY CONNECTED
            </span>
            <h2 className="text-3xl font-black text-white">YOU'RE IN!</h2>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">STUDENT NAME</span>
              <span className="text-base font-extrabold text-white">{participant.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">DEPARTMENT</span>
              <DepartmentBadge department={participant.department} />
            </div>
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase">SESSION CODE</span>
              <span className="text-sm font-mono font-bold text-cyan-400">{session.code}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-center gap-2 text-cyan-400 font-extrabold text-sm uppercase tracking-wider">
              {isGrouping ? (
                <>
                  <Users className="w-4 h-4 animate-bounce" />
                  TEAM FORMATION IN PROGRESS...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  WAITING FOR TEAMS...
                </>
              )}
            </div>
            <p className="text-slate-400 text-xs">
              The host will form balanced teams shortly. Send a live hype message below!
            </p>
          </div>

          {/* Floating Hype Chat Input Section */}
          <div className="p-4 rounded-2xl bg-navy-950 border border-cyan-500/30 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>SEND HYPE MESSAGE TO PROJECTOR SCREEN</span>
            </div>

            {/* Quick Reactions */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REACTIONS.map((rx, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(rx)}
                  disabled={sending}
                  className="px-2.5 py-1 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-xs font-bold text-slate-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {rx}
                </button>
              ))}
            </div>

            {/* Text Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a hype message..."
                maxLength={60}
                className="flex-1 bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => handleSend()}
                disabled={!message.trim() || sending}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-black text-xs rounded-xl flex items-center gap-1 transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {lastSent && (
              <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 inline" /> Sent to projector screen: "{lastSent}"
              </p>
            )}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};
