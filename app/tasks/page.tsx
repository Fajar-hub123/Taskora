'use client';
import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/store/authStore';
import { useTaskStore } from '@/lib/store/taskStore';
import { useUIStore } from '@/lib/store/uiStore';
import { TaskRow } from '@/components/tasks/TaskRow';
import { TaskModal } from '@/components/tasks/TaskModal';
import { UndoBar } from '@/components/tasks/UndoBar';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Inbox, Archive as ArchiveIcon } from 'lucide-react';

type SortKey = 'date' | 'priority' | 'category' | 'status';

export default function TasksPage() {
  const userId = useRequireAuth();
  const openAddTask = useUIStore((s) => s.openAddTask);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const tasksAll = useTaskStore((s) => s.tasks);
  const categories = useTaskStore((s) => s.categoriesForOwner(userId ?? ''));
  const reorderTasks = useTaskStore((s) => s.reorderTasks);

  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const tasks = useMemo(() => {
    let list = tasksAll.filter((t) => t.ownerId === userId && t.date !== '');
    if (statusFilter === 'active') list = list.filter((t) => !t.archived);
    if (statusFilter === 'archived') list = list.filter((t) => t.archived);
    if (statusFilter === 'completed') list = list.filter((t) => t.status === 'completed' && !t.archived);
    if (categoryFilter !== 'all') list = list.filter((t) => t.categoryId === categoryFilter);
    if (priorityFilter !== 'all') list = list.filter((t) => t.priority === priorityFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q));
    }

    const priorityRank = { High: 0, Medium: 1, Low: 2 };
    list = [...list].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sortKey === 'date') return a.date === b.date ? a.order - b.order : a.date.localeCompare(b.date);
      if (sortKey === 'priority') return priorityRank[a.priority] - priorityRank[b.priority];
      if (sortKey === 'category') return a.categoryId.localeCompare(b.categoryId);
      if (sortKey === 'status') return a.status.localeCompare(b.status);
      return a.order - b.order;
    });
    return list;
  }, [tasksAll, userId, statusFilter, categoryFilter, priorityFilter, searchQuery, sortKey]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = tasks.map((t) => t.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    reorderTasks(arrayMove(ids, oldIndex, newIndex));
  }

  if (!userId) return null;

  return (
    <AppShell>
      <TaskModal />
      <UndoBar />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Tasks</h1>
          <p className="text-ink-muted text-sm">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openAddTask}>+ New task</Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
          <option value="all">All</option>
        </Select>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-44">
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-36">
          <option value="all">All priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </Select>
        <Select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="w-44">
          <option value="date">Sort by date</option>
          <option value="priority">Sort by priority</option>
          <option value="category">Sort by category</option>
          <option value="status">Sort by status</option>
        </Select>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-20 text-ink-muted">
          {statusFilter === 'archived' ? <ArchiveIcon size={32} className="mx-auto mb-3 opacity-50" /> : <Inbox size={32} className="mx-auto mb-3 opacity-50" />}
          <p>No tasks here. {statusFilter === 'active' && 'Add your first task to get started.'}</p>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} category={categories.find((c) => c.id === task.categoryId)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </AppShell>
  );
}
