'use client';
import { Task, Category } from '@/lib/types';
import { PriorityBadge, Badge } from '@/components/ui/Badge';
import { useTaskStore } from '@/lib/store/taskStore';
import { useUIStore } from '@/lib/store/uiStore';
import { useConfetti } from '@/lib/hooks/useConfetti';
import { Check, Pin, Copy, Archive, Trash2, Pencil, GripVertical, GraduationCap } from 'lucide-react';
import clsx from 'clsx';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function TaskRow({ task, category }: { task: Task; category?: Category }) {
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const togglePin = useTaskStore((s) => s.togglePin);
  const duplicateTask = useTaskStore((s) => s.duplicateTask);
  const archiveTask = useTaskStore((s) => s.archiveTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const openEditTask = useUIStore((s) => s.openEditTask);
  const burst = useConfetti();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const completed = task.status === 'completed';

  function handleToggle() {
    const willComplete = !completed;
    toggleComplete(task.id);
    if (willComplete) burst();
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'group flex items-center gap-3 rounded-xl border border-border bg-surface-2/60 px-3 py-3 hover:bg-surface-3/50 transition-colors',
        completed && 'opacity-60'
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={16} />
      </button>

      <button
        onClick={handleToggle}
        className={clsx(
          'h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors',
          completed ? 'bg-gradient-to-br from-violet-500 to-mint-500 border-transparent' : 'border-border hover:border-accent'
        )}
        aria-label="Toggle complete"
      >
        {completed && <Check size={14} className="text-white" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={clsx('text-sm font-medium truncate', completed && 'line-through')}>{task.title}</p>
          {task.pinned && <Pin size={12} className="text-amber-400 shrink-0" />}
          {task.isExam && <GraduationCap size={12} className="text-red-400 shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {category && (
            <Badge>
              <span className="inline-block h-1.5 w-1.5 rounded-full mr-1" style={{ backgroundColor: category.color }} />
              {category.name}
              {task.subcategory ? ` · ${task.subcategory}` : ''}
            </Badge>
          )}
          <PriorityBadge priority={task.priority} />
          {task.startTime && <span className="text-[11px] text-ink-muted">{task.startTime}–{task.endTime}</span>}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => openEditTask(task.id)} className="p-1.5 rounded-md hover:bg-surface-3 text-ink-muted hover:text-ink" title="Edit">
          <Pencil size={14} />
        </button>
        <button onClick={() => togglePin(task.id)} className="p-1.5 rounded-md hover:bg-surface-3 text-ink-muted hover:text-ink" title="Pin">
          <Pin size={14} />
        </button>
        <button onClick={() => duplicateTask(task.id)} className="p-1.5 rounded-md hover:bg-surface-3 text-ink-muted hover:text-ink" title="Duplicate">
          <Copy size={14} />
        </button>
        <button onClick={() => archiveTask(task.id)} className="p-1.5 rounded-md hover:bg-surface-3 text-ink-muted hover:text-ink" title="Archive">
          <Archive size={14} />
        </button>
        <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-md hover:bg-surface-3 text-ink-muted hover:text-red-400" title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
