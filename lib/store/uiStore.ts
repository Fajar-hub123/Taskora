import { create } from 'zustand';

interface UIState {
  addTaskOpen: boolean;
  editingTaskId: string | null;
  searchQuery: string;
  openAddTask: () => void;
  openEditTask: (id: string) => void;
  closeTaskModal: () => void;
  setSearchQuery: (q: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  addTaskOpen: false,
  editingTaskId: null,
  searchQuery: '',
  openAddTask: () => set({ addTaskOpen: true, editingTaskId: null }),
  openEditTask: (id) => set({ addTaskOpen: true, editingTaskId: id }),
  closeTaskModal: () => set({ addTaskOpen: false, editingTaskId: null }),
  setSearchQuery: (q) => set({ searchQuery: q })
}));
