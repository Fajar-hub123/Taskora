import { differenceInYears, format, parseISO } from 'date-fns';

export function calcAge(dob: string): number {
  try {
    return differenceInYears(new Date(), parseISO(dob));
  } catch {
    return 0;
  }
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function greeting(date: Date = new Date(), lang: 'en' | 'ur' = 'en'): string {
  const hour = date.getHours();
  if (lang === 'ur') {
    if (hour < 12) return 'صبح بخیر';
    if (hour < 17) return 'دوپہر بخیر';
    return 'شام بخیر';
  }
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function formatNiceDate(date: Date = new Date()): string {
  return format(date, 'EEEE, MMMM d, yyyy');
}

export function formatTime12(date: Date = new Date()): string {
  return format(date, 'hh:mm:ss a');
}
