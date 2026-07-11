'use client';
import { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/store/authStore';
import { useTaskStore } from '@/lib/store/taskStore';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { ClockCard } from '@/components/dashboard/ClockCard';
import { TaskListWidget } from '@/components/dashboard/TaskListWidget';
import { RecentActivityWidget } from '@/components/dashboard/RecentActivityWidget';
import { ProgressWidget } from '@/components/dashboard/ProgressWidget';
import { WeeklySummaryChart } from '@/components/dashboard/WeeklySummaryChart';
import { LifeBalanceMeter } from '@/components/dashboard/LifeBalanceMeter';
import { QuoteWidget } from '@/components/dashboard/QuoteWidget';
import { TaskModal } from '@/components/tasks/TaskModal';
import { UndoBar } from '@/components/tasks/UndoBar';
import { todayISO } from '@/lib/utils/date';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

function minutesBetween(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  return diff > 0 ? diff : 0;
}

export default function DashboardPage() {
  const userId = useRequireAuth();
  const user = useAuthStore((s) => s.currentUser());
  const tasksAll = useTaskStore((s) => s.tasks);
  const categories = useTaskStore((s) => s.categoriesForOwner(userId ?? ''));
  const activity = useTaskStore((s) => s.activity);

  const tasks = useMemo(() => tasksAll.filter((t) => t.ownerId === userId && !t.archived && t.date !== ''), [tasksAll, userId]);

  const today = todayISO();
  const todayTasks = useMemo(() => tasks.filter((t) => t.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime)), [tasks, today]);
  const upcomingTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.date > today && t.status !== 'completed')
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 10),
    [tasks, today]
  );

  const todayCompleted = todayTasks.filter((t) => t.status === 'completed').length;

  const weeklyData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
    return days.map((d) => {
      const dayTasks = tasks.filter((t) => isSameDay(parseISO(t.date), d));
      return {
        day: format(d, 'EEE'),
        total: dayTasks.length,
        completed: dayTasks.filter((t) => t.status === 'completed').length
      };
    });
  }, [tasks]);

  const lifeBalance = useMemo(() => {
    const groups: Record<string, number> = { Education: 0, Entertainment: 0, Personal: 0 };
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    tasks
      .filter((t) => t.date >= weekAgo && t.status === 'completed')
      .forEach((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        const group = cat?.group ?? 'Personal';
        const mins = minutesBetween(t.startTime, t.endTime) || 30;
        if (group === 'Custom') groups.Personal += mins;
        else groups[group] = (groups[group] ?? 0) + mins;
      });
    return Object.entries(groups).map(([name, minutes]) => ({ name, minutes }));
  }, [tasks, categories]);

  const recentActivity = useMemo(() => activity.filter((a) => a.ownerId === userId), [activity, userId]);

  if (!userId || !user) return null;

  return (
    <AppShell>
      <TaskModal />
      <UndoBar />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ProfileCard user={user} />
        <ClockCard firstName={user.fullName.split(' ')[0]} />
        <ProgressWidget completed={todayCompleted} total={todayTasks.length} />

        <div className="lg:col-span-2">
          <TaskListWidget title="Today's Tasks" tasks={todayTasks} categories={categories} emptyText="No tasks scheduled for today. Enjoy the calm, or add one." />
        </div>
        <QuoteWidget />

        <TaskListWidget title="Upcoming Tasks" tasks={upcomingTasks} categories={categories} emptyText="Nothing coming up yet." showDate />
        <WeeklySummaryChart data={weeklyData} />
        <LifeBalanceMeter balance={lifeBalance} />

        <div className="lg:col-span-3">
          <RecentActivityWidget items={recentActivity} />
        </div>
      </div>
    </AppShell>
  );
}
