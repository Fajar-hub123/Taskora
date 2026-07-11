'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useTaskStore } from '@/lib/store/taskStore';

export function useRequireAuth() {
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const ensureSeedCategories = useTaskStore((s) => s.ensureSeedCategories);

  useEffect(() => {
    if (!currentUserId) {
      router.replace('/login');
    } else {
      ensureSeedCategories(currentUserId);
    }
  }, [currentUserId, router, ensureSeedCategories]);

  return currentUserId;
}
