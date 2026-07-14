import { create } from 'zustand';

import type { UserInfo } from '@/types/auth';

interface AuthState {
  user: UserInfo | null;
  isLoggedIn: boolean;
  setAuth: (token: string, user: UserInfo) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  setAuth: (token, user) => {
    localStorage.setItem('accessToken', token);
    set({ user, isLoggedIn: true });
  },
  clearAuth: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, isLoggedIn: false });
  },
}));
