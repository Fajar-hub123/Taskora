'use client';
import { useRef, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/store/authStore';
import { useTaskStore } from '@/lib/store/taskStore';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { Card, CardTitle } from '@/components/ui/Card';
import { Input, Label } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ThemeName, Layout, Lang } from '@/lib/types';
import { Download, Upload, Check } from 'lucide-react';
import clsx from 'clsx';

const THEME_OPTIONS: { value: ThemeName; label: string; swatch: string }[] = [
  { value: 'dark', label: 'Dark', swatch: 'linear-gradient(135deg,#0b0e1a,#1e1b4b)' },
  { value: 'light', label: 'Light', swatch: 'linear-gradient(135deg,#ffffff,#ede9fe)' },
  { value: 'pink', label: 'Pink', swatch: 'linear-gradient(135deg,#500724,#831843)' },
  { value: 'blue', label: 'Blue', swatch: 'linear-gradient(135deg,#020617,#1e3a8a)' }
];

export default function SettingsPage() {
  const userId = useRequireAuth();
  const user = useAuthStore((s) => s.currentUser());
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const changePassword = useAuthStore((s) => s.changePassword);
  const users = useAuthStore((s) => s.users);
  const tasks = useTaskStore((s) => s.tasks);
  const categories = useTaskStore((s) => s.categories);
  const activity = useTaskStore((s) => s.activity);

  const { theme, layout, lang, setTheme, setLayout, setLang } = useSettingsStore();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [school, setSchool] = useState(user?.school ?? '');
  const [className, setClassName] = useState(user?.className ?? '');
  const [profileSaved, setProfileSaved] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({ fullName, school, className });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg('');
    const res = await changePassword(oldPassword, newPassword);
    setPwMsg(res.ok ? 'Password updated successfully.' : res.error ?? 'Failed to update password.');
    if (res.ok) {
      setOldPassword('');
      setNewPassword('');
    }
  }

  function backup() {
    const payload = { users, tasks, categories, activity, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskora-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function restore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        useAuthStore.setState({ users: data.users ?? [] });
        useTaskStore.setState({ tasks: data.tasks ?? [], categories: data.categories ?? [], activity: data.activity ?? [] });
        alert('Backup restored. You may need to log in again.');
      } catch {
        alert('Could not read this backup file.');
      }
    };
    reader.readAsText(file);
  }

  if (!user) return null;

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardTitle className="mb-4">Profile</CardTitle>
          <form onSubmit={saveProfile} className="space-y-3">
            <div>
              <Label htmlFor="s-name">Full name</Label>
              <Input id="s-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="s-school">School</Label>
                <Input id="s-school" value={school} onChange={(e) => setSchool(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="s-class">Class</Label>
                <Input id="s-class" value={className} onChange={(e) => setClassName(e.target.value)} />
              </div>
            </div>
            <Button type="submit" size="sm">
              {profileSaved ? (
                <>
                  <Check size={14} /> Saved
                </>
              ) : (
                'Save profile'
              )}
            </Button>
          </form>
        </Card>

        <Card>
          <CardTitle className="mb-4">Change password</CardTitle>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <Label htmlFor="s-old">Current password</Label>
              <Input id="s-old" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="s-new">New password</Label>
              <Input id="s-new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
            </div>
            {pwMsg && <p className={clsx('text-sm', pwMsg.includes('success') ? 'text-mint-400' : 'text-red-400')}>{pwMsg}</p>}
            <Button type="submit" size="sm">
              Update password
            </Button>
          </form>
        </Card>

        <Card>
          <CardTitle className="mb-4">Theme</CardTitle>
          <div className="grid grid-cols-4 gap-3">
            {THEME_OPTIONS.map((t) => (
              <button key={t.value} onClick={() => setTheme(t.value)} className="flex flex-col items-center gap-1.5">
                <span
                  className={clsx('h-12 w-full rounded-lg border-2', theme === t.value ? 'border-accent' : 'border-transparent')}
                  style={{ background: t.swatch }}
                />
                <span className="text-xs text-ink-muted">{t.label}</span>
              </button>
            ))}
          </div>

          <CardTitle className="mt-6 mb-3">Layout</CardTitle>
          <div className="flex gap-2">
            {(['comfortable', 'compact'] as Layout[]).map((l) => (
              <button
                key={l}
                onClick={() => setLayout(l)}
                className={clsx('h-9 px-4 rounded-lg text-sm border capitalize', layout === l ? 'bg-accent/20 border-accent/40' : 'border-border hover:bg-surface-3')}
              >
                {l}
              </button>
            ))}
          </div>

          <CardTitle className="mt-6 mb-3">Language</CardTitle>
          <div className="flex gap-2">
            {(['en', 'ur'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={clsx('h-9 px-4 rounded-lg text-sm border', lang === l ? 'bg-accent/20 border-accent/40' : 'border-border hover:bg-surface-3')}
              >
                {l === 'en' ? 'English' : 'اردو'}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-4">Data management</CardTitle>
          <p className="text-sm text-ink-muted mb-4">
            Taskora auto-saves everything to this browser as you go. Back up your data as a file, or restore from a previous backup.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={backup}>
              <Download size={14} /> Backup
            </Button>
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload size={14} /> Restore
            </Button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={restore} />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
