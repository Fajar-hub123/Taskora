'use client';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useTaskStore } from '@/lib/store/taskStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Pencil, Trash2, GripVertical, GraduationCap, Clapperboard, Heart, Folder } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Category } from '@/lib/types';

const ICONS: Record<string, any> = { GraduationCap, Clapperboard, Heart, Folder };
const SWATCHES = ['#8b5cf6', '#3b82f6', '#2dd4bf', '#f472b6', '#f59e0b', '#ef4444', '#22c55e', '#eab308'];

function CategoryRow({ category, onEdit }: { category: Category; onEdit: (c: Category) => void }) {
  const deleteCategory = useTaskStore((s) => s.deleteCategory);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const Icon = ICONS[category.icon] ?? Folder;

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/60 px-4 py-3">
      <button {...attributes} {...listeners} className="cursor-grab text-ink-muted">
        <GripVertical size={16} />
      </button>
      <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: category.color + '25' }}>
        <Icon size={17} style={{ color: category.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{category.name}</p>
        <p className="text-xs text-ink-muted truncate">{category.subcategories.join(', ') || 'No subcategories'}</p>
      </div>
      <button onClick={() => onEdit(category)} className="p-1.5 rounded-md hover:bg-surface-3 text-ink-muted hover:text-ink">
        <Pencil size={14} />
      </button>
      <button onClick={() => deleteCategory(category.id)} className="p-1.5 rounded-md hover:bg-surface-3 text-ink-muted hover:text-red-400">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function CategoriesPage() {
  const userId = useRequireAuth();
  const categories = useTaskStore((s) => s.categoriesForOwner(userId ?? ''));
  const addCategory = useTaskStore((s) => s.addCategory);
  const updateCategory = useTaskStore((s) => s.updateCategory);
  const reorderCategories = useTaskStore((s) => s.reorderCategories);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(SWATCHES[0]);
  const [subcatsText, setSubcatsText] = useState('');

  function openNew() {
    setEditing(null);
    setName('');
    setColor(SWATCHES[0]);
    setSubcatsText('');
    setModalOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setName(c.name);
    setColor(c.color);
    setSubcatsText(c.subcategories.join(', '));
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subcategories = subcatsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (editing) {
      updateCategory(editing.id, { name, color, subcategories });
    } else if (userId) {
      addCategory(userId, { name, color, subcategories, group: 'Custom', icon: 'Folder' });
    }
    setModalOpen(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = categories.map((c) => c.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    reorderCategories(arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Categories</h1>
          <p className="text-ink-muted text-sm">Organize tasks with categories, subcategories, colors and icons.</p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} /> New category
        </Button>
      </div>

      <Card>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {categories.map((c) => (
                <CategoryRow key={c.id} category={c} onEdit={openEdit} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit category' : 'New category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="c-name">Name</Label>
            <Input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sports" />
          </div>
          <div>
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {SWATCHES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setColor(s)}
                  className="h-8 w-8 rounded-full border-2"
                  style={{ backgroundColor: s, borderColor: color === s ? '#fff' : 'transparent' }}
                />
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="c-subs">Subcategories (comma-separated)</Label>
            <Input id="c-subs" value={subcatsText} onChange={(e) => setSubcatsText(e.target.value)} placeholder="Football, Cricket, Gym" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
