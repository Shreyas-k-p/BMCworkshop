import React, { useState } from 'react';
import { Department, DEPARTMENTS } from '../../types';
import { GlassPanel } from '../common/GlassPanel';
import { User, LogIn, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  initialCode?: string;
  onJoin: (code: string, name: string, department: Department) => Promise<void>;
}

export const StudentJoin: React.FC<Props> = ({ initialCode = '', onJoin }) => {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<Department>('CSE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a session code');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onJoin(code.trim().toUpperCase(), name.trim(), department);
    } catch (err: any) {
      console.error('[StudentJoin] Join error:', err);
      setError(err.message || 'Unable to join session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Student Mobile Portal
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            JOIN <span className="text-cyan-400">BMC LIVE</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Business Model Canvas Classroom Competition
          </p>
        </div>

        <GlassPanel glow className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs uppercase font-extrabold text-slate-300 tracking-wider block">
                SESSION CODE
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. BMC7K4P"
                maxLength={10}
                required
                className="w-full px-4 py-3.5 rounded-xl bg-navy-950 border border-slate-700 text-cyan-400 font-mono font-black text-xl tracking-widest text-center focus:outline-none focus:border-cyan-400 transition-colors uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase font-extrabold text-slate-300 tracking-wider block">
                YOUR FULL NAME
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={40}
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-navy-950 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase font-extrabold text-slate-300 tracking-wider block">
                ENGINEERING DEPARTMENT
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DEPARTMENTS.map((d) => {
                  const isSelected = department === d;
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setDepartment(d)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all border ${
                        isSelected
                          ? 'bg-cyan-500 text-navy-950 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-105'
                          : 'bg-navy-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl font-black text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-xl shadow-cyan-500/25 transition-all transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-navy-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  JOIN SESSION
                </>
              )}
            </button>
          </form>
        </GlassPanel>
      </div>
    </div>
  );
};
