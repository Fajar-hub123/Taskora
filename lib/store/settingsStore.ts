import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Layout, Lang, ThemeName } from '../types';

interface SettingsState {
  theme: ThemeName;
  layout: Layout;
  lang: Lang;
  dashboardBackground: string | null;
  widgetOrder: string[];
  setTheme: (t: ThemeName) => void;
  setLayout: (l: Layout) => void;
  setLang: (l: Lang) => void;
  setDashboardBackground: (url: string | null) => void;
  setWidgetOrder: (order: string[]) => void;
}

export const DEFAULT_WIDGET_ORDER = [
  'profile',
  'today',
  'upcoming',
  'progress',
  'balance',
  'weekly',
  'activity',
  'quote'
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      layout: 'comfortable',
      lang: 'en',
      dashboardBackground: null,
      widgetOrder: DEFAULT_WIDGET_ORDER,
      setTheme: (theme) => set({ theme }),
      setLayout: (layout) => set({ layout }),
      setLang: (lang) => set({ lang }),
      setDashboardBackground: (dashboardBackground) => set({ dashboardBackground }),
      setWidgetOrder: (widgetOrder) => set({ widgetOrder })
    }),
    { name: 'taskora-settings' }
  )
);
