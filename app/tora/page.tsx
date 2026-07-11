'use client';
import { useMemo, useRef, useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useTaskStore } from '@/lib/store/taskStore';
import { ToraLogo } from '@/components/logo/ToraLogo';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { todayISO } from '@/lib/utils/date';
import { Send, Split, Clock, CalendarClock, BookOpenCheck, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const QUICK_ACTIONS = [
  { icon: Split, label: 'Break down a task', prompt: 'Help me break down my biggest task today into smaller steps.' },
  { icon: Clock, label: 'Estimate duration', prompt: 'How long should my pending tasks realistically take?' },
  { icon: CalendarClock, label: 'Best time to work', prompt: 'What is the best time of day for me to do focused study?' },
  { icon: BookOpenCheck, label: 'Study plan for exam', prompt: 'Generate a study plan for my upcoming exam.' },
  { icon: TrendingUp, label: 'Weekly summary', prompt: 'Give me a summary of how productive I was this week.' }
];

export default function ToraPage() {
  const userId = useRequireAuth();
  const tasksAll = useTaskStore((s) => s.tasks);
  const categories = useTaskStore((s) => s.categoriesForOwner(userId ?? ''));

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hi, I'm Tora — your productivity co-pilot. Ask me to break down a task, plan for an exam, or tell you when to work best." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const contextSummary = useMemo(() => {
    const tasks = tasksAll.filter((t) => t.ownerId === userId && !t.archived);
    const today = todayISO();
    const todays = tasks.filter((t) => t.date === today);
    const upcoming = tasks.filter((t) => t.date > today && t.status !== 'completed').slice(0, 8);
    const exams = tasks.filter((t) => t.isExam && t.date >= today);
    const lines = [
      `Today (${today}): ${todays.map((t) => `${t.title} [${t.priority}, ${t.startTime}-${t.endTime}]`).join('; ') || 'none'}`,
      `Upcoming: ${upcoming.map((t) => `${t.title} on ${t.date}`).join('; ') || 'none'}`,
      `Exams: ${exams.map((t) => `${t.title} on ${t.date}`).join('; ') || 'none'}`,
      `Categories: ${categories.map((c) => c.name).join(', ')}`
    ];
    return lines.join('\n');
  }, [tasksAll, userId, categories]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/tora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context: contextSummary })
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', text: data.reply ?? data.error ?? 'Something went wrong.' }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'I had trouble connecting. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6">
        <ToraLogo size={40} />
        <div>
          <h1 className="font-display text-2xl font-semibold">Tora</h1>
          <p className="text-ink-muted text-sm">Your AI productivity assistant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1 space-y-2">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => send(a.prompt)}
              className="w-full flex items-center gap-2.5 text-left text-sm rounded-xl border border-border bg-surface-2/60 px-3.5 py-3 hover:bg-surface-3/60 transition-colors"
            >
              <a.icon size={16} className="text-accent shrink-0" />
              {a.label}
            </button>
          ))}
        </div>

        <Card className="lg:col-span-3 flex flex-col h-[70vh]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((m, i) => (
              <div key={i} className={clsx('flex gap-2.5', m.role === 'user' && 'flex-row-reverse')}>
                {m.role === 'assistant' && <ToraLogo size={28} />}
                <div
                  className={clsx(
                    'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed',
                    m.role === 'user' ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white' : 'bg-surface-3'
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5">
                <ToraLogo size={28} />
                <div className="bg-surface-3 rounded-2xl px-4 py-2.5 text-sm text-ink-muted animate-pulse">Thinking…</div>
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 mt-4 pt-4 border-t border-border"
          >
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Tora anything about your tasks…" />
            <Button type="submit" size="icon" disabled={loading}>
              <Send size={16} />
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
