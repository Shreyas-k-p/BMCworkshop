import React from 'react';
import { Department } from '../../types';

const DEPT_COLORS: Record<Department, { bg: string; text: string; border: string }> = {
  AI: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  CSE: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  CY: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  ME: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  CE: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  ECE: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  EEE: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  IC: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' }
};

interface Props {
  department: Department;
  size?: 'sm' | 'md' | 'lg';
}

export const DepartmentBadge: React.FC<Props> = ({ department, size = 'md' }) => {
  const style = DEPT_COLORS[department] || DEPT_COLORS.CSE;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold tracking-wider',
    lg: 'px-3.5 py-1.5 text-sm font-extrabold tracking-widest'
  }[size];

  return (
    <span className={`inline-flex items-center rounded-lg border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}>
      {department}
    </span>
  );
};
