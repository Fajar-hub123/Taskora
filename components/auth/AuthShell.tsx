import { ReactNode } from 'react';
import { TaskoraMark } from '@/components/logo/TaskoraLogo';

export function AuthShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen theme-dark bg-surface flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[44%] relative overflow-hidden flex-col justify-between p-12 bg-surface-2">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(168,85,247,0.35), transparent 45%), radial-gradient(circle at 80% 30%, rgba(59,130,246,0.3), transparent 45%), radial-gradient(circle at 50% 85%, rgba(45,212,191,0.28), transparent 50%)'
          }}
        />
        <div className="relative flex items-center gap-3">
          <TaskoraMark size={36} />
          <span className="font-display text-xl font-semibold">
            Task<span className="gradient-text">ora</span>
          </span>
        </div>
        <div className="relative">
          <h1 className="font-display text-4xl font-semibold leading-tight mb-4">
            Plan your day.
            <br />
            Balance your life.
            <br />
            <span className="gradient-text">Thrive every week.</span>
          </h1>
          <p className="text-ink-muted text-sm max-w-sm">
            Taskora keeps your school work, your shows, your gym days and your downtime in one calm, honest view —
            with Tora, your AI study & productivity assistant, always one tap away.
          </p>
        </div>
        <div className="relative flex items-center gap-6 text-xs text-ink-muted">
          <span>Tasks &amp; Calendar</span>
          <span className="h-1 w-1 rounded-full bg-ink-muted" />
          <span>Life Balance Meter</span>
          <span className="h-1 w-1 rounded-full bg-ink-muted" />
          <span>Tora AI</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <TaskoraMark size={32} />
            <span className="font-display text-lg font-semibold">
              Task<span className="gradient-text">ora</span>
            </span>
          </div>
          <h2 className="font-display text-2xl font-semibold mb-1">{title}</h2>
          <p className="text-ink-muted text-sm mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
