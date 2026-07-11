import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { hashPassword, makeId } from '../utils/id';

interface SignUpInput {
  fullName: string;
  dob: string;
  school: string;
  className: string;
  email: string;
  password: string;
  avatar?: string;
}

interface AuthState {
  users: User[];
  currentUserId: string | null;
  signUp: (input: SignUpInput) => Promise<{ ok: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  updateProfile: (patch: Partial<Omit<User, 'id' | 'passwordHash'>>) => void;
  resetPasswordLocal: (email: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  currentUser: () => User | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,

      currentUser: () => {
        const { users, currentUserId } = get();
        return users.find((u) => u.id === currentUserId) ?? null;
      },

      signUp: async (input) => {
        const { users } = get();
        if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
          return { ok: false, error: 'An account with this email already exists.' };
        }
        const id = makeId();
        const passwordHash = await hashPassword(input.password, id);
        const user: User = {
          id,
          fullName: input.fullName,
          dob: input.dob,
          school: input.school,
          className: input.className,
          email: input.email,
          passwordHash,
          avatar: input.avatar,
          createdAt: new Date().toISOString()
        };
        set({ users: [...users, user], currentUserId: user.id });
        return { ok: true };
      },

      login: async (email, password) => {
        const { users } = get();
        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return { ok: false, error: 'No account found with this email.' };
        const hash = await hashPassword(password, user.id);
        if (hash !== user.passwordHash) return { ok: false, error: 'Incorrect password.' };
        set({ currentUserId: user.id });
        return { ok: true };
      },

      logout: () => set({ currentUserId: null }),

      changePassword: async (oldPassword, newPassword) => {
        const { users, currentUserId } = get();
        const user = users.find((u) => u.id === currentUserId);
        if (!user) return { ok: false, error: 'Not signed in.' };
        const oldHash = await hashPassword(oldPassword, user.id);
        if (oldHash !== user.passwordHash) return { ok: false, error: 'Current password is incorrect.' };
        const newHash = await hashPassword(newPassword, user.id);
        set({
          users: users.map((u) => (u.id === user.id ? { ...u, passwordHash: newHash } : u))
        });
        return { ok: true };
      },

      resetPasswordLocal: async (email, newPassword) => {
        const { users } = get();
        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return { ok: false, error: 'No account found with this email.' };
        const newHash = await hashPassword(newPassword, user.id);
        set({
          users: users.map((u) => (u.id === user.id ? { ...u, passwordHash: newHash } : u))
        });
        return { ok: true };
      },

      updateProfile: (patch) => {
        const { users, currentUserId } = get();
        set({
          users: users.map((u) => (u.id === currentUserId ? { ...u, ...patch } : u))
        });
      }
    }),
    { name: 'taskora-auth' }
  )
);
