import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, RecentActivity, Task, TaskStatus } from '../types';
import { makeId } from '../utils/id';
import { DEFAULT_CATEGORIES } from '../defaultCategories';
import { todayISO } from '../utils/date';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  activity: RecentActivity[];
  lastDeleted: Task | null;

  ensureSeedCategories: (ownerId: string) => void;

  addTask: (ownerId: string, input: Partial<Task> & { title: string }) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  undoDelete: () => void;
  duplicateTask: (id: string) => void;
  togglePin: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleComplete: (id: string) => void;
  archiveTask: (id: string) => void;
  restoreTask: (id: string) => void;
  reorderTasks: (orderedIds: string[]) => void;
  moveTaskToDate: (id: string, date: string) => void;

  addCategory: (ownerId: string, cat: Partial<Category> & { name: string }) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (orderedIds: string[]) => void;

  logActivity: (ownerId: string, type: RecentActivity['type'], taskTitle: string) => void;

  tasksForOwner: (ownerId: string) => Task[];
  categoriesForOwner: (ownerId: string) => Category[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      categories: [],
      activity: [],
      lastDeleted: null,

      ensureSeedCategories: (ownerId) => {
        const existing = get().categories.filter((c) => c.ownerId === ownerId);
        if (existing.length > 0) return;
        const seeded = DEFAULT_CATEGORIES.map((c) => ({ ...c, id: makeId(), ownerId }));
        set({ categories: [...get().categories, ...seeded] });
      },

      addTask: (ownerId, input) => {
        const task: Task = {
          id: makeId(),
          ownerId,
          title: input.title,
          description: input.description ?? '',
          categoryId: input.categoryId ?? '',
          subcategory: input.subcategory ?? '',
          date: input.date === undefined ? todayISO() : input.date,
          startTime:
            input.date === '' ? input.startTime ?? '' : input.startTime ?? '09:00',
          endTime:
            input.date === '' ? input.endTime ?? '' : input.endTime ?? '10:00',
          priority: input.priority ?? 'Medium',
          reminder: input.reminder ?? false,
          reminderMinutesBefore: input.reminderMinutesBefore ?? 10,
          notes: input.notes ?? '',
          tags: input.tags ?? [],
          favorite: input.favorite ?? false,
          status: input.status ?? 'pending',
          pinned: input.pinned ?? false,
          archived: false,
          repeat: input.repeat ?? 'none',
          isExam: input.isExam ?? false,
          createdAt: new Date().toISOString(),
          order: get().tasks.length
        };
        set({ tasks: [...get().tasks, task] });
        get().logActivity(ownerId, 'created', task.title);
        return task;
      },

      updateTask: (id, patch) => {
        const before = get().tasks.find((t) => t.id === id);
        set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
        if (before) get().logActivity(before.ownerId, 'edited', patch.title ?? before.title);
      },

      deleteTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        set({ tasks: get().tasks.filter((t) => t.id !== id), lastDeleted: task });
        get().logActivity(task.ownerId, 'deleted', task.title);
      },

      undoDelete: () => {
        const { lastDeleted, tasks } = get();
        if (!lastDeleted) return;
        set({ tasks: [...tasks, lastDeleted], lastDeleted: null });
        get().logActivity(lastDeleted.ownerId, 'restored', lastDeleted.title);
      },

      duplicateTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        const copy: Task = {
          ...task,
          id: makeId(),
          title: task.title + ' (copy)',
          status: 'pending',
          createdAt: new Date().toISOString(),
          order: get().tasks.length,
          tags: task.tags ?? [],
          favorite: task.favorite ?? false
        };
        set({ tasks: [...get().tasks, copy] });
        get().logActivity(task.ownerId, 'created', copy.title);
      },

      togglePin: (id) => {
        set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)) });
      },
      toggleFavorite: (id) => {
        set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t)) });
      },

      toggleComplete: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        const nowCompleted = task.status !== 'completed';
        const status: TaskStatus = nowCompleted ? 'completed' : 'pending';
        set({
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, status, completedAt: nowCompleted ? new Date().toISOString() : undefined } : t
          )
        });
        if (nowCompleted) get().logActivity(task.ownerId, 'completed', task.title);
      },

      archiveTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, archived: true } : t)) });
        get().logActivity(task.ownerId, 'archived', task.title);
      },

      restoreTask: (id) => {
        set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, archived: false } : t)) });
      },

      reorderTasks: (orderedIds) => {
        const map = new Map(orderedIds.map((id, idx) => [id, idx]));
        set({
          tasks: get().tasks.map((t) => (map.has(t.id) ? { ...t, order: map.get(t.id)! } : t))
        });
      },

      moveTaskToDate: (id, date) => {
        const task = get().tasks.find((t) => t.id === id);
        set({
          tasks: get().tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  date,
                  startTime: date && !t.startTime ? '09:00' : t.startTime,
                  endTime: date && !t.endTime ? '10:00' : t.endTime
                }
              : t
          )
        });
      },

      addCategory: (ownerId, cat) => {
        const category: Category = {
          id: makeId(),
          ownerId,
          name: cat.name,
          group: cat.group ?? 'Custom',
          color: cat.color ?? '#8b5cf6',
          icon: cat.icon ?? 'Folder',
          subcategories: cat.subcategories ?? [],
          order: get().categories.filter((c) => c.ownerId === ownerId).length
        };
        set({ categories: [...get().categories, category] });
      },

      updateCategory: (id, patch) => {
        set({ categories: get().categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
      },

      deleteCategory: (id) => {
        set({ categories: get().categories.filter((c) => c.id !== id) });
      },

      reorderCategories: (orderedIds) => {
        const map = new Map(orderedIds.map((id, idx) => [id, idx]));
        set({
          categories: get().categories.map((c) => (map.has(c.id) ? { ...c, order: map.get(c.id)! } : c))
        });
      },

      logActivity: (ownerId, type, taskTitle) => {
        const entry: RecentActivity = {
          id: makeId(),
          ownerId,
          type,
          taskTitle,
          timestamp: new Date().toISOString()
        };
        set({ activity: [entry, ...get().activity].slice(0, 200) });
      },

      tasksForOwner: (ownerId) => get().tasks.filter((t) => t.ownerId === ownerId),
      categoriesForOwner: (ownerId) =>
        get()
          .categories.filter((c) => c.ownerId === ownerId)
          .sort((a, b) => a.order - b.order)
    }),
    { name: 'taskora-tasks' }
  )
);
