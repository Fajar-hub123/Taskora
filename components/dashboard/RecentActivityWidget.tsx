'use client';
import { Card, CardTitle } from '@/components/ui/Card';
import { RecentActivity } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, PlusCircle, Trash2, Pencil, Archive, RotateCcw } from 'lucide-react';

const iconMap = {
  created: PlusCircle,
  completed: CheckCircle2,
  deleted: Trash2,
  edited: Pencil,
  archived: Archive,
  restored: RotateCcw
};

const colorMap = {
  created: 'text-blue-400',
  completed: 'text-mint-400',
  deleted: 'text-red-400',
  edited: 'text-amber-400',
  archived: 'text-ink-muted',
  restored: 'text-violet-400'
};

export function RecentActivityWidget({ items }: { items: RecentActivity[] }) {
  return (
    <Card>
      <CardTitle className="mb-3">Recent Activity</CardTitle>
      {items.length === 0 ? (
        <p className="text-sm text-ink-muted py-4 text-center">Nothing yet — your actions will show up here.</p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 8).map((a) => {
            const Icon = iconMap[a.type];
            return (
              <div key={a.id} className="flex items-start gap-2.5">
                <Icon size={15} className={`${colorMap[a.type]} shrink-0 mt-0.5`} />
                <div className="min-w-0">
                  <p className="text-sm truncate">
                    <span className="capitalize">{a.type}</span> <span className="text-ink-muted">"{a.taskTitle}"</span>
                  </p>
                  <p className="text-[11px] text-ink-muted">{formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
