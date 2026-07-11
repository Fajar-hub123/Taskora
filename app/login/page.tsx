'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input, Label } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/authStore';
import { Eye, EyeOff, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const resetPasswordLocal = useAuthStore((s) => s.resetPasswordLocal);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? 'Something went wrong.');
      return;
    }
    router.push('/dashboard');
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setForgotMsg('');
    const res = await resetPasswordLocal(forgotEmail, newPassword);
    if (!res.ok) {
      setForgotMsg(res.error ?? 'Could not reset password.');
      return;
    }
    setForgotMsg('Password updated. You can log in now.');
  }

  if (forgotMode) {
    return (
      <AuthShell title="Reset your password" subtitle="Verify your email and choose a new password.">
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <Label htmlFor="femail">Email</Label>
            <Input id="femail" type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@school.edu" />
          </div>
          <div>
            <Label htmlFor="npass">New password</Label>
            <Input id="npass" type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {forgotMsg && <p className="text-sm text-mint-400">{forgotMsg}</p>}
          <Button type="submit" className="w-full">
            <KeyRound size={16} /> Update password
          </Button>
          <button type="button" onClick={() => setForgotMode(false)} className="text-sm text-ink-muted hover:text-ink w-full text-center">
            Back to login
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to keep your streak going.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" autoFocus />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="button" onClick={() => setForgotMode(true)} className="text-xs text-accent hover:underline">
            Forgot password?
          </button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <p className="text-sm text-ink-muted mt-6 text-center">
        New to Taskora?{' '}
        <Link href="/signup" className="text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
