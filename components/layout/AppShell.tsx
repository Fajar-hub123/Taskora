'use client';
import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ListChecks,
  CalendarDays,
  BarChart3,
  Sparkles,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Plus,
  Menu,
  X,
  FolderKanban,
  Inbox
} from 'lucide-react';
import { TaskoraMark } from '@/components/logo/TaskoraLogo';
import { ToraLogo } from '@/components/logo/ToraLogo';
import { useAuthStore } from '@/lib/store/authStore';
import { useUIStore } from '@/lib/store/uiStore';
import { useSmartReminders } from '@/lib/hooks/useSmartReminders';
import { Input } from '@/components/ui/Input';
import clsx from 'clsx';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: ListChecks },
  { href: '/backlog', label: 'Backlog', icon: Inbox },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/categories', label: 'Categories', icon: FolderKanban },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/tora', label: 'Tora AI', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: SettingsIcon }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.currentUser());
  const openAddTask = useUIStore((s) => s.openAddTask);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const [mobileOpen, setMobileOpen] = useState(false);
  useSmartReminders();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;
      if (e.key === '/' && !typing) {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
      if (e.key.toLowerCase() === 'n' && !typing) {
        e.preventDefault();
        openAddTask();
      }
      if (e.key.toLowerCase() === 'g' && !typing) {
        // simple "g then d/t/c/r" nav could go here; kept minimal
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openAddTask]);

  return (
    <div className="min-h-screen flex bg-surface text-ink">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-surface-2 p-5">
        <Link href="/dashboard" className="flex items-center gap-2.5 mb-8 px-1">
          <TaskoraMark size={32} />
          <span className="font-display text-lg font-semibold">
            Task<span className="gradient-text">ora</span>
          </span>
        </Link>
        <nav className="flex-1 space-y-1">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-colors',
                  active ? 'bg-gradient-to-r from-violet-500/20 to-mint-500/10 text-ink border border-accent/30' : 'text-ink-muted hover:bg-surface-3 hover:text-ink'
                )}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center gap-2.5 px-1 mb-3">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-mint-500 flex items-center justify-center text-xs font-semibold">
                {user?.fullName?.[0] ?? '?'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-ink-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="flex items-center gap-2 px-3 h-9 rounded-lg text-sm text-ink-muted hover:bg-surface-3 hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-surface-2 border-r border-border p-5 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <TaskoraMark size={28} />
                <span className="font-display text-base font-semibold">Taskora</span>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium',
                    pathname?.startsWith(item.href) ? 'bg-surface-3 text-ink' : 'text-ink-muted'
                  )}
                >
                  <item.icon size={17} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-surface-2/60 backdrop-blur flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-30">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <Input
              id="global-search"
              placeholder="Search tasks…  (press /)"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => router.push('/tora')}
              className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border border-border hover:bg-surface-3 text-sm"
              title="Ask Tora"
            >
              <ToraLogo size={20} rounded={false} />
              Ask Tora
            </button>
            <button
              onClick={() => openAddTask()}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-gradient-to-r from-violet-500 via-blue-500 to-mint-500 text-white text-sm font-medium shadow-glow"
              title="New task (n)"
            >
              <Plus size={16} /> New task
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
