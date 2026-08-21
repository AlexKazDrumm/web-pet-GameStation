import type { PublicUser } from '@gamestation/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: PublicUser | null;
  setSession: (token: string, user: PublicUser) => void;
  setUser: (user: PublicUser) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      clear: () => set({ token: null, user: null }),
    }),
    {
      name: 'gamestation.auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);

export const getToken = (): string | null => useAuthStore.getState().token;
export const clearSession = (): void => useAuthStore.getState().clear();
