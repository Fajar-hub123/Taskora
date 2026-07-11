'use client';
import { Card } from '@/components/ui/Card';
import { User } from '@/lib/types';
import { calcAge } from '@/lib/utils/date';
import { School, GraduationCap, Cake } from 'lucide-react';

export function ProfileCard({ user }: { user: User }) {
  return (
    <Card className="flex items-center gap-4">
      {user.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatar} alt="" className="h-16 w-16 rounded-2xl object-cover shrink-0" />
      ) : (
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-mint-500 flex items-center justify-center text-xl font-semibold shrink-0">
          {user.fullName[0]}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-display text-lg font-semibold truncate">{user.fullName}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-ink-muted">
          <span className="flex items-center gap-1">
            <Cake size={12} /> {calcAge(user.dob)} years
          </span>
          <span className="flex items-center gap-1">
            <School size={12} /> {user.school}
          </span>
          <span className="flex items-center gap-1">
            <GraduationCap size={12} /> {user.className}
          </span>
        </div>
      </div>
    </Card>
  );
}
