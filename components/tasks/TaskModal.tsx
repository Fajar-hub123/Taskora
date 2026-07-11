'use client';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { useUIStore } from '@/lib/store/uiStore';
import { useTaskStore } from '@/lib/store/taskStore';
import { useAuthStore } from '@/lib/store/authStore';
import { Priority, RepeatRule } from '@/lib/types';
import { todayISO } from '@/lib/utils/date';

export function TaskModal() {
  const open = useUIStore((s) => s.addTaskOpen);
  const editingTaskId = useUIStore((s) => s.editingTaskId);
  const creatingBacklogTask = useUIStore((s) => s.creatingBacklogTask);
  const newTaskDate = useUIStore((s) => s.newTaskDate);
  const closeTaskModal = useUIStore((s) => s.closeTaskModal);

  const userId = useAuthStore((s) => s.currentUserId)!;
  const categories = useTaskStore((s) => s.categoriesForOwner(userId));
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);

  const editing = useMemo(() => tasks.find((t) => t.id === editingTaskId), [tasks, editingTaskId]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [reminder, setReminder] = useState(false);
  const [notes, setNotes] = useState('');
  const [repeat, setRepeat] = useState<RepeatRule>('none');
  const [isExam, setIsExam] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [saveToBacklog, setSaveToBacklog] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setTitle(editing.title);
        setDescription(editing.description);
        setCategoryId(editing.categoryId);
        setSubcategory(editing.subcategory);
        setDate(editing.date);
        setStartTime(editing.startTime);
        setEndTime(editing.endTime);
        setPriority(editing.priority);
        setReminder(editing.reminder);
        setNotes(editing.notes);
        setRepeat(editing.repeat);
        setIsExam(editing.isExam);
        setTagsInput((editing.tags ?? []).join(', '));
        setSaveToBacklog(editing.date === '');
      } else {
        setTitle('');
        setDescription('');
        setCategoryId(categories[0]?.id ?? '');
        setSubcategory('');
        const initialDate = newTaskDate ?? (creatingBacklogTask ? '' : todayISO());
        setDate(initialDate);
        setStartTime(initialDate === '' ? '' : '09:00');
        setEndTime(initialDate === '' ? '' : '10:00');
        setPriority('Medium');
        setReminder(false);
        setNotes('');
        setRepeat('none');
        setIsExam(false);
        setTagsInput('');
        setSaveToBacklog(creatingBacklogTask || initialDate === '');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingTaskId, creatingBacklogTask]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const parsedTags = tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean);

  useEffect(() => {
    if (!open || !editing) return;
    const timer = window.setTimeout(() => {
      updateTask(editing.id, {
        title: title.trim(),
        description,
        categoryId,
        subcategory,
        date: saveToBacklog ? '' : date,
        startTime: saveToBacklog ? '' : startTime,
        endTime: saveToBacklog ? '' : endTime,
        priority,
        reminder,
        notes,
        repeat,
        isExam,
        tags: parsedTags
      });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [open, editing, title, description, categoryId, subcategory, date, startTime, endTime, priority, reminder, notes, repeat, isExam, saveToBacklog, parsedTags, updateTask]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description,
      categoryId,
      subcategory,
      date: saveToBacklog ? '' : date,
      startTime: saveToBacklog ? '' : startTime,
      endTime: saveToBacklog ? '' : endTime,
      priority,
      reminder,
      notes,
      tags: parsedTags,
      repeat,
      isExam
    };
    if (editing) {
      updateTask(editing.id, payload);
    } else {
      addTask(userId, payload);
    }
    closeTaskModal();
  }

  return (
    <Modal open={open} onClose={closeTaskModal} title={editing ? 'Edit task' : 'New task'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="t-title">Title</Label>
          <Input id="t-title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Finish physics assignment" autoFocus />
        </div>
        <div>
          <Label htmlFor="t-desc">Description</Label>
          <Textarea id="t-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details…" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="t-cat">Category</Label>
            <Select id="t-cat" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubcategory(''); }}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="t-subcat">Subcategory</Label>
            <Select id="t-subcat" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} disabled={!selectedCategory?.subcategories.length}>
              <option value="">None</option>
              {selectedCategory?.subcategories.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="t-date">Date</Label>
            <Input id="t-date" type="date" required={!saveToBacklog} disabled={saveToBacklog} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="t-start">Start</Label>
            <Input id="t-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={saveToBacklog} />
          </div>
          <div>
            <Label htmlFor="t-end">End</Label>
            <Input id="t-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={saveToBacklog} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="t-priority">Priority</Label>
            <Select id="t-priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="t-repeat">Repeat</Label>
            <Select id="t-repeat" value={repeat} onChange={(e) => setRepeat(e.target.value as RepeatRule)}>
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="t-tags">Tags</Label>
          <Input
            id="t-tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Comma-separated tags"
          />
        </div>

        <div>
          <Label htmlFor="t-notes">Notes</Label>
          <Textarea id="t-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any extra notes…" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <span className="text-sm">Save directly to backlog</span>
            <Toggle checked={saveToBacklog} onChange={setSaveToBacklog} label="Backlog" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <span className="text-sm">This is an exam</span>
            <Toggle checked={isExam} onChange={setIsExam} label="Exam" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <span className="text-sm">Remind me</span>
          <Toggle checked={reminder} onChange={setReminder} label="Reminder" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={closeTaskModal}>
            Cancel
          </Button>
          <Button type="submit">{editing ? 'Save changes' : 'Add task'}</Button>
        </div>
      </form>
    </Modal>
  );
}
