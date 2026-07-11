'use client';
import { Card, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function ProgressWidget({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <CardTitle>Today's Progress</CardTitle>
        <span className="text-sm font-semibold gradient-text">{pct}%</span>
      </div>
      <ProgressBar value={pct} />
      <p className="text-xs text-ink-muted mt-2">
        {completed} of {total} task{total !== 1 ? 's' : ''} completed today
      </p>
    </Card>
  );
}
