import { create } from 'zustand';

interface UIState {
  addTaskOpen: boolean;
  editingTaskId: string | null;
  creatingBacklogTask: boolean;
  newTaskDate: string | null;
  searchQuery: string;
  openAddTask: (backlogOrDate?: boolean | string) => void;
  openEditTask: (id: string) => void;
  closeTaskModal: () => void;
  setSearchQuery: (q: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  addTaskOpen: false,
  editingTaskId: null,
  creatingBacklogTask: false,
  newTaskDate: null,
  searchQuery: '',
  openAddTask: (backlogOrDate = false) =>
    set({
      addTaskOpen: true,
      editingTaskId: null,
      creatingBacklogTask: typeof backlogOrDate === 'boolean' ? backlogOrDate : false,
      newTaskDate: typeof backlogOrDate === 'string' ? backlogOrDate : null
    }),
  openEditTask: (id) => set({ addTaskOpen: true, editingTaskId: id, creatingBacklogTask: false, newTaskDate: null }),
  closeTaskModal: () => set({ addTaskOpen: false, editingTaskId: null, creatingBacklogTask: false, newTaskDate: null }),
  setSearchQuery: (q) => set({ searchQuery: q })
}));
