'use client';
import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useTaskStore } from '@/lib/store/taskStore';
import { useUIStore } from '@/lib/store/uiStore';
import { TaskModal } from '@/components/tasks/TaskModal';
import { UndoBar } from '@/components/tasks/UndoBar';
import { TaskRow } from '@/components/tasks/TaskRow';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { todayISO } from '@/lib/utils/date';
import { Inbox } from 'lucide-react';

type SortKey = 'newest' | 'oldest' | 'az' | 'za' | 'high' | 'low';

export default function BacklogPage() {
  const userId = useRequireAuth();
  const openAddTask = useUIStore((s) => s.openAddTask);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const tasksAll = useTaskStore((s) => s.tasks);
  const categories = useTaskStore((s) => s.categoriesForOwner(userId ?? ''));
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const togglePin = useTaskStore((s) => s.togglePin);
  const updateTask = useTaskStore((s) => s.updateTask);
  const moveTaskToDate = useTaskStore((s) => s.moveTaskToDate);
  const reorderTasks = useTaskStore((s) => s.reorderTasks);

  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [pinnedFilter, setPinnedFilter] = useState('all');
  const [favoriteFilter, setFavoriteFilter] = useState('all');
  const [recentFilter, setRecentFilter] = useState('all');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const backlogTasks = useMemo(
    () => tasksAll.filter((t) => t.ownerId === userId && !t.archived && t.date === ''),
    [tasksAll, userId]
  );

  const filteredTasks = useMemo(() => {
    let list = [...backlogTasks];
    if (categoryFilter !== 'all') list = list.filter((t) => t.categoryId === categoryFilter);
    if (priorityFilter !== 'all') list = list.filter((t) => t.priority === priorityFilter);
    if (pinnedFilter !== 'all') list = list.filter((t) => (pinnedFilter === 'pinned' ? t.pinned : !t.pinned));
    if (favoriteFilter !== 'all') list = list.filter((t) => (favoriteFilter === 'favorite' ? t.favorite : !t.favorite));
    if (recentFilter === 'recent') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      list = list.filter((t) => new Date(t.createdAt) >= cutoff);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          (t.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
      );
    }

    const priorityRank = { High: 0, Medium: 1, Low: 2 } as const;
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sortKey === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sortKey === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sortKey === 'az') return a.title.localeCompare(b.title);
      if (sortKey === 'za') return b.title.localeCompare(a.title);
      if (sortKey === 'high') return priorityRank[a.priority] - priorityRank[b.priority];
      if (sortKey === 'low') return priorityRank[b.priority] - priorityRank[a.priority];
      return 0;
    });
    return list;
  }, [backlogTasks, categoryFilter, priorityFilter, pinnedFilter, favoriteFilter, recentFilter, searchQuery, sortKey]);

  const stats = useMemo(
    () => ({
      total: backlogTasks.length,
      high: backlogTasks.filter((t) => t.priority === 'High').length,
      medium: backlogTasks.filter((t) => t.priority === 'Medium').length,
      low: backlogTasks.filter((t) => t.priority === 'Low').length,
      pinned: backlogTasks.filter((t) => t.pinned).length,
      completed: backlogTasks.filter((t) => t.status === 'completed').length
    }),
    [backlogTasks]
  );

  function handleSelect(id: string) {
    setSelectedTaskIds((ids) =>
      ids.includes(id) ? ids.filter((selectedId) => selectedId !== id) : [...ids, id]
    );
  }

  function selectAll() {
    setSelectedTaskIds(filteredTasks.map((t) => t.id));
  }

  function clearSelection() {
    setSelectedTaskIds([]);
  }

  function handleBulkDelete() {
    selectedTaskIds.forEach((id) => deleteTask(id));
    clearSelection();
  }

  function handleBulkPin(value: boolean) {
    selectedTaskIds.forEach((id) => updateTask(id, { pinned: value }));
  }

  function handleBulkCategoryChange(categoryId: string) {
    selectedTaskIds.forEach((id) => updateTask(id, { categoryId }));
  }

  function handleBulkPriorityChange(priority: string) {
    selectedTaskIds.forEach((id) => updateTask(id, { priority: priority as 'Low' | 'Medium' | 'High' }));
  }

  function handleBulkScheduleToday() {
    const today = todayISO();
    selectedTaskIds.forEach((id) => moveTaskToDate(id, today));
    clearSelection();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = filteredTasks.map((t) => t.id);
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
          <h1 className="font-display text-2xl font-semibold">Backlog</h1>
          <p className="text-ink-muted text-sm">{stats.total} task{stats.total !== 1 ? 's' : ''} waiting to be scheduled.</p>
        </div>
        <Button onClick={() => openAddTask(true)}>
          <Inbox size={16} /> New backlog task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Card className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink-muted">Total backlog</p>
          <p className="text-3xl font-semibold">{stats.total}</p>
        </Card>
        <Card className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink-muted">High priority</p>
          <p className="text-2xl font-semibold">{stats.high}</p>
        </Card>
        <Card className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink-muted">Medium priority</p>
          <p className="text-2xl font-semibold">{stats.medium}</p>
        </Card>
        <Card className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink-muted">Low priority</p>
          <p className="text-2xl font-semibold">{stats.low}</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-52">
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-40">
          <option value="all">All priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </Select>
        <Select value={pinnedFilter} onChange={(e) => setPinnedFilter(e.target.value)} className="w-40">
          <option value="all">All tasks</option>
          <option value="pinned">Pinned</option>
          <option value="unpinned">Unpinned</option>
        </Select>
        <Select value={favoriteFilter} onChange={(e) => setFavoriteFilter(e.target.value)} className="w-44">
          <option value="all">All tasks</option>
          <option value="favorite">Favorites</option>
          <option value="not-favorite">Not favorite</option>
        </Select>
        <Select value={recentFilter} onChange={(e) => setRecentFilter(e.target.value)} className="w-44">
          <option value="all">All items</option>
          <option value="recent">Recently added</option>
        </Select>
        <Select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="w-52">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="az">A–Z</option>
          <option value="za">Z–A</option>
          <option value="high">High priority first</option>
          <option value="low">Low priority first</option>
        </Select>
      </div>

      {selectedTaskIds.length > 0 && (
        <div className="mb-5 rounded-2xl border border-border bg-surface-2 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-ink-muted">{selectedTaskIds.length} selected</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={selectAll}>
              Select all
            </Button>
            <Button variant="secondary" size="sm" onClick={handleBulkDelete}>
              Delete selected
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleBulkPin(true)}>
              Pin selected
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleBulkPin(false)}>
              Unpin selected
            </Button>
            <Select className="w-52" value="" onChange={(e) => handleBulkCategoryChange(e.target.value)}>
              <option value="">Bulk category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Select className="w-44" value="" onChange={(e) => handleBulkPriorityChange(e.target.value)}>
              <option value="">Bulk priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Select>
            <Button variant="secondary" size="sm" onClick={handleBulkScheduleToday}>
              Schedule today
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="text-center py-20 text-ink-muted">
          <Inbox size={32} className="mx-auto mb-3 opacity-50" />
          <h2 className="text-lg font-semibold">Your backlog is empty</h2>
          <p className="mt-2 text-sm">Add a few tasks you want to schedule later. Backlog tasks can be moved to Tasks or Calendar when you're ready.</p>
          <div className="mt-5 flex justify-center">
            <Button onClick={() => openAddTask(true)}>Add first backlog task</Button>
          </div>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 rounded-2xl border border-border bg-surface-2 p-3">
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.includes(task.id)}
                    onChange={() => handleSelect(task.id)}
                    className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-0"
                  />
                  <TaskRow task={task} category={categories.find((c) => c.id === task.categoryId)} />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </AppShell>
  );
}
