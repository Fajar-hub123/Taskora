import { create } from 'zustand';

interface UIState {
  addTaskOpen: boolean;
  editingTaskId: string | null;
  creatingBacklogTask: boolean;
  searchQuery: string;
  openAddTask: (backlog?: boolean) => void;
  openEditTask: (id: string) => void;
  closeTaskModal: () => void;
  setSearchQuery: (q: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  addTaskOpen: false,
  editingTaskId: null,
  creatingBacklogTask: false,
  searchQuery: '',
  openAddTask: (backlog = false) => set({ addTaskOpen: true, editingTaskId: null, creatingBacklogTask: backlog }),
  openEditTask: (id) => set({ addTaskOpen: true, editingTaskId: id, creatingBacklogTask: false }),
  closeTaskModal: () => set({ addTaskOpen: false, editingTaskId: null, creatingBacklogTask: false }),
  setSearchQuery: (q) => set({ searchQuery: q })
}));
