'use client';
import { Card, CardTitle } from '@/components/ui/Card';
import { Task, Category } from '@/lib/types';
import { PriorityBadge } from '@/components/ui/Badge';
import { useTaskStore } from '@/lib/store/taskStore';
import { useConfetti } from '@/lib/hooks/useConfetti';
import { Check } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export function TaskListWidget({
  title,
  tasks,
  categories,
  emptyText,
  showDate = false
}: {
  title: string;
  tasks: Task[];
  categories: Category[];
  emptyText: string;
  showDate?: boolean;
}) {
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const burst = useConfetti();

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <CardTitle>{title}</CardTitle>
        <Link href="/tasks" className="text-xs text-accent hover:underline">
          View all
        </Link>
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-ink-muted py-4 text-center">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {tasks.slice(0, 6).map((task) => {
            const cat = categories.find((c) => c.id === task.categoryId);
            const completed = task.status === 'completed';
            return (
              <div key={task.id} className="flex items-center gap-3 py-1.5">
                <button
                  onClick={() => {
                    const willComplete = !completed;
                    toggleComplete(task.id);
                    if (willComplete) burst();
                  }}
                  className={clsx(
                    'h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center',
                    completed ? 'bg-gradient-to-br from-violet-500 to-mint-500 border-transparent' : 'border-border'
                  )}
                >
                  {completed && <Check size={11} className="text-white" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={clsx('text-sm truncate', completed && 'line-through text-ink-muted')}>{task.title}</p>
                  <p className="text-[11px] text-ink-muted truncate">
                    {cat?.name ?? 'No category'} {showDate ? `· ${task.date}` : `· ${task.startTime}`}
                  </p>
                </div>
                <PriorityBadge priority={task.priority} />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
