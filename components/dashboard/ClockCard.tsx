'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { formatNiceDate, formatTime12, greeting } from '@/lib/utils/date';
import { useSettingsStore } from '@/lib/store/settingsStore';

export function ClockCard({ firstName }: { firstName: string }) {
  const [now, setNow] = useState<Date | null>(null);
  const lang = useSettingsStore((s) => s.lang);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="flex flex-col justify-center">
      <p className="text-sm text-ink-muted">
        {greeting(now ?? new Date(), lang)}, <span className="text-ink font-medium">{firstName}</span>
      </p>
      <p className="font-display text-3xl font-semibold tabular-nums mt-1">{now ? formatTime12(now) : '--:--:-- --'}</p>
      <p className="text-xs text-ink-muted mt-1">{now ? formatNiceDate(now) : ''}</p>
    </Card>
  );
}
