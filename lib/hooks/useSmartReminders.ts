'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useTaskStore } from '@/lib/store/taskStore';
import { todayISO } from '@/lib/utils/date';
import { isSameDay, parseISO, differenceInMinutes } from 'date-fns';

function notify(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icons/icon-192.png' });
  }
}

export function useSmartReminders() {
  const userId = useAuthStore((s) => s.currentUserId);
  const user = useAuthStore((s) => s.currentUser());
  const tasks = useTaskStore((s) => s.tasks);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const firedKey = 'taskora-notified-' + userId;
    const already: string[] = JSON.parse(sessionStorage.getItem(firedKey) ?? '[]');

    function markFired(id: string) {
      already.push(id);
      sessionStorage.setItem(firedKey, JSON.stringify(already));
    }

    const interval = setInterval(() => {
      const now = new Date();
      const today = todayISO();
      const myTasks = tasks.filter((t) => t.ownerId === userId && !t.archived);

      // Reminder-enabled tasks starting soon
      myTasks.forEach((t) => {
        if (!t.reminder || t.status === 'completed' || t.date !== today) return;
        const key = 'reminder-' + t.id;
        if (already.includes(key)) return;
        const [h, m] = t.startTime.split(':').map(Number);
        const start = new Date();
        start.setHours(h, m, 0, 0);
        const minsUntil = differenceInMinutes(start, now);
        if (minsUntil <= t.reminderMinutesBefore && minsUntil >= 0) {
          notify('Upcoming: ' + t.title, `Starts at ${t.startTime}`);
          markFired(key);
        }
      });

      // Overdue tasks (once per session)
      const overdue = myTasks.filter((t) => t.status === 'pending' && t.date < today);
      if (overdue.length > 0 && !already.includes('overdue-batch')) {
        notify('Overdue tasks', `You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}.`);
        markFired('overdue-batch');
      }

      // Exam reminders (1 day before)
      myTasks
        .filter((t) => t.isExam && t.date > today)
        .forEach((t) => {
          const key = 'exam-' + t.id;
          if (already.includes(key)) return;
          const daysLeft = Math.round((parseISO(t.date).getTime() - now.getTime()) / 86400000);
          if (daysLeft <= 1) {
            notify('Exam tomorrow: ' + t.title, 'Good luck — you\u2019ve got this.');
            markFired(key);
          }
        });

      // Birthday reminder
      if (user?.dob && !already.includes('birthday-' + today)) {
        const dob = parseISO(user.dob);
        if (dob.getDate() === now.getDate() && dob.getMonth() === now.getMonth()) {
          notify('Happy Birthday! 🎉', 'Wishing you a great year ahead.');
          markFired('birthday-' + today);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, user, tasks]);
}
