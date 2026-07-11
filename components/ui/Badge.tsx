import clsx from 'clsx';
import { ReactNode } from 'react';

const priorityColors: Record<string, string> = {
  Low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  High: 'bg-red-500/15 text-red-400 border-red-500/30'
};

export function PriorityBadge({ priority }: { priority: 'Low' | 'Medium' | 'High' }) {
  return (
    <span className={clsx('text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border', priorityColors[priority])}>
      {priority}
    </span>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-3 border border-border text-ink-muted', className)}>
      {children}
    </span>
  );
}
