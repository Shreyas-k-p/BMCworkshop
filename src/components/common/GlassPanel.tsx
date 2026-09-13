import React from 'react';
import { motion } from 'framer-motion';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  glow = false,
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onClick={onClick}
      className={`relative backdrop-blur-xl bg-navy-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-2xl overflow-hidden ${
        glow ? 'border-cyan-500/40 shadow-cyan-500/10 shadow-2xl' : ''
      } ${onClick ? 'cursor-pointer hover:border-slate-700 transition-all' : ''} ${className}`}
    >
      {glow && (
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      )}
      {children}
    </motion.div>
  );
};
