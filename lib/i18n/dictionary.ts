export const dictionary = {
  en: {
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    calendar: 'Calendar',
    reports: 'Reports',
    tora: 'Tora',
    settings: 'Settings',
    logout: 'Log out',
    todaysTasks: "Today's Tasks",
    upcomingTasks: 'Upcoming Tasks',
    recentActivity: 'Recent Activity',
    weeklySummary: 'Weekly Summary',
    lifeBalance: 'Life Balance Meter',
    addTask: 'Add Task',
    search: 'Search tasks...',
    noTasks: 'No tasks yet. Add your first task to get started.',
    completed: 'Completed',
    pending: 'Pending',
    missed: 'Missed',
    save: 'Save',
    cancel: 'Cancel'
  },
  ur: {
    dashboard: 'ڈیش بورڈ',
    tasks: 'ٹاسکس',
    calendar: 'کیلنڈر',
    reports: 'رپورٹس',
    tora: 'ٹورا',
    settings: 'ترتیبات',
    logout: 'لاگ آؤٹ',
    todaysTasks: 'آج کے ٹاسکس',
    upcomingTasks: 'آنے والے ٹاسکس',
    recentActivity: 'حالیہ سرگرمی',
    weeklySummary: 'ہفتہ وار خلاصہ',
    lifeBalance: 'لائف بیلنس میٹر',
    addTask: 'ٹاسک شامل کریں',
    search: 'ٹاسکس تلاش کریں...',
    noTasks: 'ابھی کوئی ٹاسک نہیں۔ شروع کرنے کے لیے پہلا ٹاسک شامل کریں۔',
    completed: 'مکمل',
    pending: 'زیر التواء',
    missed: 'رہ گیا',
    save: 'محفوظ کریں',
    cancel: 'منسوخ کریں'
  }
} as const;

export type DictKey = keyof typeof dictionary.en;
