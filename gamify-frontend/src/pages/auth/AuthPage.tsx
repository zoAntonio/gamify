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

  const handleAuthSuccess = (auth: {
    token: string;
    username: string;
    email: string;
    isAdmin: boolean;
  }) => {
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
    <div className="flex min-h-svh items-center justify-center px-6 py-10">
      <div className="flex w-full max-w-[360px] flex-col gap-5 rounded-card bg-surface-3 p-7 shadow-modal">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-control bg-surface-2 font-display text-[18px] font-medium text-heading shadow-subtle">
            G
          </span>
          <h1 className="font-display text-[20px] font-medium tracking-tight text-heading">
            {mode === 'login' ? 'Connexion à Gamify' : 'Créer un compte Gamify'}
          </h1>
        </div>

        <div className="flex gap-0.5 rounded-control bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            disabled={mode === 'login'}
            className={[
              'flex-1 rounded-control py-1 text-[13px] font-medium transition-colors',
              mode === 'login' ? 'bg-surface-3 text-white shadow-subtle' : 'text-text-muted',
            ].join(' ')}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            disabled={mode === 'register'}
            className={[
              'flex-1 rounded-control py-1 text-[13px] font-medium transition-colors',
              mode === 'register' ? 'bg-surface-3 text-white shadow-subtle' : 'text-text-muted',
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

        {error && <p className="text-center text-[13px] text-danger">{error}</p>}

        <div className="flex items-center gap-3 text-[12px] text-text-muted">
          <span className="h-px flex-1 bg-border" />
          ou
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button type="button" variant="secondary" fullWidth onClick={handleDemo} disabled={isLoading}>
          Essayer en démo
        </Button>
      </div>
    </div>
  );
};
