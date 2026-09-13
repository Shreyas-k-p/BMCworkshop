import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToLobbyMessages, LobbyMessage } from '../../firebase/messageService';
import { DepartmentBadge } from './DepartmentBadge';
import { MessageSquare, Sparkles } from 'lucide-react';
import { Department } from '../../types';

interface Props {
  sessionId: string;
}

interface FloatingBubble extends LobbyMessage {
  xPosition: number; // Random horizontal position percentage (10% to 75%)
}

export const FloatingMessagesOverlay: React.FC<Props> = ({ sessionId }) => {
  const [messages, setMessages] = useState<FloatingBubble[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = subscribeToLobbyMessages(sessionId, (newMsg) => {
      const bubble: FloatingBubble = {
        ...newMsg,
        xPosition: Math.floor(Math.random() * 60) + 15 // 15% to 75% across screen
      };

      setMessages((prev) => [...prev.slice(-15), bubble]); // Keep last 15 active
    });

    return () => unsubscribe();
  }, [sessionId]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 120, scale: 0.8 }}
            animate={{
              opacity: [0, 1, 1, 0.9, 0],
              y: [-20, -180, -340, -480],
              scale: [0.85, 1, 1, 0.95, 0.9]
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 6, ease: 'easeOut' }}
            onAnimationComplete={() => {
              setMessages((prev) => prev.filter((m) => m.id !== msg.id));
            }}
            style={{ left: `${msg.xPosition}%` }}
            className="absolute bottom-10 transform -translate-x-1/2"
          >
            <div className="p-3.5 rounded-2xl bg-navy-900/90 border border-cyan-400/60 backdrop-blur-xl shadow-2xl shadow-cyan-500/20 max-w-xs space-y-1.5 text-left pointer-events-auto">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5 truncate">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                    <MessageSquare className="w-3 h-3" />
                  </div>
                  <span className="font-extrabold text-white text-xs truncate">
                    {msg.senderName}
                  </span>
                </div>
                <DepartmentBadge department={msg.senderDept as Department} size="sm" />
              </div>

              <div className="text-sm font-bold text-cyan-200 break-words flex items-center gap-1">
                <span>{msg.text}</span>
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0 inline" />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
