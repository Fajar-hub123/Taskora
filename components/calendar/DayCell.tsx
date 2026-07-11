'use client';
import { Task } from '@/lib/types';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { format, isSameMonth, isToday } from 'date-fns';
import clsx from 'clsx';

function DraggableChip({ task, onSelect }: { task: Task; onSelect: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 20 } : undefined;
  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onSelect(task.id)}
      className={clsx(
        'w-full text-left text-[10px] leading-tight px-1.5 py-1 rounded bg-surface-3 hover:bg-surface-3/70 truncate cursor-grab',
        isDragging && 'opacity-40'
      )}
      title={task.title}
    >
      {task.title}
    </button>
  );
}

export function DayCell({
  date,
  monthRef,
  tasks,
  onSelect,
  onAdd
}: {
  date: Date;
  monthRef: Date;
  tasks: Task[];
  onSelect: (id: string) => void;
  onAdd: (dateStr: string) => void;
}) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const { setNodeRef, isOver } = useDroppable({ id: dateStr });
  const inMonth = isSameMonth(date, monthRef);

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'min-h-[104px] rounded-lg border p-1.5 flex flex-col gap-1 transition-colors',
        isOver ? 'border-accent bg-accent/10' : 'border-border/70',
        !inMonth && 'opacity-40'
      )}
      onDoubleClick={() => onAdd(dateStr)}
    >
      <span
        className={clsx(
          'text-xs font-medium h-5 w-5 rounded-full flex items-center justify-center',
          isToday(date) && 'bg-gradient-to-br from-violet-500 to-mint-500 text-white'
        )}
      >
        {format(date, 'd')}
      </span>
      <div className="space-y-1 overflow-y-auto">
        {tasks.slice(0, 3).map((t) => (
          <DraggableChip key={t.id} task={t} onSelect={onSelect} />
        ))}
        {tasks.length > 3 && <p className="text-[10px] text-ink-muted px-1.5">+{tasks.length - 3} more</p>}
      </div>
    </div>
  );
}
