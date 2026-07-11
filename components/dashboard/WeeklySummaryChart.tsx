'use client';
import { Card, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function WeeklySummaryChart({ data }: { data: { day: string; completed: number; total: number }[] }) {
  return (
    <Card>
      <CardTitle className="mb-3">Weekly Summary</CardTitle>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: 'rgb(var(--ink-muted))', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgb(var(--ink-muted))', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: 'rgb(var(--surface-3))',
                border: '1px solid rgb(var(--border))',
                borderRadius: 8,
                fontSize: 12
              }}
            />
            <Bar dataKey="total" fill="rgb(var(--border))" radius={[4, 4, 0, 0]} name="Total" />
            <Bar dataKey="completed" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
