'use client';
import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useTaskStore } from '@/lib/store/taskStore';
import { Card, CardTitle } from '@/components/ui/Card';
import { Input, Label, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';
import { exportTasksCSV, exportTasksPDF } from '@/lib/utils/export';
import { FileDown, FileText } from 'lucide-react';

const PALETTE = ['#8b5cf6', '#3b82f6', '#2dd4bf', '#f472b6', '#f59e0b', '#ef4444', '#22c55e', '#eab308'];

function minutesBetween(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  return diff > 0 ? diff : 0;
}

export default function ReportsPage() {
  const userId = useRequireAuth();
  const tasksAll = useTaskStore((s) => s.tasks);
  const categories = useTaskStore((s) => s.categoriesForOwner(userId ?? ''));

  const [from, setFrom] = useState(format(subDays(new Date(), 13), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const tasks = useMemo(
    () => tasksAll.filter((t) => t.ownerId === userId && !t.archived && t.date >= from && t.date <= to),
    [tasksAll, userId, from, to]
  );

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const missed = tasks.filter((t) => t.status === 'missed' || (t.status === 'pending' && t.date < format(new Date(), 'yyyy-MM-dd'))).length;
  const hoursSpent = tasks.filter((t) => t.status === 'completed').reduce((sum, t) => sum + minutesBetween(t.startTime, t.endTime), 0) / 60;

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      const key = cat?.name ?? 'Uncategorized';
      map[key] = (map[key] ?? 0) + (minutesBetween(t.startTime, t.endTime) || 30);
    });
    return Object.entries(map).map(([name, minutes]) => ({ name, hours: +(minutes / 60).toFixed(1) }));
  }, [tasks, categories]);

  const trend = useMemo(() => {
    try {
      const days = eachDayOfInterval({ start: parseISO(from), end: parseISO(to) });
      return days.map((d) => {
        const dateStr = format(d, 'yyyy-MM-dd');
        const dayTasks = tasks.filter((t) => t.date === dateStr);
        return { date: format(d, 'MMM d'), completed: dayTasks.filter((t) => t.status === 'completed').length };
      });
    } catch {
      return [];
    }
  }, [tasks, from, to]);

  const categoryNames = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-semibold">Reports &amp; Analytics</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportTasksCSV(tasks)}>
            <FileDown size={14} /> CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportTasksPDF(tasks, categoryNames)}>
            <FileText size={14} /> PDF
          </Button>
        </div>
      </div>

      <Card className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <Label htmlFor="from">From</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="to">To</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="gran">Summary</Label>
          <Select id="gran" value={granularity} onChange={(e) => setGranularity(e.target.value as any)} className="w-36">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Tasks', value: total },
          { label: 'Completed', value: completed },
          { label: 'Pending', value: pending },
          { label: 'Missed', value: missed },
          { label: 'Hours Spent', value: hoursSpent.toFixed(1) }
        ].map((s) => (
          <Card key={s.label} className="text-center">
            <p className="font-display text-2xl font-semibold gradient-text">{s.value}</p>
            <p className="text-xs text-ink-muted mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardTitle className="mb-3">Time Spent by Category</CardTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="hours" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgb(var(--surface-3))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-3">Hours by Category</CardTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgb(var(--ink-muted))', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgb(var(--ink-muted))', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgb(var(--surface-3))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle className="mb-3">Completion Trend</CardTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'rgb(var(--ink-muted))', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgb(var(--ink-muted))', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'rgb(var(--surface-3))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="completed" stroke="#2dd4bf" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
