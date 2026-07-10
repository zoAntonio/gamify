import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/features/auth/services/authService';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import type { LoginRequest, RegisterRequest } from '@/features/auth/types/auth.types';

const DEMO_CREDENTIALS: RegisterRequest = {
  username: 'demo',
  email: 'demo@gamify.app',
  password: 'demo1234',
};

export const AuthPage: FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleAuthSuccess = (auth: { token: string; username: string; email: string }) => {
    setAuth(auth);
    navigate('/');
  };

  const handleLogin = async (request: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(request);
      handleAuthSuccess(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (request: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(request);
      handleAuthSuccess(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(DEMO_CREDENTIALS);
      handleAuthSuccess(response);
    } catch {
      try {
        const response = await authService.login(DEMO_CREDENTIALS);
        handleAuthSuccess(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <div className="flex flex-col justify-center gap-8 px-6 py-12 sm:px-12 lg:px-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">Gamify</p>
          <h1 className="mt-2 text-4xl font-bold">{mode === 'login' ? 'Connexion' : 'Inscription'}</h1>
          <p className="mt-2 text-sm text-text-muted">
            {mode === 'login' ? 'Connecte-toi avec ton email' : 'Crée ton compte pour commencer'}
          </p>
        </div>

        <div className="flex gap-1 rounded-control border border-border bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            disabled={mode === 'login'}
            className={[
              'flex-1 rounded-[calc(var(--radius-control)-4px)] py-2 text-sm font-medium transition-colors',
              mode === 'login' ? 'bg-accent text-white' : 'text-text-muted hover:text-text',
            ].join(' ')}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            disabled={mode === 'register'}
            className={[
              'flex-1 rounded-[calc(var(--radius-control)-4px)] py-2 text-sm font-medium transition-colors',
              mode === 'register' ? 'bg-accent text-white' : 'text-text-muted hover:text-text',
            ].join(' ')}
          >
            Inscription
          </button>
        </div>

        {mode === 'login' ? (
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        ) : (
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-text-muted">
          <span className="h-px flex-1 bg-border" />
          ou
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button type="button" variant="secondary" fullWidth onClick={handleDemo} disabled={isLoading}>
          Essayer en démo
        </Button>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-b from-[#161c3f] to-bg md:flex md:flex-col md:justify-end md:p-12">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute right-10 top-1/3 h-40 w-40 rounded-full bg-[#8aa0ff]/40 blur-2xl" />
        <div className="absolute bottom-1/4 left-1/4 h-24 w-24 rounded-full bg-white/10 blur-xl" />

        <div className="relative z-10 max-w-sm">
          <p className="text-3xl font-bold leading-tight">Ce monde a besoin de toi</p>
          <p className="mt-2 text-sm text-text-muted">
            Deviens le héros de ta propre progression.
          </p>
        </div>
      </div>
    </div>
  );
};
