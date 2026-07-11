'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useTaskStore } from '@/lib/store/taskStore';
import { Undo2 } from 'lucide-react';

export function UndoBar() {
  const lastDeleted = useTaskStore((s) => s.lastDeleted);
  const undoDelete = useTaskStore((s) => s.undoDelete);

  return (
    <AnimatePresence>
      {lastDeleted && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass rounded-full px-4 py-2.5 flex items-center gap-3 shadow-glass"
        >
          <span className="text-sm">Deleted "{lastDeleted.title}"</span>
          <button onClick={undoDelete} className="flex items-center gap-1 text-sm text-accent font-medium hover:underline">
            <Undo2 size={14} /> Undo
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
