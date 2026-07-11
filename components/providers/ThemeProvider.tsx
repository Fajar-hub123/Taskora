'use client';
import { useEffect } from 'react';
import { useSettingsStore } from '@/lib/store/settingsStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);
  const layout = useSettingsStore((s) => s.layout);
  const lang = useSettingsStore((s) => s.lang);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-pink', 'theme-blue');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    document.body.classList.remove('layout-compact', 'layout-comfortable');
    document.body.classList.add(`layout-${layout}`);
  }, [layout]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ur' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  return <>{children}</>;
}
