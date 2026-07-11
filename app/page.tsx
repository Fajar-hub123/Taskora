'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { TaskoraLogo } from '@/components/logo/TaskoraLogo';

export default function Home() {
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.currentUserId);

  useEffect(() => {
    router.replace(currentUserId ? '/dashboard' : '/login');
  }, [currentUserId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center theme-dark bg-surface">
      <div className="animate-pulse">
        <TaskoraLogo size={56} />
      </div>
    </div>
  );
}
