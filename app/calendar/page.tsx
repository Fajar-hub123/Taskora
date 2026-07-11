'use client';
import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useTaskStore } from '@/lib/store/taskStore';
import { TaskModal } from '@/components/tasks/TaskModal';
import { UndoBar } from '@/components/tasks/UndoBar';
import { useUIStore } from '@/lib/store/uiStore';
import { Button } from '@/components/ui/Button';
import { DayCell } from '@/components/calendar/DayCell';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addDays,
  differenceInCalendarDays,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { TaskRow } from '@/components/tasks/TaskRow';
import { todayISO } from '@/lib/utils/date';

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarPage() {
  const userId = useRequireAuth();
  const tasksAll = useTaskStore((s) => s.tasks);
  const categories = useTaskStore((s) => s.categoriesForOwner(userId ?? ''));
  const moveTaskToDate = useTaskStore((s) => s.moveTaskToDate);
  const openAddTask = useUIStore((s) => s.openAddTask);
  const openEditTask = useUIStore((s) => s.openEditTask);

  const [view, setView] = useState<ViewMode>('month');
  const [cursor, setCursor] = useState(new Date());

  const tasks = useMemo(() => tasksAll.filter((t) => t.ownerId === userId && !t.archived), [tasksAll, userId]);

  const monthStart = startOfMonth(cursor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(endOfMonth(cursor));
  const monthDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weekStart = startOfWeek(cursor);
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(cursor) });

  const examCountdown = useMemo(() => {
    const today = todayISO();
    return tasks
      .filter((t) => t.isExam && t.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3)
      .map((t) => ({ ...t, daysLeft: differenceInCalendarDays(parseISO(t.date), new Date()) }));
  }, [tasks]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    moveTaskToDate(String(active.id), String(over.id));
  }

  function tasksOn(dateStr: string) {
    return tasks.filter((t) => t.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  return (
    <AppShell>
      <TaskModal />
      <UndoBar />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-semibold">Calendar</h1>
        <div className="flex items-center gap-2">
          {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`h-8 px-3 rounded-lg text-xs font-medium capitalize border ${
                view === v ? 'bg-accent/20 border-accent/40 text-ink' : 'border-border text-ink-muted hover:bg-surface-3'
              }`}
            >
              {v}
            </button>
          ))}
          <Button size="sm" onClick={openAddTask}>
            + New task
          </Button>
        </div>
      </div>

      {examCountdown.length > 0 && (
        <div className="mb-6 flex gap-3 flex-wrap">
          {examCountdown.map((e) => (
            <div key={e.id} className="glass rounded-xl px-4 py-2.5 flex items-center gap-2.5">
              <GraduationCap size={16} className="text-red-400" />
              <div>
                <p className="text-sm font-medium">{e.title}</p>
                <p className="text-[11px] text-ink-muted">
                  {e.daysLeft === 0 ? 'Today' : `${e.daysLeft} day${e.daysLeft !== 1 ? 's' : ''} left`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCursor(view === 'month' ? subMonths(cursor, 1) : addDays(cursor, view === 'week' ? -7 : -1))} className="p-2 rounded-lg hover:bg-surface-3">
          <ChevronLeft size={18} />
        </button>
        <p className="font-display font-medium">
          {view === 'day' ? format(cursor, 'EEEE, MMMM d, yyyy') : format(cursor, 'MMMM yyyy')}
        </p>
        <button onClick={() => setCursor(view === 'month' ? addMonths(cursor, 1) : addDays(cursor, view === 'week' ? 7 : 1))} className="p-2 rounded-lg hover:bg-surface-3">
          <ChevronRight size={18} />
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        {view === 'month' && (
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs text-ink-muted font-medium pb-1">
                {d}
              </div>
            ))}
            {monthDays.map((d) => (
              <DayCell
                key={d.toISOString()}
                date={d}
                monthRef={cursor}
                tasks={tasksOn(format(d, 'yyyy-MM-dd'))}
                onSelect={openEditTask}
                onAdd={openAddTask}
              />
            ))}
          </div>
        )}

        {view === 'week' && (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((d) => {
              const dateStr = format(d, 'yyyy-MM-dd');
              return (
                <div key={dateStr} className="space-y-2">
                  <p className="text-xs font-medium text-ink-muted">{format(d, 'EEE d')}</p>
                  <div className="space-y-2">
                    {tasksOn(dateStr).map((t) => (
                      <TaskRow key={t.id} task={t} category={categories.find((c) => c.id === t.categoryId)} />
                    ))}
                    {tasksOn(dateStr).length === 0 && <p className="text-[11px] text-ink-muted">No tasks</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DndContext>

      {view === 'day' && (
        <div className="space-y-2">
          {tasksOn(format(cursor, 'yyyy-MM-dd')).map((t) => (
            <TaskRow key={t.id} task={t} category={categories.find((c) => c.id === t.categoryId)} />
          ))}
          {tasksOn(format(cursor, 'yyyy-MM-dd')).length === 0 && <p className="text-sm text-ink-muted text-center py-10">No tasks on this day.</p>}
        </div>
      )}
    </AppShell>
  );
}
