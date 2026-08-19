import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  username: string | null;
  email: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  setAuth: (auth: { token: string; username: string; email: string; isAdmin: boolean }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      email: null,
      isAdmin: false,
      isAuthenticated: false,
      setAuth: ({ token, username, email, isAdmin }) =>
        set({ token, username, email, isAdmin, isAuthenticated: true }),
      logout: () =>
        set({ token: null, username: null, email: null, isAdmin: false, isAuthenticated: false }),
    }),
    { name: 'gamify-auth' },
  ),
);
