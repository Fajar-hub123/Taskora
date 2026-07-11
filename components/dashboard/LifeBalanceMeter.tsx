'use client';
import { Card, CardTitle } from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = { Education: '#8b5cf6', Entertainment: '#2dd4bf', Personal: '#f472b6' };

export function LifeBalanceMeter({ balance }: { balance: { name: string; minutes: number }[] }) {
  const total = balance.reduce((s, b) => s + b.minutes, 0);
  const feedback =
    total === 0
      ? 'Log a few tasks and Tora will tell you how balanced your week looks.'
      : (() => {
          const edu = balance.find((b) => b.name === 'Education')?.minutes ?? 0;
          const ent = balance.find((b) => b.name === 'Entertainment')?.minutes ?? 0;
          if (ent > edu * 1.5) return 'Entertainment is leading this week — maybe carve out more focused study blocks.';
          if (edu > ent * 3) return "You're deep in study mode. Don't forget to schedule downtime to recharge.";
          return "Nice balance between study, downtime and personal time this week.";
        })();

  return (
    <Card>
      <CardTitle className="mb-3">Life Balance Meter</CardTitle>
      <div className="flex items-center gap-4">
        <div className="h-28 w-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={total ? balance : [{ name: 'None', minutes: 1 }]} dataKey="minutes" innerRadius={32} outerRadius={50} paddingAngle={3}>
                {(total ? balance : [{ name: 'None', minutes: 1 }]).map((entry, i) => (
                  <Cell key={i} fill={COLORS[entry.name as keyof typeof COLORS] ?? 'rgb(var(--border))'} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          {balance.map((b) => (
            <div key={b.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[b.name as keyof typeof COLORS] }} />
                {b.name}
              </span>
              <span className="font-medium">{Math.round(b.minutes / 60)}h</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-ink-muted mt-3 pt-3 border-t border-border">{feedback}</p>
    </Card>
  );
}
