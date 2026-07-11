export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'pending' | 'completed' | 'missed' | 'archived';
export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly';
export type ThemeName = 'dark' | 'light' | 'pink' | 'blue';
export type Layout = 'compact' | 'comfortable';
export type Lang = 'en' | 'ur';

export interface User {
  id: string;
  fullName: string;
  dob: string; // ISO date
  school: string;
  className: string;
  email: string;
  passwordHash: string;
  avatar?: string; // data URL
  createdAt: string;
}

export interface Category {
  id: string;
  ownerId: string;
  name: string;
  group: 'Education' | 'Entertainment' | 'Personal' | 'Custom';
  color: string; // hex
  icon: string; // lucide icon name
  subcategories: string[];
  order: number;
}

export interface Task {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  categoryId: string;
  subcategory: string;
  date: string; // ISO date (yyyy-MM-dd)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  priority: Priority;
  reminder: boolean;
  reminderMinutesBefore: number;
  notes: string;
  status: TaskStatus;
  pinned: boolean;
  archived: boolean;
  repeat: RepeatRule;
  isExam: boolean;
  createdAt: string;
  completedAt?: string;
  order: number;
}

export interface RecentActivity {
  id: string;
  ownerId: string;
  type: 'created' | 'completed' | 'deleted' | 'edited' | 'archived' | 'restored';
  taskTitle: string;
  timestamp: string;
}

export interface AppSettings {
  theme: ThemeName;
  accent: string;
  layout: Layout;
  lang: Lang;
  fontScale: number;
  dashboardBackground?: string;
}
