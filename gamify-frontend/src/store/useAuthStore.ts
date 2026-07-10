import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  username: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setAuth: (auth: { token: string; username: string; email: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      email: null,
      isAuthenticated: false,
      setAuth: ({ token, username, email }) =>
        set({ token, username, email, isAuthenticated: true }),
      logout: () => set({ token: null, username: null, email: null, isAuthenticated: false }),
    }),
    { name: 'gamify-auth' },
  ),
);
